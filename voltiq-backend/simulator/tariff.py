# simulator/tariff.py - UPPCL Tariff Configuration

"""
UPPCL (Uttar Pradesh) Time-of-Use Tariff Slots:
- GREEN (Sasta):  0-5 AM, 10 PM-12 AM  → Rs. 3.5/kWh
- RED (Peak):     6-10 AM, 6-10 PM     → Rs. 8.4-9.1/kWh
- YELLOW (Din):   10 AM-6 PM           → Rs. 4.9/kWh
"""

from typing import List, Dict

# UPPCL Tariff rates by hour (Rs/kWh)
UPPCL_TARIFF = {
    # GREEN - Sasta (Cheap) - Night
    0: 3.5, 1: 3.5, 2: 3.5, 3: 3.5, 4: 3.5, 5: 3.5,
    22: 3.5, 23: 3.5,
    
    # RED - Peak - Morning
    6: 8.4, 7: 8.4, 8: 8.4, 9: 8.4,
    
    # YELLOW - Din (Day)
    10: 4.9, 11: 4.9, 12: 4.9, 13: 4.9, 14: 4.9, 15: 4.9, 16: 4.9, 17: 4.9,
    
    # RED - Peak - Evening
    18: 9.1, 19: 9.1, 20: 9.1, 21: 9.1,
}


def get_tariff_slot(hour: int) -> Dict:
    """Get tariff info for a specific hour"""
    if hour in range(6, 10) or hour in range(18, 22):
        slot = "Peak"
        color = "RED"
    elif hour in range(10, 18):
        slot = "Din"
        color = "YELLOW"
    else:
        slot = "Sasta"
        color = "GREEN"
    
    return {
        "hour": hour,
        "label": f"{hour:02d}:00",
        "rate": UPPCL_TARIFF[hour],
        "slot": slot,
        "color": color
    }


def get_tariff_24hr() -> List[Dict]:
    """Get complete 24-hour tariff schedule"""
    return [get_tariff_slot(h) for h in range(24)]


def get_tariff_array() -> List[float]:
    """Get tariff rates as simple array [0-23]"""
    return [UPPCL_TARIFF[h] for h in range(24)]


def calculate_cost(power_kw: float, hours: List[int]) -> float:
    """Calculate electricity cost for given power and hours"""
    return sum(power_kw * UPPCL_TARIFF[h] for h in hours)


def get_cheapest_hours(n_hours: int, exclude_hours: List[int] = None) -> List[int]:
    """Get N cheapest hours (for scheduling)"""
    exclude = exclude_hours or []
    available = [(h, UPPCL_TARIFF[h]) for h in range(24) if h not in exclude]
    available.sort(key=lambda x: x[1])
    return [h for h, _ in available[:n_hours]]


def get_slot_summary() -> Dict:
    """Get summary of tariff slots"""
    return {
        "GREEN": {
            "name": "Sasta",
            "hours": [0, 1, 2, 3, 4, 5, 22, 23],
            "rate": 3.5,
            "description": "Cheapest - Night hours"
        },
        "YELLOW": {
            "name": "Din", 
            "hours": list(range(10, 18)),
            "rate": 4.9,
            "description": "Medium - Day hours"
        },
        "RED": {
            "name": "Peak",
            "hours": [6, 7, 8, 9, 18, 19, 20, 21],
            "rate_morning": 8.4,
            "rate_evening": 9.1,
            "description": "Expensive - Peak demand"
        }
    }
