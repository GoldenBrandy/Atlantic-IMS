CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  product_code VARCHAR(30) NOT NULL,
  type VARCHAR(30) NOT NULL,
  category VARCHAR(30) NOT NULL,
  responsible INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL,
  last_movement VARCHAR(120),
  location VARCHAR(120),
  quantity INTEGER NOT NULL DEFAULT 0,
  supplier VARCHAR(120),
  observations VARCHAR(300),
  image_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
