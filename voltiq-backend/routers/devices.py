# routers/devices.py - Smart Plug Control (TP-Link Tapo + OEM)
"""
Controls smart plugs and OEM devices.
- TP-Link Tapo via PyP100
- OEM hooks for future integrations
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Literal
from services.redis_client import redis_manager
from services.tapo_control import TapoController
from services.oem_connector import OEMConnector
from config import settings
import time

router = APIRouter()


class ControlRequest(BaseModel):
    device_id: str
    action: Literal['ON', 'OFF']
    device_type: str = 'tapo'  # tapo, oem, dummy


class ControlResponse(BaseModel):
    success: bool
    device_id: str
    state: str
    timestamp: float
    message: Optional[str] = None


# Initialize controllers
tapo = TapoController()
oem = OEMConnector()


@router.post('/appliance/control')
async def control_appliance(request: ControlRequest):
    """
    Turn appliance ON or OFF via smart plug.
    
    Supports:
    - tapo: TP-Link Tapo P100/P110
    - oem: Generic OEM devices (placeholder)
    - dummy: Simulated control for testing
    """
    device_id = request.device_id
    action = request.action.upper()
    device_type = request.device_type.lower()
    
    try:
        if device_type == 'tapo':
            # Real TP-Link Tapo control
            result = await tapo.control(device_id, action)
            
        elif device_type == 'oem':
            # OEM device control
            result = await oem.control(device_id, action)
            
        else:
            # Dummy control for testing
            result = {
                'success': True,
                'state': action,
                'message': 'Dummy device - simulated control'
            }
        
        # Cache device state in Redis
        await redis_manager.set(
            f'appliance:state:{device_id}',
            {'state': action, 'timestamp': time.time(), 'type': device_type},
            ttl=86400
        )
        
        return ControlResponse(
            success=result.get('success', True),
            device_id=device_id,
            state=action,
            timestamp=time.time(),
            message=result.get('message')
        )
        
    except Exception as e:
        return ControlResponse(
            success=False,
            device_id=device_id,
            state='unknown',
            timestamp=time.time(),
            message=f'Control failed: {str(e)}'
        )


@router.get('/appliance/status/{device_id}')
async def get_appliance_status(device_id: str):
    """Get current status of a device"""
    
    # Check Redis cache first
    cached = await redis_manager.get(f'appliance:state:{device_id}')
    if cached:
        return {
            'device_id': device_id,
            'state': cached.get('state', 'unknown'),
            'last_updated': cached.get('timestamp'),
            'source': 'cache'
        }
    
    # Try to get live status from Tapo
    try:
        status = await tapo.get_status(device_id)
        return {
            'device_id': device_id,
            'state': status.get('state', 'unknown'),
            'power_w': status.get('power_w'),
            'source': 'device'
        }
    except:
        return {
            'device_id': device_id,
            'state': 'unknown',
            'source': 'unavailable'
        }


@router.get('/appliance/list')
async def list_appliances(user_id: str = 'demo'):
    """List all registered appliances for a user"""
    
    # Default appliances for demo
    appliances = [
        {
            'id': 'geyser-01',
            'name': 'Geyser',
            'type': 'tapo',
            'power_kw': 2.0,
            'ip': settings.TAPO_DEVICE_IP,
            'state': 'unknown'
        },
        {
            'id': 'wm-01',
            'name': 'Washing Machine',
            'type': 'dummy',
            'power_kw': 0.5,
            'state': 'unknown'
        },
        {
            'id': 'ac-01',
            'name': 'Air Conditioner',
            'type': 'dummy',
            'power_kw': 1.5,
            'state': 'unknown'
        }
    ]
    
    # Get cached states
    for app in appliances:
        cached = await redis_manager.get(f'appliance:state:{app["id"]}')
        if cached:
            app['state'] = cached.get('state', 'unknown')
    
    return {'user_id': user_id, 'appliances': appliances}


@router.post('/appliance/schedule-execute')
async def execute_scheduled_action(
    device_id: str,
    action: str,
    schedule_id: str = None
):
    """
    Execute a scheduled action (called by scheduler).
    Logs execution in Redis.
    """
    result = await control_appliance(
        ControlRequest(device_id=device_id, action=action)
    )
    
    # Log execution
    await redis_manager.set(
        f'execution:{schedule_id or device_id}:{int(time.time())}',
        {
            'device_id': device_id,
            'action': action,
            'success': result.success,
            'timestamp': time.time()
        },
        ttl=86400 * 7  # Keep for 7 days
    )
    
    return result
