CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS clinics (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  clinic_id BIGINT REFERENCES clinics(id)
);

CREATE TABLE IF NOT EXISTS stored_files (
  id UUID PRIMARY KEY,
  bucket TEXT NOT NULL,
  object_key TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analysis (
  id UUID PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  status TEXT NOT NULL,

  pred_label TEXT,
  pred_conf DOUBLE PRECISION,
  probs_json JSONB,

  original_file_id UUID REFERENCES stored_files(id),
  overlay_file_id UUID REFERENCES stored_files(id),
  mask_file_id UUID REFERENCES stored_files(id),
  heatmap_file_id UUID REFERENCES stored_files(id),
  heatmap_overlay_file_id UUID REFERENCES stored_files(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analysis_user ON analysis(user_id);
