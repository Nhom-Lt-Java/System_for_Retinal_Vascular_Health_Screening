-- Add optional clinic verification document (license scan)

ALTER TABLE clinics
  ADD COLUMN IF NOT EXISTS verification_file_id UUID;
