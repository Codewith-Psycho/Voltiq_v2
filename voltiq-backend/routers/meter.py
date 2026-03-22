# routers/meter.py - WebSocket Live Meter Data
"""
Provides real-time meter readings via WebSocket.
Uses simulator for dummy data, caches in Redis.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from simulator.meter_sim import get_live_reading, generate_history, generate_24hr_profile
from simulator.tariff import get_tariff_24hr, get_slot_summary
from services.redis_client import redis_manager
import asyncio

router = APIRouter()

# Track active WebSocket connections
active_connections: dict = {}


@router.websocket('/live')
async def meter_websocket(websocket: WebSocket, user_id: str = 'demo'):
    """
    WebSocket endpoint for live meter readings.
    Pushes new reading every 3 seconds.
    """
    await websocket.accept()
    active_connections[user_id] = websocket
    
    try:
        while True:
            # Generate simulated reading
            reading = get_live_reading(meter_id=user_id)
            
            # Cache in Redis
            await redis_manager.set_meter_live(user_id, reading)
            await redis_manager.push_meter_history(user_id, reading)
            
            # Send to client
            await websocket.send_json(reading)
            
            # Wait 3 seconds
            await asyncio.sleep(3)
            
    except WebSocketDisconnect:
        if user_id in active_connections:
            del active_connections[user_id]
        print(f"WebSocket disconnected: {user_id}")


@router.get('/live/{user_id}')
async def get_meter_live(user_id: str = 'demo'):
    """
    HTTP endpoint for latest meter reading.
    Falls back to simulator if no cached data.
    """
    cached = await redis_manager.get_meter_live(user_id)
    if cached:
        return cached
    
    # Generate and cache
    reading = get_live_reading(meter_id=user_id)
    await redis_manager.set_meter_live(user_id, reading)
    return reading


@router.get('/history/{user_id}')
async def get_meter_history(user_id: str = 'demo', count: int = 96):
    """
    Get meter reading history.
    Default: 96 readings (24 hours at 15-min intervals)
    """
    history = await redis_manager.get_meter_history(user_id, count)
    
    if not history or len(history) < count:
        # Generate dummy history
        history = generate_history(meter_id=user_id, readings=count)
        # Cache it
        for reading in reversed(history):
            await redis_manager.push_meter_history(user_id, reading)
    
    return {
        'user_id': user_id,
        'count': len(history),
        'readings': history
    }


@router.get('/profile/24hr/{user_id}')
async def get_24hr_profile(user_id: str = 'demo'):
    """
    Get 24-hour consumption profile with tariff overlay.
    """
    profile = generate_24hr_profile(meter_id=user_id)
    tariff = get_tariff_24hr()
    
    return {
        'user_id': user_id,
        'profile': profile,
        'tariff': tariff,
        'summary': {
            'total_kwh': sum(p['avg_power_kw'] for p in profile),
            'total_cost': sum(p['cost_per_hour'] for p in profile),
            'peak_hour': max(profile, key=lambda x: x['avg_power_kw'])['hour']
        }
    }


@router.get('/tariff/today')
async def tariff_today():
    """Get 24-hour tariff schedule for today"""
    return {
        'tariff': get_tariff_24hr(),
        'slots': get_slot_summary()
    }
