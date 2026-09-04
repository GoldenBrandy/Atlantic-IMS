-- Cada cotizacion ahora guarda ademas su valor y su fecha (no solo el PDF),
-- para poder calcular el promedio de las cotizaciones vigentes (<=90 dias).
-- quotation_urls (array de solo URLs) se reemplaza por quotations (jsonb),
-- un arreglo de objetos { url, value, date }.

ALTER TABLE materiales ADD COLUMN IF NOT EXISTS quotations JSONB;

UPDATE materiales
SET quotations = (
    SELECT jsonb_agg(jsonb_build_object('url', u, 'value', null, 'date', null))
    FROM unnest(quotation_urls) AS u
)
WHERE quotation_urls IS NOT NULL AND array_length(quotation_urls, 1) > 0;

ALTER TABLE materiales DROP COLUMN IF EXISTS quotation_urls;