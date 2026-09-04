-- "Foto del material" pasa de una sola imagen a hasta 3 (mismo patron que
-- technical_sheet_urls/quotation_urls). Se migra el dato existente antes de
-- eliminar la columna vieja.
ALTER TABLE materiales ADD COLUMN IF NOT EXISTS image_urls TEXT[];

UPDATE materiales
SET image_urls = ARRAY[image_url]
WHERE image_url IS NOT NULL AND image_urls IS NULL;

ALTER TABLE materiales DROP COLUMN IF EXISTS image_url;