# routers/ml.py - ML Model Endpoints
"""
Direct access to ML model predictions.
All results are cached in Redis.
"""

from fastapi import APIRouter
from services.redis_client import redis_manager
from simulator.meter_sim import generate_history

router = APIRouter()


@router.get('/forecast/24hr')
async def forecast_24hr(user_id: str = 'demo'):
    """
    Get 24-hour load forecast (LFE model).
    Returns baseline, P90, and peak probability per hour.
    """
    # Check cache first
    cached = await redis_manager.get_lfe(user_id)
    if cached:
        return {'source': 'cache', 'data': cached}
    
    # Get meter history
    history = await redis_manager.get_meter_history(user_id, 672)
    if len(history) < 672:
        history = generate_history(meter_id=user_id, readings=672)
    
    kw_672 = [r.get('active_power_kw', r.get('kw', 0.8)) for r in history]
    
    # Run LFE model
    from main import models
    result = models['lfe'].predict(kw_672)
    
    # Cache result (15 min TTL)
    await redis_manager.cache_lfe(user_id, result)
    
    return {'source': 'model', 'data': result}


@router.get('/nilm/detect')
async def nilm_detect(user_id: str = 'demo'):
    """
    Detect active appliance from recent readings (NILM model).
    Uses last 8 readings (2 minutes at 15s intervals).
    """
    # Check cache first
    cached = await redis_manager.get_nilm(user_id)
    if cached:
        return {'source': 'cache', 'data': cached}
    
    # Get recent readings
    history = await redis_manager.get_meter_history(user_id, 8)
    if len(history) < 8:
        history = generate_history(meter_id=user_id, readings=8)
    
    kw_8 = [r.get('active_power_kw', r.get('kw', 0.8)) for r in history]
    
    # Run NILM model
    from main import models
    result = models['nilm'].detect(kw_8)
    
    # Cache result (1 min TTL)
    await redis_manager.cache_nilm(user_id, result)
    
    return {'source': 'model', 'data': result}


@router.get('/outage/probability')
async def outage_probability():
    """
    Get 24-hour outage probability forecast (OPC model).
    Returns probability and risk flag per hour.
    """
    # Check cache first
    cached = await redis_manager.get_outage()
    if cached:
        return {'source': 'cache', 'data': cached}
    
    # Run OPC model
    from main import models
    result = models['opc'].predict_24hr()
    
    # Cache result (1 hour TTL)
    await redis_manager.cache_outage(result)
    
    # Add summary
    high_risk = [h for h in result if h['is_high_risk']]
    
    return {
        'source': 'model',
        'data': result,
        'summary': {
            'high_risk_hours': [h['hour'] for h in high_risk],
            'total_high_risk': len(high_risk),
            'max_probability': max(h['probability'] for h in result)
        }
    }


@router.get('/behavior/{user_id}')
async def behavior_prediction(user_id: str = 'demo'):
    """
    Get user behavior prediction (BHV model).
    Returns probability of usage per hour.
    """
    from datetime import datetime
    
    # Check cache first
    cached = await redis_manager.get_behavior(user_id)
    if cached:
        return {'source': 'cache', 'data': cached}
    
    # Get meter history for today and yesterday
    history = await redis_manager.get_meter_history(user_id, 48)
    if len(history) < 48:
        history = generate_history(meter_id=user_id, readings=48)
    
    kw_48 = [r.get('active_power_kw', r.get('kw', 0.8)) for r in history]
    
    # Build inputs
    today_24 = [1 if k > 0.5 else 0 for k in kw_48[-24:]]
    yesterday_24 = [1 if k > 0.5 else 0 for k in kw_48[:24]]
    is_weekend = datetime.now().weekday() >= 5
    
    # Run BHV model
    from main import models
    result = models['bhv'].predict_probs(today_24, yesterday_24, is_weekend)
    
    # Cache result (24 hour TTL)
    await redis_manager.cache_behavior(user_id, result)
    
    # Find preferred hours
    preferred = sorted(result.items(), key=lambda x: -x[1])[:5]
    
    return {
        'source': 'model',
        'data': result,
        'is_weekend': is_weekend,
        'top_5_hours': [{'hour': h, 'probability': p} for h, p in preferred]
    }


@router.get('/summary/{user_id}')
async def ml_summary(user_id: str = 'demo'):
    """
    Get summary of all ML predictions for a user.
    """
    lfe = await redis_manager.get_lfe(user_id)
    opc = await redis_manager.get_outage()
    bhv = await redis_manager.get_behavior(user_id)
    nilm = await redis_manager.get_nilm(user_id)
    
    return {
        'user_id': user_id,
        'lfe': {
            'available': lfe is not None,
            'avg_baseline': round(sum(lfe['baseline_hourly']) / 24, 2) if lfe else None
        },
        'opc': {
            'available': opc is not None,
            'high_risk_hours': len([h for h in opc if h['is_high_risk']]) if opc else None
        },
        'bhv': {
            'available': bhv is not None,
            'top_hour': max(bhv.items(), key=lambda x: x[1])[0] if bhv else None
        },
        'nilm': {
            'available': nilm is not None,
            'detected': nilm.get('detected') if nilm else None
        }
    }
