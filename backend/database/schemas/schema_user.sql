-- ===========================================
-- ESQUEMA COMPLETO PARA GESTIÓN DE USUARIOS,
-- ROLES, PERMISOS Y TAREAS EN POSTGRESQL
-- Archivo: users.esquema.sql
-- ===========================================


-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- opcional


-- ===========================================
-- 1) Catálogo: document_type (debe crearse primero)
-- ===========================================
CREATE TABLE public.document_type (
    document_type_id SERIAL PRIMARY KEY,
    name_document_type VARCHAR(50) NOT NULL UNIQUE
);


-- ===========================================
-- 2) Tabla: app_user (FK a document_type)
-- ===========================================
CREATE TABLE public.app_user (
    user_id SERIAL PRIMARY KEY,
    user_name VARCHAR(150) UNIQUE NOT NULL,   -- o 'username', pero sé consistente
    last_name VARCHAR(150),
    document_number VARCHAR(50),
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_staff BOOLEAN DEFAULT FALSE,
    is_superuser BOOLEAN DEFAULT FALSE,
    profile_image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,                     -- ✅ coma aquí
    document_type_id INTEGER NOT NULL,        -- ✅ columna FK


    CONSTRAINT fk_app_user_document_type
        FOREIGN KEY (document_type_id)
        REFERENCES public.document_type (document_type_id)
        ON DELETE RESTRICT                    -- catálogo estable
);


-- Índice recomendado para la FK
CREATE INDEX idx_app_user_document_type_id
    ON public.app_user (document_type_id);


-- ===========================================
-- 3) Tabla: user_phone (FK a app_user)
-- ===========================================
CREATE TABLE public.user_phone (
    user_phone_id  SERIAL PRIMARY KEY,
    user_id        INTEGER NOT NULL,
    phone_number   VARCHAR(20) NOT NULL,
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP,


    CONSTRAINT fk_user_phone_user
        FOREIGN KEY (user_id)
        REFERENCES public.app_user (user_id)
        ON DELETE CASCADE
);


CREATE INDEX idx_user_phone_user_id ON public.user_phone (user_id);


-- ===========================================
-- 4) Tabla: auth_group
-- ===========================================
CREATE TABLE public.auth_group (
    group_id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


-- ===========================================
-- 5) Tabla: content_type
-- ===========================================
CREATE TABLE public.content_type (
    content_type_id SERIAL PRIMARY KEY,
    app_label VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    UNIQUE (app_label, model)
);


-- ===========================================
-- 6) Tabla: auth_permission (FK a content_type)
-- ===========================================
CREATE TABLE public.auth_permission (
    permission_id SERIAL PRIMARY KEY,
    permission_name VARCHAR(150) NOT NULL,
    permission_codename VARCHAR(100) UNIQUE NOT NULL,
    content_type_id INT REFERENCES public.content_type(content_type_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


CREATE INDEX idx_auth_permission_content_type_id
    ON public.auth_permission (content_type_id);


-- ===========================================
-- 7) Relación M:N → user_group
-- ===========================================
CREATE TABLE public.user_group (
    user_id INT REFERENCES public.app_user(user_id) ON DELETE CASCADE,
    group_id INT REFERENCES public.auth_group(group_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, group_id)
);


-- ===========================================
-- 8) Relación M:N → group_permission
-- ===========================================
CREATE TABLE public.group_permission (
    group_id INT REFERENCES public.auth_group(group_id) ON DELETE CASCADE,
    permission_id INT REFERENCES public.auth_permission(permission_id) ON DELETE CASCADE,
    PRIMARY KEY (group_id, permission_id)
);


-- ===========================================
-- 9) Relación M:N → user_permission
-- ===========================================
CREATE TABLE public.user_permission (
    user_id INT REFERENCES public.app_user(user_id) ON DELETE CASCADE,
    permission_id INT REFERENCES public.auth_permission(permission_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, permission_id)
);


-- ===========================================
-- 10) Tabla: task (FK a app_user, nullable)
-- ===========================================
CREATE TABLE public.task (
    task_id SERIAL PRIMARY KEY,
    task_name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    status VARCHAR(50) CHECK (status IN ('pendiente','en_progreso','completada','cancelada')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),      -- ✅ nombre consistente
    user_id INT NULL REFERENCES public.app_user(user_id) ON DELETE SET NULL
);


CREATE INDEX idx_task_user_id ON public.task (user_id);