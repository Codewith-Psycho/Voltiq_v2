# routers/optimize.py - ML→MILP Optimization Pipeline
"""
Main optimization endpoint.
Runs: LFE → BHV → OPC → MILP
Caches results in Redis.
Persists to Supabase.
Frontend-compatible response format.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from services.redis_client import redis_manager
from db.supabase import supabase_client
from milp.solver import solve_with_ml, MILPSolver
from simulator.meter_sim import generate_history
from datetime import datetime
import asyncio
import json

router = APIRouter()


class OptimizeRequest(BaseModel):
    user_id: str = 'demo'
    balance: float = 247.0
    appliances: Optional[List[Dict]] = None
    force_on: Optional[Dict[str, int]] = None


class OptimizeResponse(BaseModel):
    schedule: List[Dict]
    total_cost: float
    baseline_cost: float
    savings_rs: float
    savings_pct: float
    solve_time_ms: float
    pipeline: str


def format_time_label(hour: int) -> str:
    """Convert hour to readable time like '5:00 AM'"""
    if hour == 0:
        return '12:00 AM'
    elif hour < 12:
        return f'{hour}:00 AM'
    elif hour == 12:
        return '12:00 PM'
    else:
        return f'{hour - 12}:00 PM'


def get_tariff_zone(hour: int) -> str:
    """Get tariff zone for frontend: peak, mid, sasta"""
    from simulator.tariff import UPPCL_TARIFF
    rate = UPPCL_TARIFF.get(hour, 4.9)
    if rate == 3.5:
        return 'sasta'
    elif rate >= 8.0:
        return 'peak'
    else:
        return 'mid'


def transform_to_frontend_format(backend_result: dict) -> dict:
    """
    Transform backend MILP result to frontend OptimizationResult format.
    
    Frontend expects:
    {
        originalCost, optimizedCost, savings, savingsPercent,
        schedule: [{ applianceId, applianceName, scheduledTime, status, tariffZone }],
        solveTimeMs, pipeline
    }
    """
    # Transform schedule
    frontend_schedule = []
    appliance_name_map = {
        'geyser': 'Geyser',
        'washing_machine': 'Washing Machine',
        'wm': 'Washing Machine',
        'ac': 'Air Conditioner'
    }
    
    for item in backend_result.get('schedule', []):
        app_id = item.get('appliance', 'unknown')
        frontend_schedule.append({
            'applianceId': app_id,
            'applianceName': appliance_name_map.get(app_id, app_id.title()),
            'scheduledTime': format_time_label(item.get('hour', 0)),
            'status': 'scheduled',
            'tariffZone': get_tariff_zone(item.get('hour', 0))
        })
    
    # Deduplicate by applianceId (keep first occurrence - earliest time)
    seen = set()
    unique_schedule = []
    for item in frontend_schedule:
        if item['applianceId'] not in seen:
            seen.add(item['applianceId'])
            unique_schedule.append(item)
    
    return {
        # Frontend format
        'originalCost': backend_result.get('baseline_cost', 0),
        'optimizedCost': backend_result.get('total_cost', 0),
        'savings': backend_result.get('savings_rs', 0),
        'savingsPercent': backend_result.get('savings_pct', 0),
        'schedule': unique_schedule,
        'solveTimeMs': backend_result.get('solve_time_ms', 0),
        'pipeline': 'LFE → BHV → OPC → MILP',
        # Also include backend format for compatibility
        **backend_result
    }


@router.post('/optimize')
async def optimize(request: OptimizeRequest = None):
    """
    Run full ML→MILP optimization pipeline.
    
    Pipeline:
    1. Fetch 672 readings from Redis (or generate dummy)
    2. Run LFE, OPC, BHV models in parallel
    3. Run MILP solver with ML outputs
    4. Cache results
    5. Run NILM in background
    """
    if request is None:
        request = OptimizeRequest()
    
    user_id = request.user_id
    balance = request.balance
    
    # Import models from main (loaded at startup)
    from main import models
    
    # Step 1: Get meter history from Redis
    history = await redis_manager.get_meter_history(user_id, 672)
    
    if len(history) < 672:
        # Generate dummy history for testing
        history = generate_history(meter_id=user_id, readings=672)
        # Cache for future use
        for reading in reversed(history):
            await redis_manager.push_meter_history(user_id, reading)
    
    # Extract kW values
    kw_672 = [r.get('active_power_kw', r.get('kw', 0.8)) for r in history]
    kw_8 = kw_672[-8:] if len(kw_672) >= 8 else [0.8] * 8
    kw_48 = kw_672[-48:] if len(kw_672) >= 48 else [0.8] * 48
    
    # Build behavior model inputs
    today_24 = [1 if k > 0.5 else 0 for k in kw_48[-24:]]
    yesterday_24 = [1 if k > 0.5 else 0 for k in kw_48[:24]]
    is_weekend = datetime.now().weekday() >= 5
    
    # Step 2: Run ML models in parallel
    lfe_result, opc_result, bhv_result = await asyncio.gather(
        asyncio.to_thread(models['lfe'].predict, kw_672),
        asyncio.to_thread(models['opc'].predict_24hr),
        asyncio.to_thread(models['bhv'].predict_probs, today_24, yesterday_24, is_weekend)
    )
    
    # Step 3: Cache ML results in Redis
    await asyncio.gather(
        redis_manager.cache_lfe(user_id, lfe_result),
        redis_manager.cache_outage(opc_result),
        redis_manager.cache_behavior(user_id, bhv_result)
    )
    
    # Step 4: Extract outage blocked hours
    blocked_hours = [w['hour'] for w in opc_result if w['is_high_risk']]
    
    # Build behavior probs per appliance
    behavior_probs = {
        'geyser': bhv_result,
        'washing_machine': bhv_result,
        'ac': bhv_result
    }
    
    # Step 5: Run MILP solver
    milp_result = solve_with_ml(
        appliances=request.appliances,
        balance=balance,
        lfe_baseline=lfe_result['baseline_hourly'],
        lfe_p90=lfe_result['p90_hourly'],
        lfe_peak_prob=lfe_result['peak_prob_hourly'],
        behavior_probs=behavior_probs,
        outage_windows=blocked_hours,
        force_on=request.force_on
    )
    
    # Step 6: Cache MILP result in Redis
    await redis_manager.cache_schedule(user_id, milp_result)
    
    # Step 7: Persist to Supabase (non-blocking)
    async def persist_to_supabase():
        try:
            # Save MILP result
            await supabase_client.save_milp_result(user_id, {
                'total_cost': milp_result.get('total_cost', 0),
                'baseline_cost': milp_result.get('baseline_cost', 0),
                'savings_rs': milp_result.get('savings_rs', 0),
                'savings_pct': milp_result.get('savings_pct', 0),
                'solve_time_ms': milp_result.get('solve_time_ms', 0),
                'outage_blocked': blocked_hours,
                'pipeline': 'LFE→BHV→OPC→MILP'
            })
            
            # Save individual schedules
            schedules_to_save = []
            for item in milp_result.get('schedule', []):
                schedules_to_save.append({
                    'user_id': user_id,
                    'appliance': item.get('appliance', 'unknown'),
                    'hour': item.get('hour', 0),
                    'cost_rs': item.get('cost_rs', 0),
                    'tariff_rate': item.get('tariff_rate', 0),
                    'tariff_slot': item.get('tariff_slot', 'unknown'),
                    'scheduled_date': datetime.now().date().isoformat()
                })
            
            if schedules_to_save:
                await supabase_client.save_schedules(schedules_to_save)
        except Exception as e:
            print(f"Supabase persist error: {e}")
    
    asyncio.create_task(persist_to_supabase())
    
    # Step 8: Run NILM in background (non-blocking)
    async def run_nilm():
        nilm_result = models['nilm'].detect(kw_8)
        await redis_manager.cache_nilm(user_id, nilm_result)
    
    asyncio.create_task(run_nilm())
    
    # Add ML summary to result
    milp_result['ml_summary'] = {
        'lfe_avg_baseline': round(sum(lfe_result['baseline_hourly']) / 24, 2),
        'opc_blocked_hours': blocked_hours,
        'opc_risk_count': len(blocked_hours),
        'bhv_top_hours': sorted(bhv_result.items(), key=lambda x: -x[1])[:3]
    }
    
    # Transform to frontend-compatible format
    return transform_to_frontend_format(milp_result)


@router.get('/schedule/{user_id}')
async def get_schedule(user_id: str = 'demo'):
    """Get cached optimization schedule"""
    cached = await redis_manager.get_schedule(user_id)
    if cached:
        return transform_to_frontend_format(cached)
    
    return {'error': 'No schedule found. Run /api/optimize first.'}


@router.post('/override')
async def override_schedule(
    user_id: str = 'demo',
    appliance: str = 'geyser',
    hour: int = 7
):
    """
    Override a scheduled appliance (user manual control).
    Re-runs MILP with force_on constraint.
    """
    request = OptimizeRequest(
        user_id=user_id,
        force_on={appliance: hour}
    )
    
    result = await optimize(request)
    result['override_applied'] = {appliance: hour}
    
    return result
