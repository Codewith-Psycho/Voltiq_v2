# main.py - VoltIQ FastAPI Entry Point

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

# ML Models — global instances
from ml.lfe_model import LFEModel
from ml.outage_model import OPCModel
from ml.behavior_model import BHVModel
from ml.nilm_model import NILMModel
from services.redis_client import redis_manager

# Global model registry
models = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("=" * 50)
    print("🚀 VoltIQ Backend Starting...")
    print("=" * 50)
    
    # Connect Redis
    print("📡 Connecting to Redis...")
    await redis_manager.connect()
    print("✅ Redis connected!")
    
    # Load ML Models
    print("🧠 Loading ML models...")
    models['lfe'] = LFEModel()
    models['opc'] = OPCModel()
    models['bhv'] = BHVModel()
    models['nilm'] = NILMModel()
    print("✅ All 4 models loaded!")
    
    print("=" * 50)
    print("✅ VoltIQ API Ready!")
    print("   Pipeline: LFE → BHV → OPC → MILP")
    print("=" * 50)
    
    yield
    
    # Shutdown
    print("🛑 Shutting down VoltIQ...")
    await redis_manager.disconnect()
    print("👋 Goodbye!")


app = FastAPI(
    title="VoltIQ API",
    description="Smart Home Energy Optimizer - MILP + ML Pipeline",
    version="2.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers
from routers import auth, meter, optimize, devices, chat, ml, billing, alerts, websocket

# Register routers
app.include_router(auth.router,      prefix="/auth",    tags=["Auth"])
app.include_router(meter.router,     prefix="/meter",   tags=["Meter"])
app.include_router(optimize.router,  prefix="/api",     tags=["Optimize"])
app.include_router(devices.router,   prefix="/api",     tags=["Devices"])
app.include_router(chat.router,      prefix="/api",     tags=["Chat"])
app.include_router(ml.router,        prefix="/ml",      tags=["ML Models"])
app.include_router(billing.router,   prefix="/api",     tags=["Billing"])
app.include_router(billing.router,   prefix="",         tags=["Billing"])  # Also at /billing/simulate for frontend
app.include_router(alerts.router,    prefix="/api",     tags=["Alerts"])
app.include_router(websocket.router, prefix="",         tags=["WebSocket"])  # No prefix for /ws/colony


@app.get("/")
async def root():
    return {
        "message": "VoltIQ API running!",
        "version": "2.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "models": {k: "loaded" for k in models},
        "pipeline": "LFE→BHV→OPC→MILP"
    }


def get_models():
    """Access loaded ML models from routers"""
    return models


# Run: uvicorn main:app --reload
