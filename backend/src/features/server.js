import app from "./app.js";
import { pool, testDatabaseConnection } from "../config/db.js";

const PORT = process.env.PORT || 4000;
const MAX_DB_CONNECT_RETRIES = 10;
const DB_CONNECT_RETRY_DELAY_MS = 3000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startServer() {
  for (let attempt = 1; attempt <= MAX_DB_CONNECT_RETRIES; attempt++) {
    try {
      const connection = await testDatabaseConnection();
      console.log(
        `PostgreSQL conectado: base "${connection.database}", usuario "${connection.db_user}"`,
      );

      app.listen(PORT, () => {
        console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
      });
      return;
    } catch (error) {
      console.error(
        `No fue posible conectar con PostgreSQL (intento ${attempt}/${MAX_DB_CONNECT_RETRIES}):`,
        error.message,
      );

      if (attempt === MAX_DB_CONNECT_RETRIES) {
        await pool.end();
        process.exit(1);
      }

      await sleep(DB_CONNECT_RETRY_DELAY_MS);
    }
  }
}

startServer();
