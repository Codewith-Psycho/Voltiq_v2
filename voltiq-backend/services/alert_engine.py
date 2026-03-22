# services/alert_engine.py - Alert Generation Engine
"""
Generates alerts based on system events.
"""

from typing import Dict, List
from services.redis_client import redis_manager
import time


class AlertEngine:
    """
    Generates contextual alerts for users.
    """
    
    ALERT_TYPES = {
        'schedule': 'Schedule notifications',
        'override': 'User override confirmations',
        'outage': 'Outage risk warnings',
        'savings': 'Savings milestones',
        'system': 'System notifications'
    }
    
    async def check_and_generate(self, user_id: str) -> List[Dict]:
        """
        Check conditions and generate relevant alerts.
        """
        alerts = []
        
        # Check for high outage risk
        opc = await redis_manager.get_outage()
        if opc:
            high_risk = [h for h in opc if h.get('is_high_risk')]
            if high_risk:
                alerts.append({
                    'type': 'outage',
                    'message': f'High outage risk at {len(high_risk)} hours today. Schedule adjusted.',
                    'severity': 'warning'
                })
        
        # Check for schedule completion
        schedule = await redis_manager.get_schedule(user_id)
        if schedule:
            savings = schedule.get('savings_rs', 0)
            if savings > 10:
                alerts.append({
                    'type': 'savings',
                    'message': f'Today\'s optimization will save Rs.{savings}!',
                    'severity': 'info'
                })
        
        # Push alerts to Redis
        for alert in alerts:
            alert['user_id'] = user_id
            alert['created_at'] = time.time()
            alert['is_read'] = False
            await redis_manager.push_alert(user_id, alert)
        
        return alerts
    
    async def generate_schedule_alert(
        self,
        user_id: str,
        appliance: str,
        hour: int,
        savings: float
    ):
        """Generate alert for new schedule"""
        alert = {
            'type': 'schedule',
            'message': f'{appliance.capitalize()} scheduled for {hour:02d}:00. Savings: Rs.{savings}',
            'severity': 'info',
            'user_id': user_id,
            'created_at': time.time(),
            'is_read': False
        }
        await redis_manager.push_alert(user_id, alert)
        return alert
    
    async def generate_override_alert(
        self,
        user_id: str,
        appliance: str,
        original_hour: int,
        new_hour: int,
        extra_cost: float
    ):
        """Generate alert for user override"""
        alert = {
            'type': 'override',
            'message': f'{appliance.capitalize()} moved from {original_hour:02d}:00 to {new_hour:02d}:00. Extra cost: Rs.{extra_cost}',
            'severity': 'warning' if extra_cost > 5 else 'info',
            'user_id': user_id,
            'created_at': time.time(),
            'is_read': False
        }
        await redis_manager.push_alert(user_id, alert)
        return alert


# Singleton
alert_engine = AlertEngine()
