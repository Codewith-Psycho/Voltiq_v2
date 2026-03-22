# routers/chat.py - 4-Intent Hindi+English Chatbot
"""
Simple NLU chatbot for VoltIQ.
Supports 4 intents:
- info: Bill/cost queries
- override: Turn on appliance now
- explain: Why this schedule?
- advice: Savings tips
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.redis_client import redis_manager

router = APIRouter()


# Intent patterns (Hindi + English)
INTENTS = {
    'info': [
        'bill', 'kitna', 'cost', 'paisa', 'aaj', 'balance', 'today',
        'how much', 'kharcha', 'bijli', 'unit', 'reading'
    ],
    'override': [
        'chalu', 'on karo', 'start', 'chalao', 'abhi', 'turn on',
        'switch on', 'band karo', 'turn off', 'off karo', 'bujhao'
    ],
    'explain': [
        'kyun', 'why', 'explain', 'kya hua', 'reason', 'kaise',
        'batao', 'samjhao', 'schedule kyun'
    ],
    'advice': [
        'tips', 'bachau', 'save', 'suggest', 'help', 'kaise bachaye',
        'savings', 'kam karo', 'reduce', 'efficient'
    ],
}

# Appliance NLU keywords
APPLIANCES_NLU = {
    'geyser': ['geyser', 'paani garam', 'hot water', 'water heater', 'geezer'],
    'ac': ['ac', 'thanda', 'air condition', 'cooling', 'air conditioner'],
    'washing_machine': ['washing', 'machine', 'kapde', 'wm', 'laundry', 'dhulai'],
    'fridge': ['fridge', 'refrigerator', 'freezer'],
    'fan': ['fan', 'pankha'],
}


class ChatRequest(BaseModel):
    message: str
    user_id: str = 'demo'


class ChatResponse(BaseModel):
    response: str
    intent: str
    appliance: Optional[str] = None
    suggestions: Optional[list] = None


def detect_intent(msg: str) -> dict:
    """Detect intent and appliance from message"""
    msg_lower = msg.lower()
    
    # Detect intent
    detected_intent = 'unknown'
    for intent, patterns in INTENTS.items():
        if any(p in msg_lower for p in patterns):
            detected_intent = intent
            break
    
    # Detect appliance
    detected_appliance = None
    for appliance, keywords in APPLIANCES_NLU.items():
        if any(k in msg_lower for k in keywords):
            detected_appliance = appliance
            break
    
    return {
        'intent': detected_intent,
        'appliance': detected_appliance
    }


@router.post('/chat')
async def chat(request: ChatRequest):
    """
    Process chat message and return response.
    """
    message = request.message
    user_id = request.user_id
    
    # Detect intent
    detection = detect_intent(message)
    intent = detection['intent']
    appliance = detection['appliance']
    
    response = ""
    suggestions = []
    
    if intent == 'info':
        # Get live meter data
        live = await redis_manager.get_meter_live(user_id)
        if live:
            power = live.get('active_power_kw', 0)
            slot = live.get('tariff_slot', 'Din')
            rate = live.get('tariff_rate', 4.9)
            balance = live.get('prepaid_balance', 200)
            
            response = (
                f"Abhi {power} kW chal raha hai. "
                f"{slot} time — Rs.{rate}/unit. "
                f"Balance: Rs.{balance}"
            )
        else:
            response = "Meter reading nahi mili. Thodi der mein try karein."
        
        suggestions = ["Schedule dikhao", "Savings batao", "Tips do"]
    
    elif intent == 'override':
        app_name = appliance or 'geyser'
        
        # Check current tariff
        live = await redis_manager.get_meter_live(user_id)
        rate = live.get('tariff_rate', 4.9) if live else 4.9
        
        if rate > 5:
            response = (
                f"{app_name.capitalize()} abhi chalu karna hoga toh "
                f"Rs.5-8 extra lagega (Peak time hai). "
                f"Confirm karna hai? [Haan/Nahi]"
            )
        else:
            response = (
                f"{app_name.capitalize()} chalu kar dein? "
                f"Abhi sasta time hai (Rs.{rate}/unit)."
            )
        
        suggestions = ["Haan, chalu karo", "Nahi, baad mein", "Schedule dekho"]
    
    elif intent == 'explain':
        # Get cached schedule
        schedule = await redis_manager.get_schedule(user_id)
        
        if schedule and 'schedule' in schedule:
            savings = schedule.get('savings_rs', 0)
            response = (
                f"MILP ne sasta time dhundh ke schedule banaya. "
                f"Tariff Rs.3.5/unit pe schedule kiya (Rs.9.1 se bachaya). "
                f"Total savings: Rs.{savings}"
            )
        else:
            response = (
                "Schedule abhi nahi bana. "
                "MILP solver sasta time dhundhta hai aur "
                "appliances ko GREEN slot mein schedule karta hai."
            )
        
        suggestions = ["Optimize karo", "Tariff dikhao", "Tips do"]
    
    elif intent == 'advice':
        response = (
            "Top savings tips:\n"
            "1) Geyser 6AM → 5AM: Rs.180/month bachega\n"
            "2) WM weeknight 10PM ke baad: Rs.60/month\n"
            "3) AC 2PM-4PM avoid karo (peak rate)\n"
            "4) GREEN slots (12AM-5AM) use karo"
        )
        suggestions = ["Schedule banao", "Bill dikhao", "Geyser schedule karo"]
    
    else:
        response = (
            "Samjha nahi. Aap ye try kar sakte hain:\n"
            "• 'bill kitna hua' - reading dekhne ke liye\n"
            "• 'geyser chalu karo' - appliance control\n"
            "• 'tips do' - savings advice"
        )
        suggestions = ["Bill kitna hua", "Geyser chalu karo", "Tips do"]
    
    return ChatResponse(
        response=response,
        intent=intent,
        appliance=appliance,
        suggestions=suggestions
    )


@router.get('/chat/intents')
async def get_intents():
    """Get available intents and example phrases"""
    return {
        'intents': {
            'info': {
                'description': 'Ask about current bill, usage, balance',
                'examples': ['bill kitna hua', 'aaj ka kharcha', 'balance check']
            },
            'override': {
                'description': 'Turn appliance ON/OFF manually',
                'examples': ['geyser chalu karo', 'AC on karo', 'WM start']
            },
            'explain': {
                'description': 'Understand why schedule was made',
                'examples': ['kyun ye time?', 'schedule explain karo', 'reason batao']
            },
            'advice': {
                'description': 'Get savings tips',
                'examples': ['tips do', 'kaise bachaye', 'savings batao']
            }
        },
        'appliances': list(APPLIANCES_NLU.keys())
    }
