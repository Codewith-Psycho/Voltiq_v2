# routers/alerts.py - Alert Management
"""
Manage user alerts and notifications.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List, Literal
from services.redis_client import redis_manager
from db.supabase import supabase_client
import time

router = APIRouter()


class CreateAlertRequest(BaseModel):
    user_id: str
    type: Literal['schedule', 'override', 'outage', 'savings', 'system']
    message: str
    severity: Literal['info', 'warning', 'critical'] = 'info'


class AlertResponse(BaseModel):
    id: Optional[str]
    type: str
    message: str
    severity: str
    is_read: bool
    created_at: float


@router.post('/alerts')
async def create_alert(request: CreateAlertRequest):
    """Create a new alert for user"""
    
    alert = {
        'user_id': request.user_id,
        'type': request.type,
        'message': request.message,
        'severity': request.severity,
        'is_read': False,
        'created_at': time.time()
    }
    
    # Store in Redis for quick access
    await redis_manager.push_alert(request.user_id, alert)
    
    # Also persist to Supabase
    try:
        await supabase_client.create_alert(alert)
    except:
        pass  # Redis is primary, Supabase is backup
    
    return {'success': True, 'alert': alert}


@router.get('/alerts/{user_id}')
async def get_alerts(user_id: str, count: int = 10, unread_only: bool = False):
    """Get recent alerts for user"""
    
    # Get from Redis first
    alerts = await redis_manager.get_alerts(user_id, count)
    
    if unread_only:
        alerts = [a for a in alerts if not a.get('is_read', False)]
    
    return {
        'user_id': user_id,
        'count': len(alerts),
        'alerts': alerts
    }


@router.post('/alerts/{alert_id}/read')
async def mark_alert_read(alert_id: str, user_id: str = 'demo'):
    """Mark an alert as read"""
    
    try:
        await supabase_client.mark_alert_read(alert_id)
        return {'success': True}
    except:
        return {'success': False, 'message': 'Alert not found'}


@router.get('/alerts/{user_id}/unread-count')
async def get_unread_count(user_id: str):
    """Get count of unread alerts"""
    
    alerts = await redis_manager.get_alerts(user_id, 50)
    unread = len([a for a in alerts if not a.get('is_read', False)])
    
    return {'user_id': user_id, 'unread_count': unread}


@router.post('/alerts/test')
async def create_test_alerts(user_id: str = 'demo'):
    """Create sample alerts for testing"""
    
    test_alerts = [
        {
            'type': 'schedule',
            'message': 'Geyser scheduled for 5 AM tomorrow. Savings: Rs.14',
            'severity': 'info'
        },
        {
            'type': 'outage',
            'message': 'High outage risk detected 7-9 PM. Appliances rescheduled.',
            'severity': 'warning'
        },
        {
            'type': 'savings',
            'message': 'You saved Rs.180 this week! Keep it up!',
            'severity': 'info'
        }
    ]
    
    for alert_data in test_alerts:
        await create_alert(CreateAlertRequest(
            user_id=user_id,
            **alert_data
        ))
    
    return {'success': True, 'created': len(test_alerts)}
