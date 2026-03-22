# VoltIQ Configuration
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    REDIS_PASSWORD: str = ""
    
    # TP-Link Tapo
    TAPO_EMAIL: str = ""
    TAPO_PASSWORD: str = ""
    TAPO_DEVICE_IP: str = "192.168.1.100"
    
    # JWT
    JWT_SECRET: str = "voltiq-dev-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_HOURS: int = 24
    
    # ML Models Path
    MODELS_PATH: str = "models"
    
    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings():
    return Settings()


settings = get_settings()
