# simulator/meter_sim.py - Simulated Smart Meter for Testing

"""
Generates realistic Indian household load curves:
- Morning peak: 6-9 AM (geyser, breakfast)
- Evening peak: 6-10 PM (AC, TV, cooking)
- Noon bump: 12-3 PM (AC in summer)
- Base load: ~0.3 kW (fridge, standby)
"""

import math
import random
import time
from typing import Dict, List, Optional
from datetime import datetime

from simulator.tariff import UPPCL_TARIFF, get_tariff_slot


def get_live_reading(meter_id: str = "DEMO001", balance: float = 247.0) -> Dict:
    """
    Generate a realistic live meter reading.
    Simulates typical Indian household consumption pattern.
    """
    # Current hour (decimal)
    now = datetime.now()
    hour = now.hour + now.minute / 60
    
    # Base load (fridge, standby devices)
    base = 0.3
    
    # Morning peak (geyser, breakfast) - centered at 7:30 AM
    morning = 1.8 * math.exp(-0.5 * ((hour - 7.5) / 1.2) ** 2)
    
    # Evening peak (AC, TV, cooking) - centered at 7 PM
    evening = 2.2 * math.exp(-0.5 * ((hour - 19.0) / 1.5) ** 2)
    
    # Noon AC usage - centered at 1 PM
    noon_ac = 0.8 * math.exp(-0.5 * ((hour - 13.0) / 2.0) ** 2)
    
    # Random noise
    noise = random.uniform(-0.1, 0.1)
    
    # Total power (minimum 0.2 kW)
    kw = max(0.2, base + morning + evening + noon_ac + noise)
    
    # Get tariff info
    h = int(hour) % 24
    tariff_info = get_tariff_slot(h)
    
    return {
        "meter_id": meter_id,
        "timestamp": time.time(),
        "datetime": now.isoformat(),
        "active_power_kw": round(kw, 2),
        "voltage_v": round(230 + random.uniform(-8, 8), 1),
        "current_a": round(kw * 1000 / 230, 2),
        "power_factor": round(0.85 + random.uniform(-0.05, 0.05), 2),
        "frequency_hz": round(50 + random.uniform(-0.2, 0.2), 2),
        "energy_kwh_today": round(2.1 + (hour / 24) * 8.3, 2),
        "tariff_rate": tariff_info["rate"],
        "tariff_slot": tariff_info["slot"],
        "tariff_color": tariff_info["color"],
        "prepaid_balance": round(balance, 2),
        "discom": "UPPCL"
    }


def generate_history(meter_id: str = "DEMO001", readings: int = 672) -> List[Dict]:
    """
    Generate historical readings (default: 672 = 7 days × 96 readings/day at 15-min intervals).
    Used for ML model input (LFE needs 7 days of data).
    """
    history = []
    current_time = time.time()
    interval = 15 * 60  # 15 minutes in seconds
    
    for i in range(readings):
        # Go back in time
        ts = current_time - (readings - i - 1) * interval
        dt = datetime.fromtimestamp(ts)
        hour = dt.hour + dt.minute / 60
        
        # Same load curve logic
        base = 0.3
        morning = 1.8 * math.exp(-0.5 * ((hour - 7.5) / 1.2) ** 2)
        evening = 2.2 * math.exp(-0.5 * ((hour - 19.0) / 1.5) ** 2)
        noon_ac = 0.8 * math.exp(-0.5 * ((hour - 13.0) / 2.0) ** 2)
        
        # Add day-to-day variation
        day_factor = 1.0 + 0.1 * math.sin(i / 96 * 0.5)  # Weekly pattern
        noise = random.uniform(-0.15, 0.15)
        
        kw = max(0.2, (base + morning + evening + noon_ac) * day_factor + noise)
        
        history.append({
            "timestamp": ts,
            "datetime": dt.isoformat(),
            "active_power_kw": round(kw, 2),
            "hour": dt.hour,
            "minute": dt.minute
        })
    
    return history


def generate_24hr_profile(meter_id: str = "DEMO001") -> List[Dict]:
    """
    Generate 24-hour hourly profile (for charts/display).
    """
    profile = []
    
    for h in range(24):
        hour = h + 0.5  # Mid-hour
        
        base = 0.3
        morning = 1.8 * math.exp(-0.5 * ((hour - 7.5) / 1.2) ** 2)
        evening = 2.2 * math.exp(-0.5 * ((hour - 19.0) / 1.5) ** 2)
        noon_ac = 0.8 * math.exp(-0.5 * ((hour - 13.0) / 2.0) ** 2)
        
        kw = max(0.2, base + morning + evening + noon_ac)
        tariff_info = get_tariff_slot(h)
        
        profile.append({
            "hour": h,
            "label": f"{h:02d}:00",
            "avg_power_kw": round(kw, 2),
            "tariff_rate": tariff_info["rate"],
            "tariff_slot": tariff_info["slot"],
            "tariff_color": tariff_info["color"],
            "cost_per_hour": round(kw * tariff_info["rate"], 2)
        })
    
    return profile


def get_appliance_signature(appliance: str) -> Dict:
    """
    Get typical power signature for common Indian appliances.
    Used for NILM simulation.
    """
    signatures = {
        "geyser": {"power_kw": 2.0, "duration_hr": 0.5, "pattern": "spike"},
        "ac": {"power_kw": 1.5, "duration_hr": 4.0, "pattern": "cycling"},
        "washing_machine": {"power_kw": 0.5, "duration_hr": 1.0, "pattern": "variable"},
        "fridge": {"power_kw": 0.15, "duration_hr": 24.0, "pattern": "cycling"},
        "tv": {"power_kw": 0.1, "duration_hr": 4.0, "pattern": "constant"},
        "fan": {"power_kw": 0.07, "duration_hr": 8.0, "pattern": "constant"},
        "microwave": {"power_kw": 1.2, "duration_hr": 0.1, "pattern": "spike"},
        "iron": {"power_kw": 1.0, "duration_hr": 0.3, "pattern": "cycling"},
    }
    return signatures.get(appliance.lower(), {"power_kw": 0.5, "duration_hr": 1.0, "pattern": "unknown"})
