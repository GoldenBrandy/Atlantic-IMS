import app from "./app.js";
import { pool, testDatabaseConnection } from "../config/db.js";

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    const connection = await testDatabaseConnection();
    console.log(
      `PostgreSQL conectado: base "${connection.database}", usuario "${connection.db_user}"`,
    );

    app.listen(PORT, () => {
      console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("No fue posible conectar con PostgreSQL:", error.message);
    await pool.end();
    process.exit(1);
  }
}

startServer();
