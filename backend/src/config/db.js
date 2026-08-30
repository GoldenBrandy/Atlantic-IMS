import pkg from "pg";
import dotenv from "dotenv";

const { Pool } = pkg;

dotenv.config({ quiet: true });

const requiredVariables = [
  "DB_HOST",
  "DB_PORT",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
];

const missingVariables = requiredVariables.filter(
  (variable) => !process.env[variable],
);

if (missingVariables.length > 0) {
  throw new Error(
    `Faltan variables de entorno para PostgreSQL: ${missingVariables.join(", ")}`,
  );
}

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (error) => {
  console.error("Error inesperado en el pool de PostgreSQL:", error.message);
});

export async function testDatabaseConnection() {
  const result = await pool.query(
    "SELECT current_database() AS database, current_user AS db_user",
  );

  return result.rows[0];
}
