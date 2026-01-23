-- Add missing columns + core feature tables for AURA MVP

-- =========================
-- USERS / CLINICS
-- =========================
ALTER TABLE clinics
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS license_no TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS assigned_doctor_id BIGINT;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_users_assigned_doctor'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT fk_users_assigned_doctor
      FOREIGN KEY (assigned_doctor_id) REFERENCES users(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_assigned_doctor ON users(assigned_doctor_id);

-- =========================
-- ANALYSIS: doctor review + traceability
-- =========================
ALTER TABLE analysis
  ADD COLUMN IF NOT EXISTS doctor_conclusion TEXT,
  ADD COLUMN IF NOT EXISTS doctor_note TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by BIGINT,
  ADD COLUMN IF NOT EXISTS ai_version TEXT,
  ADD COLUMN IF NOT EXISTS thresholds_json JSONB,
  ADD COLUMN IF NOT EXISTS error_message TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_analysis_reviewed_by'
  ) THEN
    ALTER TABLE analysis
      ADD CONSTRAINT fk_analysis_reviewed_by
      FOREIGN KEY (reviewed_by) REFERENCES users(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_analysis_status ON analysis(status);

-- =========================
-- BILLING / CREDITS
-- =========================
CREATE TABLE IF NOT EXISTS service_packages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(14,2) NOT NULL DEFAULT 0,
  credits INT NOT NULL DEFAULT 0,
  duration_days INT,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS user_credits (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  remaining_credits INT NOT NULL DEFAULT 0,
  total_used INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS order_transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  package_id BIGINT REFERENCES service_packages(id) ON DELETE SET NULL,
  amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  payment_method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON order_transactions(user_id);

-- =========================
-- NOTIFICATIONS
-- =========================
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  message TEXT,
  type TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- =========================
-- CHAT
-- =========================
CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGSERIAL PRIMARY KEY,
  sender_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  receiver_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_pair_time ON chat_messages(sender_id, receiver_id, timestamp);

-- =========================
-- PRIVACY
-- =========================
CREATE TABLE IF NOT EXISTS privacy_settings (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  allow_data_collection BOOLEAN NOT NULL DEFAULT TRUE,
  share_results_with_research BOOLEAN NOT NULL DEFAULT FALSE
);

-- =========================
-- AUDIT LOGS
-- =========================
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  username TEXT,
  details TEXT,
  ip_address TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_logs(timestamp);

-- =========================
-- ASYNC QUEUE
-- =========================
CREATE TABLE IF NOT EXISTS analysis_jobs (
  id BIGSERIAL PRIMARY KEY,
  analysis_id UUID UNIQUE REFERENCES analysis(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  locked_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobs_status_created ON analysis_jobs(status, created_at);

-- =========================
-- AI SETTINGS
-- =========================
CREATE TABLE IF NOT EXISTS ai_settings (
  id BIGSERIAL PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  value_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by BIGINT REFERENCES users(id)
);

-- Seed packages (idempotent)
INSERT INTO service_packages (name, description, price, credits, duration_days, active)
SELECT 'Basic', 'Demo gói Basic', 500000, 50, 30, TRUE
WHERE NOT EXISTS (SELECT 1 FROM service_packages WHERE name='Basic');

INSERT INTO service_packages (name, description, price, credits, duration_days, active)
SELECT 'Premium', 'Demo gói Premium', 2000000, 300, 30, TRUE
WHERE NOT EXISTS (SELECT 1 FROM service_packages WHERE name='Premium');

INSERT INTO service_packages (name, description, price, credits, duration_days, active)
SELECT 'Enterprise', 'Demo gói Enterprise', 0, 5000, 365, TRUE
WHERE NOT EXISTS (SELECT 1 FROM service_packages WHERE name='Enterprise');
