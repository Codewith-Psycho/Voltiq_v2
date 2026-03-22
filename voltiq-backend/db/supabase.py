# db/supabase.py
# Supabase PostgreSQL Client for VoltIQ

from config import settings
from typing import Optional, List, Dict, Any

# Lazy initialization to avoid import-time errors
_supabase_client = None


def get_supabase():
    """Get or create Supabase client (lazy initialization)"""
    global _supabase_client
    
    if _supabase_client is None:
        try:
            from supabase import create_client
            _supabase_client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_KEY
            )
        except Exception as e:
            print(f"⚠️ Supabase connection failed: {e}")
            print("   Running in offline mode (using dummy client)")
            _supabase_client = DummySupabaseClient()
    
    return _supabase_client


class DummySupabaseClient:
    """Dummy client for testing when Supabase unavailable"""
    
    def table(self, name):
        return DummyTable(name)


class DummyTable:
    """Dummy table operations"""
    
    def __init__(self, name):
        self.name = name
        self._data = []
    
    def select(self, *args):
        return self
    
    def insert(self, data):
        return self
    
    def update(self, data):
        return self
    
    def upsert(self, data):
        return self
    
    def delete(self):
        return self
    
    def eq(self, *args):
        return self
    
    def order(self, *args, **kwargs):
        return self
    
    def limit(self, n):
        return self
    
    def execute(self):
        return DummyResponse([])


class DummyResponse:
    def __init__(self, data):
        self.data = data


class SupabaseClient:
    """Wrapper for Supabase operations"""
    
    def __init__(self):
        self._client = None
    
    @property
    def client(self):
        if self._client is None:
            self._client = get_supabase()
        return self._client
    
    # ===================
    # USERS
    # ===================
    async def create_user(self, phone: str, name: str = None) -> Dict:
        try:
            result = self.client.table("users").insert({
                "phone": phone,
                "name": name
            }).execute()
            return result.data[0] if result.data else {"id": "demo-user", "phone": phone}
        except Exception as e:
            print(f"DB Error: {e}")
            return {"id": "demo-user", "phone": phone}
    
    async def get_user_by_phone(self, phone: str) -> Optional[Dict]:
        try:
            result = self.client.table("users").select("*").eq("phone", phone).execute()
            return result.data[0] if result.data else None
        except:
            return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict]:
        try:
            result = self.client.table("users").select("*").eq("id", user_id).execute()
            return result.data[0] if result.data else None
        except:
            return None
    
    async def update_user(self, user_id: str, data: Dict) -> Dict:
        try:
            result = self.client.table("users").update(data).eq("id", user_id).execute()
            return result.data[0] if result.data else None
        except:
            return None
    
    # ===================
    # APPLIANCES
    # ===================
    async def create_appliance(self, user_id: str, appliance_data: Dict) -> Dict:
        try:
            appliance_data["user_id"] = user_id
            result = self.client.table("appliances").insert(appliance_data).execute()
            return result.data[0] if result.data else None
        except:
            return None
    
    async def get_user_appliances(self, user_id: str) -> List[Dict]:
        try:
            result = self.client.table("appliances").select("*").eq("user_id", user_id).eq("is_active", True).execute()
            return result.data or []
        except:
            return []
    
    async def get_appliance_by_id(self, appliance_id: str) -> Optional[Dict]:
        try:
            result = self.client.table("appliances").select("*").eq("id", appliance_id).execute()
            return result.data[0] if result.data else None
        except:
            return None
    
    async def update_appliance(self, appliance_id: str, data: Dict) -> Dict:
        try:
            result = self.client.table("appliances").update(data).eq("id", appliance_id).execute()
            return result.data[0] if result.data else None
        except:
            return None
    
    # ===================
    # MILP RESULTS
    # ===================
    async def save_milp_result(self, user_id: str, result_data: Dict) -> Dict:
        try:
            result_data["user_id"] = user_id
            result = self.client.table("milp_results").insert(result_data).execute()
            return result.data[0] if result.data else None
        except:
            return None
    
    async def get_latest_milp_result(self, user_id: str) -> Optional[Dict]:
        try:
            result = self.client.table("milp_results").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
            return result.data[0] if result.data else None
        except:
            return None
    
    # ===================
    # SCHEDULES
    # ===================
    async def save_schedules(self, schedules: List[Dict]) -> List[Dict]:
        try:
            result = self.client.table("schedules").insert(schedules).execute()
            return result.data or []
        except:
            return []
    
    async def get_user_schedules(self, user_id: str, executed: bool = None) -> List[Dict]:
        try:
            query = self.client.table("schedules").select("*").eq("user_id", user_id)
            if executed is not None:
                query = query.eq("executed", executed)
            result = query.order("hour").execute()
            return result.data or []
        except:
            return []
    
    async def mark_schedule_executed(self, schedule_id: str) -> Dict:
        try:
            result = self.client.table("schedules").update({
                "executed": True,
                "executed_at": "now()"
            }).eq("id", schedule_id).execute()
            return result.data[0] if result.data else None
        except:
            return None
    
    # ===================
    # OVERRIDES
    # ===================
    async def save_override(self, override_data: Dict) -> Dict:
        try:
            result = self.client.table("overrides").insert(override_data).execute()
            return result.data[0] if result.data else None
        except:
            return None
    
    async def get_user_overrides(self, user_id: str) -> List[Dict]:
        try:
            result = self.client.table("overrides").select("*").eq("user_id", user_id).execute()
            return result.data or []
        except:
            return []
    
    # ===================
    # BILLING HISTORY
    # ===================
    async def save_billing(self, billing_data: Dict) -> Dict:
        try:
            result = self.client.table("billing_history").upsert(billing_data).execute()
            return result.data[0] if result.data else None
        except:
            return None
    
    async def get_billing_history(self, user_id: str) -> List[Dict]:
        try:
            result = self.client.table("billing_history").select("*").eq("user_id", user_id).order("year", desc=True).order("month", desc=True).execute()
            return result.data or []
        except:
            return []
    
    # ===================
    # USER SCORES
    # ===================
    async def update_user_score(self, user_id: str, score: int) -> Dict:
        try:
            result = self.client.table("user_scores").upsert({
                "user_id": user_id,
                "score": score,
                "updated_at": "now()"
            }).execute()
            return result.data[0] if result.data else None
        except:
            return None
    
    async def get_user_score(self, user_id: str) -> Optional[Dict]:
        try:
            result = self.client.table("user_scores").select("*").eq("user_id", user_id).execute()
            return result.data[0] if result.data else None
        except:
            return None
    
    # ===================
    # ALERTS
    # ===================
    async def create_alert(self, alert_data: Dict) -> Dict:
        try:
            result = self.client.table("alerts").insert(alert_data).execute()
            return result.data[0] if result.data else None
        except:
            return None
    
    async def get_user_alerts(self, user_id: str, unread_only: bool = False) -> List[Dict]:
        try:
            query = self.client.table("alerts").select("*").eq("user_id", user_id)
            if unread_only:
                query = query.eq("is_read", False)
            result = query.order("created_at", desc=True).execute()
            return result.data or []
        except:
            return []
    
    async def mark_alert_read(self, alert_id: str) -> Dict:
        try:
            result = self.client.table("alerts").update({"is_read": True}).eq("id", alert_id).execute()
            return result.data[0] if result.data else None
        except:
            return None


# Singleton instance
supabase_client = SupabaseClient()

