CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  user_name VARCHAR(100) NOT NULL,
  user_email VARCHAR(150) UNIQUE NOT NULL,
  user_phone VARCHAR(20),
  document_type VARCHAR(20),
  document_number VARCHAR(50) UNIQUE,
  password TEXT NOT NULL,
  avatar_url TEXT,
  is_staff BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_superuser BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
