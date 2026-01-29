-- User profile extensions + notification templates

-- =========================
-- USERS: profile + email + enabled
-- =========================
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS enabled BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
  ADD COLUMN IF NOT EXISTS medical_info_json JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Unique email constraint (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uk_users_email'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT uk_users_email UNIQUE (email);
  END IF;
EXCEPTION WHEN duplicate_object THEN
  -- ignore
END $$;

CREATE INDEX IF NOT EXISTS idx_users_enabled ON users(enabled);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =========================
-- NOTIFICATION TEMPLATES
-- =========================
CREATE TABLE IF NOT EXISTS notification_templates (
  id BIGSERIAL PRIMARY KEY,
  template_key TEXT UNIQUE NOT NULL,
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'SYSTEM',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed templates (idempotent)
INSERT INTO notification_templates (template_key, title_template, message_template, type, active)
SELECT 'ANALYSIS_DONE', 'Kết quả AI đã sẵn sàng', 'Phân tích {analysisId} đã hoàn tất.', 'ANALYSIS', TRUE
WHERE NOT EXISTS (SELECT 1 FROM notification_templates WHERE template_key='ANALYSIS_DONE');

INSERT INTO notification_templates (template_key, title_template, message_template, type, active)
SELECT 'ANALYSIS_FAILED', 'Phân tích AI thất bại', 'Phân tích {analysisId} thất bại: {error}', 'ANALYSIS', TRUE
WHERE NOT EXISTS (SELECT 1 FROM notification_templates WHERE template_key='ANALYSIS_FAILED');

INSERT INTO notification_templates (template_key, title_template, message_template, type, active)
SELECT 'HIGH_RISK_ALERT', 'Cảnh báo nguy cơ cao', 'Bệnh nhân {patientId} có kết quả nguy cơ cao (analysis {analysisId}).', 'ALERT', TRUE
WHERE NOT EXISTS (SELECT 1 FROM notification_templates WHERE template_key='HIGH_RISK_ALERT');
