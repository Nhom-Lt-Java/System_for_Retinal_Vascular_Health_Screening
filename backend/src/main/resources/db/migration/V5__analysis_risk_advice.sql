-- Analysis risk level + recommendations

ALTER TABLE analysis
  ADD COLUMN IF NOT EXISTS risk_level TEXT,
  ADD COLUMN IF NOT EXISTS advice_json JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_analysis_risk_level ON analysis(risk_level);
