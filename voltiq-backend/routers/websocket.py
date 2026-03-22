# routers/websocket.py
"""
WebSocket endpoint for real-time updates to frontend.
Matches frontend expectation: ws://localhost:8000/ws/colony
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.redis_client import redis_manager
from simulator.meter_sim import get_live_reading
from simulator.tariff import get_tariff_slot, UPPCL_TARIFF
import asyncio
import json
import random
from datetime import datetime

router = APIRouter(tags=['websocket'])

# Active WebSocket connections
active_connections: dict[str, WebSocket] = {}

# Colony simulation data
def generate_colony_data(num_homes: int = 200):
    """Generate realistic colony stats"""
    flats = []
    total_kw = 0
    
    for i in range(min(num_homes, 10)):  # Top 10 for leaderboard
        flat_kw = round(random.uniform(0.3, 1.5), 2)
        total_kw += flat_kw
        flats.append({
            "rank": i + 1,
            "flat": f"{chr(65 + i % 4)}-{random.randint(100, 506)}",
            "savings": random.randint(600, 1300),
            "energyScore": random.randint(65, 98),
            "kw": flat_kw
        })
    
    # Sort by energy score
    flats.sort(key=lambda x: x['energyScore'], reverse=True)
    for i, f in enumerate(flats):
        f['rank'] = i + 1
    
    # Scale total kW for full colony
    total_kw = round(total_kw * (num_homes / 10), 1)
    
    return {
        "totalKW": total_kw,
        "totalHomes": num_homes,
        "totalSaving": random.randint(35000, 50000),
        "flats": flats
    }


def get_tariff_mode() -> str:
    """Get current tariff mode for frontend: peak, mid, sasta"""
    hour = datetime.now().hour
    tariff = get_tariff_slot(hour)
    
    if tariff['rate'] == 3.5:
        return 'sasta'
    elif tariff['rate'] >= 8.0:
        return 'peak'
    else:
        return 'mid'


@router.websocket('/ws/colony')
async def colony_websocket(websocket: WebSocket):
    """
    Real-time WebSocket for colony updates.
    
    Sends every 3 seconds:
    - type: colony_update
    - tariff: peak | mid | sasta
    - totalKW: number
    - colonyData: { totalKW, totalHomes, totalSaving, flats[] }
    """
    await websocket.accept()
    client_id = str(id(websocket))
    active_connections[client_id] = websocket
    
    # Initial colony data
    colony_data = generate_colony_data(200)
    
    try:
        while True:
            # Get current tariff mode
            tariff_mode = get_tariff_mode()
            
            # Fluctuate kW slightly
            colony_data['totalKW'] = round(
                max(80, min(220, colony_data['totalKW'] + random.uniform(-5, 5))), 
                1
            )
            
            # Update flat stats occasionally
            for flat in colony_data['flats']:
                flat['kw'] = round(max(0.3, min(1.5, flat['kw'] + random.uniform(-0.05, 0.05))), 2)
                flat['energyScore'] = max(50, min(99, flat['energyScore'] + random.randint(-1, 1)))
            
            # Re-sort by energy score
            colony_data['flats'].sort(key=lambda x: x['energyScore'], reverse=True)
            for i, f in enumerate(colony_data['flats']):
                f['rank'] = i + 1
            
            # Send colony update
            await websocket.send_json({
                "type": "colony_update",
                "tariff": tariff_mode,
                "totalKW": colony_data['totalKW'],
                "colonyData": {
                    **colony_data,
                    "tariff": tariff_mode
                }
            })
            
            # Check for any alerts to push (from Redis)
            try:
                alert_data = await redis_manager.get('pending_alert')
                if alert_data:
                    await websocket.send_json({
                        "type": "alert",
                        "alertType": alert_data.get('type', 'tariff'),
                        "title": alert_data.get('title', 'Alert'),
                        "message": alert_data.get('message', ''),
                        "actionLabel": alert_data.get('actionLabel')
                    })
                    await redis_manager.delete('pending_alert')
            except:
                pass
            
            # Wait 3 seconds
            await asyncio.sleep(3)
            
    except WebSocketDisconnect:
        del active_connections[client_id]
    except Exception as e:
        print(f"WebSocket error: {e}")
        if client_id in active_connections:
            del active_connections[client_id]


@router.websocket('/ws/meter/{user_id}')
async def meter_websocket(websocket: WebSocket, user_id: str = 'demo'):
    """
    Real-time meter reading updates for individual user.
    """
    await websocket.accept()
    client_id = f"{user_id}_{id(websocket)}"
    active_connections[client_id] = websocket
    
    try:
        while True:
            # Generate live reading
            reading = get_live_reading(user_id)
            
            # Cache in Redis
            await redis_manager.set_meter_live(user_id, reading)
            await redis_manager.push_meter_history(user_id, {
                'timestamp': reading['timestamp'],
                'datetime': reading['datetime'],
                'active_power_kw': reading['active_power_kw'],
                'kw': reading['active_power_kw'],
                'hour': datetime.now().hour,
                'minute': datetime.now().minute
            })
            
            # Send to frontend
            await websocket.send_json(reading)
            
            # Wait 3 seconds
            await asyncio.sleep(3)
            
    except WebSocketDisconnect:
        del active_connections[client_id]
    except Exception as e:
        print(f"Meter WebSocket error: {e}")
        if client_id in active_connections:
            del active_connections[client_id]


async def broadcast_alert(alert: dict):
    """Broadcast alert to all connected clients"""
    message = {
        "type": "alert",
        "alertType": alert.get('type', 'tariff'),
        "title": alert.get('title', 'Alert'),
        "message": alert.get('message', ''),
        "actionLabel": alert.get('actionLabel')
    }
    
    disconnected = []
    for client_id, ws in active_connections.items():
        try:
            await ws.send_json(message)
        except:
            disconnected.append(client_id)
    
    # Clean up disconnected
    for client_id in disconnected:
        del active_connections[client_id]


async def broadcast_appliance_status(appliance_id: str, status: str):
    """Broadcast appliance status change"""
    message = {
        "type": "appliance_status",
        "applianceId": appliance_id,
        "status": status
    }
    
    disconnected = []
    for client_id, ws in active_connections.items():
        try:
            await ws.send_json(message)
        except:
            disconnected.append(client_id)
    
    for client_id in disconnected:
        del active_connections[client_id]
