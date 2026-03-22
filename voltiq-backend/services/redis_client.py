# services/redis_client.py
# Redis Client for VoltIQ - Caching & Real-time Data

import json
from typing import Optional, List, Any
from config import settings


class RedisManager:
    """Async Redis client wrapper for VoltIQ (with fallback to in-memory)"""
    
    # Key prefixes and TTLs
    KEYS = {
        "meter_live": "meter:{uid}:live",
        "meter_history": "meter:{uid}:history",
        "ml_lfe": "ml:lfe:{uid}",
        "ml_outage": "ml:outage:current",
        "ml_behavior": "ml:behavior:{uid}",
        "ml_nilm": "ml:nilm:{uid}",
        "milp_schedule": "milp:{uid}:schedule",
        "alerts": "alerts:{uid}",
        "session": "session:{token}",
    }
    
    TTL = {
        "ml_lfe": 900,
        "ml_outage": 3600,
        "ml_behavior": 86400,
        "ml_nilm": 60,
        "milp_schedule": 21600,
        "session": 2592000,
    }
    
    def __init__(self):
        self.redis = None
        self._connected = False
        self._fallback_store = {}  # In-memory fallback
    
    async def connect(self):
        """Initialize Redis connection (graceful fallback)"""
        try:
            import redis.asyncio as aioredis
            self.redis = aioredis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True
            )
            await self.redis.ping()
            self._connected = True
            print("✅ Redis connected!")
        except Exception as e:
            print(f"⚠️ Redis unavailable: {e}")
            print("   Using in-memory cache fallback")
            self._connected = False
            self.redis = None
    
    async def disconnect(self):
        """Close Redis connection"""
        if self.redis and self._connected:
            await self.redis.close()
    
    def _key(self, key_type: str, **kwargs) -> str:
        """Generate Redis key from template"""
        template = self.KEYS.get(key_type, key_type)
        return template.format(**kwargs)
    
    # ===================
    # GENERIC OPERATIONS
    # ===================
    async def get(self, key: str, default: Any = None) -> Any:
        """Get value, return default if not found"""
        try:
            if self._connected and self.redis:
                val = await self.redis.get(key)
                return json.loads(val) if val else default
            else:
                return self._fallback_store.get(key, default)
        except Exception:
            return default
    
    async def set(self, key: str, value: Any, ttl: int = None):
        """Set value with optional TTL"""
        data = json.dumps(value) if not isinstance(value, str) else value
        try:
            if self._connected and self.redis:
                if ttl:
                    await self.redis.setex(key, ttl, data)
                else:
                    await self.redis.set(key, data)
            else:
                self._fallback_store[key] = json.loads(data) if isinstance(value, str) else value
        except Exception:
            self._fallback_store[key] = value
    
    async def delete(self, key: str):
        """Delete a key"""
        try:
            if self._connected and self.redis:
                await self.redis.delete(key)
            elif key in self._fallback_store:
                del self._fallback_store[key]
        except Exception:
            pass
    
    # ===================
    # METER DATA
    # ===================
    async def set_meter_live(self, uid: str, reading: dict):
        key = self._key("meter_live", uid=uid)
        await self.set(key, reading)
    
    async def get_meter_live(self, uid: str) -> Optional[dict]:
        key = self._key("meter_live", uid=uid)
        return await self.get(key)
    
    async def push_meter_history(self, uid: str, reading: dict):
        key = self._key("meter_history", uid=uid)
        try:
            if self._connected and self.redis:
                await self.redis.lpush(key, json.dumps(reading))
                await self.redis.ltrim(key, 0, 671)
            else:
                if key not in self._fallback_store:
                    self._fallback_store[key] = []
                self._fallback_store[key].insert(0, reading)
                self._fallback_store[key] = self._fallback_store[key][:672]
        except Exception:
            pass
    
    async def get_meter_history(self, uid: str, count: int = 672) -> List[dict]:
        key = self._key("meter_history", uid=uid)
        try:
            if self._connected and self.redis:
                data = await self.redis.lrange(key, 0, count - 1)
                return [json.loads(r) for r in data] if data else []
            else:
                return self._fallback_store.get(key, [])[:count]
        except Exception:
            return []
    
    # ===================
    # ML CACHE
    # ===================
    async def cache_lfe(self, uid: str, forecast: dict):
        key = self._key("ml_lfe", uid=uid)
        await self.set(key, forecast, self.TTL["ml_lfe"])
    
    async def get_lfe(self, uid: str) -> Optional[dict]:
        key = self._key("ml_lfe", uid=uid)
        return await self.get(key)
    
    async def cache_outage(self, predictions: list):
        key = self.KEYS["ml_outage"]
        await self.set(key, predictions, self.TTL["ml_outage"])
    
    async def get_outage(self) -> Optional[list]:
        key = self.KEYS["ml_outage"]
        return await self.get(key)
    
    async def cache_behavior(self, uid: str, probs: dict):
        key = self._key("ml_behavior", uid=uid)
        await self.set(key, probs, self.TTL["ml_behavior"])
    
    async def get_behavior(self, uid: str) -> Optional[dict]:
        key = self._key("ml_behavior", uid=uid)
        return await self.get(key)
    
    async def cache_nilm(self, uid: str, result: dict):
        key = self._key("ml_nilm", uid=uid)
        await self.set(key, result, self.TTL["ml_nilm"])
    
    async def get_nilm(self, uid: str) -> Optional[dict]:
        key = self._key("ml_nilm", uid=uid)
        return await self.get(key)
    
    # ===================
    # MILP SCHEDULE
    # ===================
    async def cache_schedule(self, uid: str, schedule: dict):
        key = self._key("milp_schedule", uid=uid)
        await self.set(key, schedule, self.TTL["milp_schedule"])
    
    async def get_schedule(self, uid: str) -> Optional[dict]:
        key = self._key("milp_schedule", uid=uid)
        return await self.get(key)
    
    # ===================
    # SESSION
    # ===================
    async def set_session(self, token: str, user_id: str):
        key = self._key("session", token=token)
        await self.set(key, user_id, self.TTL["session"])
    
    async def get_session(self, token: str) -> Optional[str]:
        key = self._key("session", token=token)
        return await self.get(key)
    
    async def delete_session(self, token: str):
        key = self._key("session", token=token)
        await self.delete(key)
    
    # ===================
    # ALERTS
    # ===================
    async def push_alert(self, uid: str, alert: dict):
        key = self._key("alerts", uid=uid)
        try:
            if self._connected and self.redis:
                await self.redis.lpush(key, json.dumps(alert))
                await self.redis.ltrim(key, 0, 49)
            else:
                if key not in self._fallback_store:
                    self._fallback_store[key] = []
                self._fallback_store[key].insert(0, alert)
                self._fallback_store[key] = self._fallback_store[key][:50]
        except Exception:
            pass
    
    async def get_alerts(self, uid: str, count: int = 10) -> List[dict]:
        key = self._key("alerts", uid=uid)
        try:
            if self._connected and self.redis:
                data = await self.redis.lrange(key, 0, count - 1)
                return [json.loads(a) for a in data] if data else []
            else:
                return self._fallback_store.get(key, [])[:count]
        except Exception:
            return []


# Singleton instance
redis_manager = RedisManager()
