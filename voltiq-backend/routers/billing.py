# routers/billing.py - Savings Simulation & Billing
"""
Simulate monthly savings, generate projections.
Frontend-compatible response format.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from simulator.tariff import UPPCL_TARIFF

router = APIRouter()


# Frontend expected input format
class BillingInput(BaseModel):
    appliances: List[str] = ['geyser', 'wm', 'ac']
    hours: int = 6
    budget: int = 1000
    comfort: int = 50
    discom: str = 'UPPCL'


# Frontend expected response format
class MonthlyData(BaseModel):
    month: str
    baseline: float
    optimized: float


class BillingResult(BaseModel):
    baseline: float
    optimized: float
    savings: float
    savingsPercent: float
    co2Saved: float
    treesEquivalent: float
    monthlyData: List[MonthlyData]


@router.post('/billing/simulate')
async def billing_simulate(user_id: str = 'demo'):
    """
    Simulate monthly savings based on optimization.
    
    Compares:
    - Baseline: Appliances at typical peak hours
    - Optimized: Appliances at cheapest hours
    """
    # Default appliance configurations
    appliances = [
        {
            'name': 'geyser',
            'power_kw': 2.0,
            'baseline_hour': 7,   # Morning peak
            'optimal_hour': 5,    # Early morning (cheap)
            'min_hours': 1
        },
        {
            'name': 'washing_machine',
            'power_kw': 0.5,
            'baseline_hour': 20,  # Evening peak
            'optimal_hour': 22,   # Night (cheap)
            'min_hours': 2
        },
        {
            'name': 'ac',
            'power_kw': 1.5,
            'baseline_hour': 19,  # Evening peak
            'optimal_hour': 13,   # Afternoon (medium)
            'min_hours': 4
        },
    ]
    
    # Calculate monthly costs (30 days)
    baseline_cost = 0.0
    optimized_cost = 0.0
    
    for app in appliances:
        baseline_cost += (
            UPPCL_TARIFF[app['baseline_hour']] *
            app['power_kw'] *
            app['min_hours'] *
            30  # days
        )
        optimized_cost += (
            UPPCL_TARIFF[app['optimal_hour']] *
            app['power_kw'] *
            app['min_hours'] *
            30
        )
    
    savings = baseline_cost - optimized_cost
    savings_pct = (savings / baseline_cost * 100) if baseline_cost > 0 else 0
    
    # CO2 calculation (0.82 kg CO2 per kWh in India)
    kwh_saved = savings / 5.0  # Approximate avg rate
    co2_saved = kwh_saved * 0.82
    
    # 6-month projection with seasonal variation - Frontend format
    month_names = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
    monthly_data = []
    for i, month_name in enumerate(month_names):
        # Seasonal factor
        if month_name in ['Apr', 'May', 'Jun']:
            seasonal_factor = 1.4
        elif month_name in ['Dec', 'Jan', 'Feb']:
            seasonal_factor = 0.8
        else:
            seasonal_factor = 1.0
        
        monthly_data.append({
            'month': month_name,
            'baseline': round(baseline_cost * seasonal_factor, 0),
            'optimized': round(optimized_cost * seasonal_factor, 0)
        })
    
    # Frontend expected format
    return {
        'baseline': round(baseline_cost, 0),
        'optimized': round(optimized_cost, 0),
        'savings': round(savings, 0),
        'savingsPercent': round(savings_pct, 1),
        'co2Saved': round(co2_saved * 12, 1),
        'treesEquivalent': round(co2_saved * 12 / 21, 2),
        'monthlyData': monthly_data,
        # Also include backend format for compatibility
        'baseline_monthly': round(baseline_cost, 2),
        'optimized_monthly': round(optimized_cost, 2),
        'savings_monthly': round(savings, 2),
        'savings_pct': round(savings_pct, 1),
        'annual_savings': round(savings * 12, 2),
        'appliances_analyzed': [a['name'] for a in appliances]
    }


@router.get('/billing/history/{user_id}')
async def billing_history(user_id: str = 'demo'):
    """
    Get billing history for a user.
    (Dummy data for now - would come from Supabase)
    """
    # Dummy historical data
    history = [
        {'month': 'March 2026', 'baseline': 2450, 'actual': 1890, 'savings': 560},
        {'month': 'February 2026', 'baseline': 2100, 'actual': 1680, 'savings': 420},
        {'month': 'January 2026', 'baseline': 1950, 'actual': 1560, 'savings': 390},
    ]
    
    total_savings = sum(h['savings'] for h in history)
    
    return {
        'user_id': user_id,
        'history': history,
        'total_savings': total_savings,
        'average_savings_pct': round(
            sum(h['savings'] / h['baseline'] * 100 for h in history) / len(history), 1
        )
    }


@router.get('/billing/compare')
async def billing_compare(
    power_kw: float = 2.0,
    hours: int = 1,
    baseline_hour: int = 7,
    optimal_hour: int = 5
):
    """
    Compare cost for a specific appliance at different times.
    """
    from simulator.tariff import get_tariff_slot
    
    baseline_info = get_tariff_slot(baseline_hour)
    optimal_info = get_tariff_slot(optimal_hour)
    
    baseline_cost = baseline_info['rate'] * power_kw * hours
    optimal_cost = optimal_info['rate'] * power_kw * hours
    savings = baseline_cost - optimal_cost
    
    return {
        'power_kw': power_kw,
        'hours': hours,
        'baseline': {
            'hour': baseline_hour,
            'rate': baseline_info['rate'],
            'slot': baseline_info['slot'],
            'color': baseline_info['color'],
            'daily_cost': round(baseline_cost, 2),
            'monthly_cost': round(baseline_cost * 30, 2)
        },
        'optimal': {
            'hour': optimal_hour,
            'rate': optimal_info['rate'],
            'slot': optimal_info['slot'],
            'color': optimal_info['color'],
            'daily_cost': round(optimal_cost, 2),
            'monthly_cost': round(optimal_cost * 30, 2)
        },
        'savings': {
            'daily': round(savings, 2),
            'monthly': round(savings * 30, 2),
            'yearly': round(savings * 365, 2),
            'percentage': round(savings / baseline_cost * 100, 1) if baseline_cost > 0 else 0
        }
    }
