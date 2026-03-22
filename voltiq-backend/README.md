# VoltIQ Backend 🔌⚡

> AI-Powered Smart Home Energy Optimizer for India's Smart Meter Infrastructure

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green.svg)](https://fastapi.tiangolo.com)
[![OR-Tools](https://img.shields.io/badge/OR--Tools-MILP-orange.svg)](https://developers.google.com/optimization)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🎯 Overview

VoltIQ is a software intelligence layer that uses **MILP optimization + 4 ML models** to schedule home appliances at the cheapest tariff slots. Built for Indian DISCOM tariff structures (UPPCL ToD rates).

### 4-Brain Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      VoltIQ Pipeline                        │
├─────────────────────────────────────────────────────────────┤
│  ML (Eyes)     →  4 models forecast, never decide           │
│  MILP (Brain)  →  OR-Tools CBC, sole decision authority     │
│  Action (Hands)→  TP-Link Tapo physical control             │
│  Chat (Voice)  →  Hindi+English 4-intent NLU                │
└─────────────────────────────────────────────────────────────┘
```

### Key Results
- **61.5% savings** on electricity bills
- **9ms** MILP solve time
- **4 ML models** running in parallel
- **Rs.50.40/day** typical savings

---

## 📁 Project Structure

```
voltiq-backend/
├── main.py                 # FastAPI entry point
├── config.py               # Pydantic settings
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables
│
├── routers/                # API endpoints
│   ├── auth.py             # OTP/JWT authentication
│   ├── meter.py            # Live meter data + tariff
│   ├── optimize.py         # ML→MILP pipeline
│   ├── devices.py          # Tapo smart plug control
│   ├── chat.py             # Hindi/English chatbot
│   ├── ml.py               # Direct ML endpoints
│   ├── billing.py          # Savings simulation
│   └── alerts.py           # User notifications
│
├── milp/                   # Optimization engine
│   └── solver.py           # OR-Tools CBC solver
│
├── ml/                     # Machine Learning models
│   ├── lfe_model.py        # Load Forecast Engine
│   ├── outage_model.py     # Outage Probability Classifier
│   ├── behavior_model.py   # User Behavior Model
│   └── nilm_model.py       # Appliance Detection (NILM)
│
├── models/                 # Trained ML model files (.pkl, .keras)
│   ├── baseline.pkl        # LFE baseline model
│   ├── p90.pkl             # LFE P90 model
│   ├── peak.pkl            # LFE peak classifier
│   ├── outage_clf.pkl      # OPC model
│   ├── xgb_behavior.pkl    # BHV model
│   └── nilm_voltiq.keras   # NILM CNN model
│
├── services/               # External services
│   ├── redis_client.py     # Redis cache operations
│   ├── tapo_control.py     # TP-Link Tapo API
│   └── alert_engine.py     # Alert generation
│
├── simulator/              # Dummy data generators
│   ├── tariff.py           # UPPCL tariff rates
│   └── meter_sim.py        # Simulated meter readings
│
└── db/                     # Database
    ├── supabase.py         # Supabase client
    └── schema.sql          # PostgreSQL schema
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Redis Server
- Git

### 1. Clone & Setup

```bash
cd voltiq-backend
python -m venv venv

# Windows
.\venv\Scripts\Activate.ps1

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Environment Variables

Create `.env` file:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRY_HOURS=24

# Tapo Smart Plug (optional)
TAPO_IP=192.168.1.100
TAPO_EMAIL=your-email@example.com
TAPO_PASSWORD=your-password
```

### 3. Start Redis

```powershell
# Windows
Start-Process "C:\Program Files\Redis\redis-server.exe" -WindowStyle Hidden

# Linux/Mac
redis-server --daemonize yes
```

### 4. Run Server

```bash
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### 5. Access API Docs

Open: **http://127.0.0.1:8000/docs**

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/send-otp` | Send OTP to phone |
| POST | `/auth/verify-otp` | Verify OTP & get JWT |
| POST | `/auth/logout` | Invalidate session |
| GET | `/auth/me` | Get current user |

### Meter Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/meter/live/{user_id}` | Live meter reading |
| GET | `/meter/history/{user_id}` | Historical readings |
| GET | `/meter/profile/24hr/{user_id}` | 24-hour profile |
| GET | `/meter/tariff/today` | Today's tariff schedule |

### Optimization (Core)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/optimize` | Run ML→MILP pipeline |
| GET | `/api/schedule/{user_id}` | Get cached schedule |
| POST | `/api/override` | Manual override |

### Device Control
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/appliance/control` | Turn ON/OFF |
| GET | `/api/appliance/status/{id}` | Get device status |
| GET | `/api/appliance/list` | List all appliances |

### ML Models
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ml/forecast/24hr` | Load forecast (LFE) |
| GET | `/ml/outage/probability` | Outage risk (OPC) |
| GET | `/ml/behavior/{user_id}` | Usage patterns (BHV) |
| GET | `/ml/nilm/detect` | Appliance detection |
| GET | `/ml/summary/{user_id}` | All ML results |

### Chatbot
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message |
| GET | `/api/chat/intents` | Available intents |

### Billing
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/billing/simulate` | Monthly savings |
| GET | `/api/billing/history/{user_id}` | Bill history |
| GET | `/api/billing/compare` | Compare costs |

### Alerts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts/{user_id}` | Get alerts |
| POST | `/api/alerts` | Create alert |
| POST | `/api/alerts/{id}/read` | Mark as read |

---

## 🧠 ML Models

### 1. VoltIQ-LFE (Load Forecast Engine)
- **Type**: LightGBM (3 models)
- **Input**: 672 readings (7 days × 96 intervals)
- **Output**: `baseline_hourly[24]`, `p90_hourly[24]`, `peak_prob[24]`
- **MILP Use**: Dynamic load cap per hour

### 2. VoltIQ-OPC (Outage Probability Classifier)
- **Type**: XGBoost
- **Data**: Real IEX India DAM 2018-2024 (233,665 rows)
- **Output**: `[{hour, probability, is_high_risk}×24]`
- **MILP Use**: Hard block high-risk hours (≥60%)

### 3. VoltIQ-BHV (Behavior Model)
- **Type**: XGBoost
- **Input**: `today_24 + yesterday_24 + is_weekend`
- **Output**: `{hour: probability}` per appliance
- **MILP Use**: Soft preference weights in objective

### 4. VoltIQ-NILM (Non-Intrusive Load Monitoring)
- **Type**: CNN Hybrid + Rule-based fallback
- **Input**: 8 recent readings
- **Output**: `{detected, confidence, state, current_kw}`
- **Classes**: AC, Washing Machine, Fridge, Cooler, Other

---

## ⚡ MILP Solver

### Constraints
1. **C1**: Dynamic load cap (LFE-powered) - max 3.5kW
2. **C2**: Minimum run duration per appliance
3. **C3**: Geyser ready by 6 AM
4. **C4**: Washing machine preferred after 10 PM
5. **C5**: OPC outage hours hard block
6. **C6**: Prepaid balance floor (Rs.50 minimum)
7. **C7**: Force ON (manual override)

### UPPCL Tariff Structure
| Slot | Hours | Rate (Rs/kWh) | Color |
|------|-------|---------------|-------|
| Sasta (Off-peak) | 12AM-5AM, 10PM-12AM | 3.5 | 🟢 GREEN |
| Din (Standard) | 10AM-6PM | 4.9 | 🟡 YELLOW |
| Peak Morning | 6AM-10AM | 8.4 | 🔴 RED |
| Peak Evening | 6PM-10PM | 9.1 | 🔴 RED |

---

## 💬 Chatbot Intents

The chatbot understands Hindi + English with 4 intents:

| Intent | Keywords | Example |
|--------|----------|---------|
| **info** | bill, kitna, cost, paisa, aaj | "Bill kitna hua?" |
| **override** | chalu, on karo, start, abhi | "Geyser chalu karo" |
| **explain** | kyun, why, explain, kya hua | "Kyun schedule kiya?" |
| **advice** | tips, bachau, save, suggest | "Tips do savings ke" |

### Appliance Recognition
- Geyser: geyser, paani garam, hot water
- AC: ac, thanda, air condition
- WM: washing, machine, kapde

---

## 📊 Redis Cache Structure

| Key Pattern | TTL | Description |
|-------------|-----|-------------|
| `meter:{user}:live` | 60s | Latest meter reading |
| `meter:{user}:history` | - | 672 readings (7 days) |
| `milp:{user}:schedule` | 6 hrs | Optimization result |
| `ml:lfe:{user}` | 15 min | Load forecast |
| `ml:outage:current` | 1 hr | Outage predictions |
| `ml:behavior:{user}` | 24 hrs | Behavior model |
| `ml:nilm:{user}` | 60s | NILM detection |
| `alerts:{user}` | - | User alerts list |

---

## 🗄️ Database Schema (Supabase)

```sql
-- Core tables
users           -- User profiles
appliances      -- Registered devices
milp_results    -- Optimization history
schedules       -- Active schedules
overrides       -- Manual overrides
billing_history -- Monthly bills
user_scores     -- Gamification
alerts          -- Notifications
```

---

## 🔧 Configuration

### config.py Settings

```python
class Settings:
    SUPABASE_URL: str
    SUPABASE_KEY: str
    REDIS_URL: str = "redis://localhost:6379"
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_HOURS: int = 24
    TAPO_IP: str = ""
    TAPO_EMAIL: str = ""
    TAPO_PASSWORD: str = ""
```

---

## 🧪 Testing

### Health Check
```bash
curl http://127.0.0.1:8000/health
```

### Run Optimization
```bash
curl -X POST "http://127.0.0.1:8000/api/optimize?user_id=demo&balance=300"
```

### Chat Test
```bash
curl -X POST "http://127.0.0.1:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "bill kitna hua", "user_id": "demo"}'
```

---

## 📈 Performance

| Metric | Value |
|--------|-------|
| MILP Solve Time | ~9ms |
| API Response | <100ms |
| ML Inference | ~50ms (parallel) |
| Redis Cache Hit | <1ms |
| Concurrent Users | 100+ |

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Framework** | FastAPI + Uvicorn |
| **Optimization** | OR-Tools (CBC Solver) |
| **ML Models** | LightGBM, XGBoost, TensorFlow |
| **Cache** | Redis |
| **Database** | Supabase (PostgreSQL) |
| **Smart Plugs** | TP-Link Tapo P100/P110 |
| **Auth** | JWT + OTP |

---

## 📝 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_KEY` | Yes | Supabase anon key |
| `REDIS_URL` | No | Redis connection (default: localhost:6379) |
| `JWT_SECRET` | Yes | Secret for JWT tokens |
| `TAPO_IP` | No | Tapo plug IP address |
| `TAPO_EMAIL` | No | TP-Link account email |
| `TAPO_PASSWORD` | No | TP-Link account password |

---

## 🚀 Deployment

### Local Development
```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Production (Railway/Render)
```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Docker (optional)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 📄 License

MIT License - Feel free to use for personal and commercial projects.

---

## 👨‍💻 Author

**INSTINCT 4.0 Team**

Built for India's smart meter revolution 🇮🇳

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

<p align="center">
  <b>VoltIQ - Bijli Bachao, Paisa Bachao! ⚡💰</b>
</p>
