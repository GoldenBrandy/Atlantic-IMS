-- database/migrations/017_create_content_type.sql
-- Creacion de la tabla content_type.

CREATE TABLE IF NOT EXISTS content_type (
    content_type_id SERIAL PRIMARY KEY,
    app_label VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    CONSTRAINT uq_content_type UNIQUE (app_label, model)
);
