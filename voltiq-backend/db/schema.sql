-- VoltIQ Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- ===================
-- USERS
-- ===================
CREATE TABLE users (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone            VARCHAR(15) UNIQUE NOT NULL,
    name             VARCHAR(100),
    discom           VARCHAR(50),
    meter_number     VARCHAR(50),
    connection_type  VARCHAR(20) DEFAULT 'prepaid',
    balance          FLOAT DEFAULT 200.0,
    onboarded        BOOLEAN DEFAULT false,
    persona          VARCHAR(30),
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ===================
-- APPLIANCES
-- ===================
CREATE TABLE appliances (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
    name             VARCHAR(30) NOT NULL,
    power_kw         FLOAT NOT NULL,
    min_hours        INT NOT NULL DEFAULT 1,
    ready_by_hour    INT,
    preferred_after  INT,
    is_active        BOOLEAN DEFAULT true,
    tapo_device_ip   VARCHAR(50),
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ===================
-- MILP RESULTS
-- ===================
CREATE TABLE milp_results (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID REFERENCES users(id),
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    total_cost       FLOAT,
    baseline_cost    FLOAT,
    savings_rs       FLOAT,
    savings_pct      FLOAT,
    solve_time_ms    INT,
    schedule_json    TEXT,
    pipeline         VARCHAR(100)
);

-- ===================
-- SCHEDULES
-- ===================
CREATE TABLE schedules (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID REFERENCES users(id),
    appliance_id     UUID REFERENCES appliances(id),
    hour             INT NOT NULL,
    action           VARCHAR(5),
    cost_rs          FLOAT,
    tariff_rate      FLOAT,
    executed         BOOLEAN DEFAULT false,
    executed_at      TIMESTAMPTZ,
    scheduled_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ===================
-- OVERRIDES (BHV retraining)
-- ===================
CREATE TABLE overrides (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID REFERENCES users(id),
    appliance_id     UUID REFERENCES appliances(id),
    original_hour    INT,
    override_hour    INT,
    extra_cost_rs    FLOAT,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ===================
-- BILLING HISTORY
-- ===================
CREATE TABLE billing_history (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID REFERENCES users(id),
    month            INT,
    year             INT,
    baseline_rs      FLOAT,
    actual_rs        FLOAT,
    savings_rs       FLOAT,
    co2_saved_kg     FLOAT,
    UNIQUE(user_id, month, year)
);

-- ===================
-- USER SCORES
-- ===================
CREATE TABLE user_scores (
    user_id          UUID PRIMARY KEY REFERENCES users(id),
    score            INT DEFAULT 50,
    colony_rank      INT,
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ===================
-- ALERTS
-- ===================
CREATE TABLE alerts (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID REFERENCES users(id),
    type             VARCHAR(30),
    message          TEXT,
    severity         VARCHAR(20),
    is_read          BOOLEAN DEFAULT false,
    accepted         BOOLEAN,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ===================
-- INDEXES for performance
-- ===================
CREATE INDEX idx_appliances_user_id ON appliances(user_id);
CREATE INDEX idx_schedules_user_id ON schedules(user_id);
CREATE INDEX idx_schedules_appliance_id ON schedules(appliance_id);
CREATE INDEX idx_milp_results_user_id ON milp_results(user_id);
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_overrides_user_id ON overrides(user_id);
CREATE INDEX idx_billing_history_user_id ON billing_history(user_id);
