-- Doctor feedback to improve AI (FR-19)

CREATE TABLE IF NOT EXISTS analysis_feedback (
  id BIGSERIAL PRIMARY KEY,
  analysis_id UUID REFERENCES analysis(id) ON DELETE CASCADE,
  doctor_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  corrected_label TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_analysis ON analysis_feedback(analysis_id);
CREATE INDEX IF NOT EXISTS idx_feedback_doctor ON analysis_feedback(doctor_id);
