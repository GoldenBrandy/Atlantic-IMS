ALTER TABLE materiales
  ADD COLUMN IF NOT EXISTS technical_sheet_urls TEXT[],
  ADD COLUMN IF NOT EXISTS model VARCHAR(100),
  ADD COLUMN IF NOT EXISTS category VARCHAR(50),
  ADD COLUMN IF NOT EXISTS external_id VARCHAR(50);

UPDATE materiales
  SET technical_sheet_urls = ARRAY[technical_sheet_url]
  WHERE technical_sheet_url IS NOT NULL;

ALTER TABLE materiales
  DROP COLUMN IF EXISTS technical_sheet_url;
