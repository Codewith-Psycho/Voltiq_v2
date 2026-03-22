# VoltIQ - Smart Home Energy Optimizer 🔌⚡

> AI-powered MILP optimization for Indian smart meters | 61.5% electricity savings

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green.svg)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org)
[![OR-Tools](https://img.shields.io/badge/OR--Tools-MILP-orange.svg)](https://developers.google.com/optimization)

---

## 🎯 What is VoltIQ?

VoltIQ is a **software intelligence layer** for India's smart meter infrastructure. It uses **4 ML models + MILP optimization** to automatically schedule home appliances at the cheapest tariff slots.

### Key Results
- **61.5% cost savings** on electricity bills
- **8.5ms solve time** for 24-hour optimization
- **Rs. 14,616/year** potential savings per household
- **2,397 kg CO₂** saved annually

---

## 🧠 4-Brain Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      VoltIQ Pipeline                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   👁️ ML = Eyes        → 4 models FORECAST, never decide    │
│   🧠 MILP = Brain     → OR-Tools CBC, sole decision maker  │
│   🤚 Action = Hands   → TP-Link Tapo physical control      │
│   🗣️ Chat = Voice     → Hindi+English 4-intent NLU         │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Data Flow:
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   LFE    │    │   OPC    │    │   BHV    │    │   NILM   │
│ Forecast │───▶│  Outage  │───▶│ Behavior │───▶│ Detector │
│ (Load)   │    │ (Risk)   │    │ (Prefs)  │    │(Appliance│
└────┬─────┘    └────┬─────┘    └────┬─────┘    └──────────┘
     │               │               │
     └───────────────┼───────────────┘
                     ▼
              ┌──────────────┐
              │  MILP Solver │
              │  (OR-Tools)  │
              └──────┬───────┘
                     ▼
              ┌──────────────┐
              │   Schedule   │
              │  (24-hour)   │
              └──────────────┘
```

---

## 🤖 4 ML Models

### 1. VoltIQ-LFE (Load Forecast Engine)
- **Model**: LightGBM 3-model ensemble
- **Input**: 672 readings (7 days × 96 readings/day)
- **Output**: `baseline_hourly[24]`, `p90_hourly[24]`, `peak_prob[24]`
- **MILP Use**: Dynamic load cap per hour

### 2. VoltIQ-OPC (Outage Probability Classifier)
- **Model**: XGBoost Classifier
- **Data**: Real IEX India DAM 2018-2024 (233,665 rows)
- **Output**: `[{hour, probability, is_high_risk} × 24]`
- **MILP Use**: Hard block high-risk hours

### 3. VoltIQ-BHV (Behavior Model)
- **Model**: XGBoost Regressor
- **Input**: `today_24 + yesterday_24 + is_weekend`
- **Output**: `{hour: probability}` per appliance
- **MILP Use**: Soft preference weights in objective

### 4. VoltIQ-NILM (Non-Intrusive Load Monitor)
- **Model**: CNN Hybrid (TensorFlow/Keras)
- **Data**: iAWE IIT Delhi + Synthetic Indian signatures
- **Output**: Detected appliances from power signature
- **Classes**: AC, Geyser, WM, Fridge, Fan

---

## ⚡ MILP Engine

The core optimizer uses **Google OR-Tools CBC** solver with 7 constraint types:

| Constraint | Description |
|------------|-------------|
| C1: Load Cap | Dynamic per-hour limit from LFE |
| C2: Min Duration | Appliance must run minimum hours |
| C3: Ready By | Geyser ready by 6 AM |
| C4: Preferred After | WM after 10 PM |
| C5: Outage Block | OPC high-risk hours blocked |
| C6: Prepaid Floor | Keep Rs.50 balance reserve |
| C7: Force ON | User override support |

### UPPCL Tariff Schedule
```
GREEN (Sasta):  12 AM - 5 AM, 10 PM - 12 AM  → Rs. 3.5/kWh
YELLOW (Din):   10 AM - 6 PM                  → Rs. 4.9/kWh
RED (Peak):     6 AM - 10 AM, 6 PM - 10 PM   → Rs. 8.4-9.1/kWh
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Python 3.11 | Runtime |
| FastAPI | Web framework |
| Uvicorn | ASGI server |
| OR-Tools | MILP solver |
| Redis | Caching & real-time |
| PostgreSQL (Supabase) | Persistence |
| LightGBM | LFE model |
| XGBoost | OPC, BHV models |
| TensorFlow/Keras | NILM model |

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Zustand | State management |
| Recharts | Data visualization |
| Lucide Icons | UI icons |

---

## 📁 Project Structure

```
Instinctfull/
├── voltiq-backend/
│   ├── main.py              # FastAPI entry point
│   ├── config.py            # Environment config
│   ├── routers/
│   │   ├── auth.py          # OTP authentication
│   │   ├── optimize.py      # ML→MILP pipeline
│   │   ├── chat.py          # 4-intent chatbot
│   │   ├── billing.py       # Savings calculator
│   │   ├── meter.py         # Meter data
│   │   ├── devices.py       # Tapo control
│   │   ├── ml.py            # ML endpoints
│   │   ├── alerts.py        # Notifications
│   │   └── websocket.py     # Real-time updates
│   ├── ml/
│   │   ├── lfe_model.py     # Load forecast
│   │   ├── outage_model.py  # Outage classifier
│   │   ├── behavior_model.py # User behavior
│   │   └── nilm_model.py    # Appliance detector
│   ├── milp/
│   │   └── solver.py        # OR-Tools optimizer
│   ├── models/              # Trained .pkl files
│   ├── services/
│   │   └── redis_client.py  # Redis manager
│   ├── db/
│   │   └── supabase.py      # Supabase client
│   └── simulator/
│       ├── meter_sim.py     # Meter simulation
│       └── tariff.py        # UPPCL tariffs
│
├── voltiq-frontend/
│   ├── src/
│   │   ├── app/             # Next.js pages
│   │   │   ├── page.tsx     # Landing
│   │   │   ├── login/       # OTP login
│   │   │   ├── onboarding/  # User setup
│   │   │   ├── dashboard/   # Main dashboard
│   │   │   ├── optimize/    # MILP results
│   │   │   ├── chat/        # AI assistant
│   │   │   ├── appliances/  # Device control
│   │   │   ├── billing/     # Cost analysis
│   │   │   ├── alerts/      # Notifications
│   │   │   ├── grid-impact/ # Colony view
│   │   │   └── settings/    # Preferences
│   │   ├── components/      # React components
│   │   └── lib/
│   │       ├── store.ts     # Zustand state
│   │       ├── api.ts       # API client
│   │       └── websocket.ts # WS client
│   └── public/              # Static assets
│
└── README.md                # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Redis Server
- (Optional) Supabase account

### 1. Backend Setup

```bash
cd voltiq-backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate      # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your credentials

# Start Redis (Windows)
Start-Process "C:\Program Files\Redis\redis-server.exe" -WindowStyle Hidden

# Run backend
uvicorn main:app --host 127.0.0.1 --port 8000
```

### 2. Frontend Setup

```bash
cd voltiq-frontend

# Install dependencies
npm install

# Run frontend
npm run dev
```

### 3. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 🔌 API Endpoints

### Core Pipeline
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/optimize` | Run ML→MILP optimization |
| GET | `/api/schedule/{user_id}` | Get cached schedule |
| POST | `/api/override` | Manual appliance control |

### Billing
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/billing/simulate` | Calculate savings |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Hindi+English NLU |
| GET | `/api/chat/intents` | Available intents |

### ML Models
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ml/forecast/24hr` | LFE predictions |
| GET | `/ml/outage/probability` | OPC predictions |
| GET | `/ml/nilm/detect` | NILM detection |

### WebSocket
| Endpoint | Description |
|----------|-------------|
| `ws://localhost:8000/ws/colony` | Real-time colony updates |
| `ws://localhost:8000/ws/meter/{user_id}` | Live meter readings |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/send-otp` | Send OTP |
| POST | `/auth/verify-otp` | Verify & get JWT |
| POST | `/auth/logout` | Invalidate session |

---

## 📊 Sample Response

### POST /api/optimize
```json
{
  "originalCost": 81.9,
  "optimizedCost": 31.5,
  "savings": 50.4,
  "savingsPercent": 61.5,
  "schedule": [
    {
      "appliance": "geyser",
      "hour": 2,
      "time_label": "02:00",
      "cost_rs": 7.0,
      "tariff_rate": 3.5,
      "slot_color": "GREEN"
    },
    {
      "appliance": "ac",
      "hour": 0,
      "time_label": "00:00",
      "cost_rs": 5.25,
      "tariff_rate": 3.5,
      "slot_color": "GREEN"
    }
  ],
  "solveTimeMs": 8.5,
  "pipeline": "LFE→BHV→OPC→MILP",
  "ml_summary": {
    "opc_blocked_hours": [18, 19, 20, 21],
    "opc_risk_count": 4
  }
}
```

---

## 🔧 Environment Variables

```env
# Backend (.env)
REDIS_URL=redis://localhost:6379
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your-anon-key
JWT_SECRET=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRY_HOURS=720

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/colony
```

---

## 🚢 Deployment

### Backend → Railway
```bash
# railway.json already configured
railway up
```

### Frontend → Vercel
```bash
# vercel.json already configured
vercel --prod
```

---

## 📈 Performance Metrics

| Metric | Value |
|--------|-------|
| MILP Solve Time | 8.5ms |
| Cost Savings | 61.5% |
| Monthly Savings | Rs. 1,218 |
| Annual Savings | Rs. 14,616 |
| CO₂ Reduction | 2,397 kg/year |
| API Response | < 100ms |

---

## 🎓 INSTINCT 4.0

This project was developed for **INSTINCT 4.0** hackathon.

**Team Role**: ML & Backend Development

**Key Contributions**:
- 4 ML model pipeline (LFE, OPC, BHV, NILM)
- MILP optimization engine with OR-Tools
- FastAPI backend with Redis caching
- Real-time WebSocket updates
- Hindi+English chatbot

---

## 📜 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 🤝 Contributors

Built with ❤️ for India's smart grid future.

---

*VoltIQ - Bijli bachao, paisa bachao! ⚡💰*
