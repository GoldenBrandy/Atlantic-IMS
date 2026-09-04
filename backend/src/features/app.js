// Importamos Express, el framework base para construir el servidor HTTP
import express from "express";

// Importamos el middleware CORS
// Permite controlar quÃ© orÃ­genes pueden comunicarse con el backend
import cors from "cors";

// Importamos las rutas del feature users
// Cada feature expone su propio router independiente
import userRoutes from "./users/user.routes.js";
import authRoutes from "./auth/auth.routes.js";
import accessRoutes from "./access/access.routes.js";
import groupRoutes from "./groups/groups.router.js";
import permissionRoutes from "./permissions/permissions.router.js";
import materialRoutes from "./materiales/materiales.routes.js";
import productoRoutes from "./productos/productos.routes.js";
import marcaRoutes from "./marcas/marcas.routes.js";
import prestamoRoutes from "./prestamos/prestamos.routes.js";
import tareaRoutes from "./tareas/tareas.routes.js";
import devolucionRoutes from "./devoluciones/devoluciones.routes.js";
import inventarioRoutes from "./inventarios/inventarios.routes.js";
import auditLogsRoutes from "./auditLogs/auditLogs.routes.js";
import { auditLogMiddleware } from "../middlewares/auditLog.middleware.js";

// Creamos la instancia principal de la aplicaciÃ³n Express
const app = express();

// Middleware de CORS
// Permitimos solicitudes desde los puertos de desarrollo comunes (Vite)
// Allow common Vite localhost ports during development, or any localhost origin
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
];
const localhostRegex = /^https?:\/\/localhost(?::\d+)?$/;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || localhostRegex.test(origin))
        return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
  }),
);

// Middleware para parsear cuerpos de peticiÃ³n en formato JSON
// Sin este middleware, req.body serÃ­a undefined
// Limite alto porque las fotos de perfil/materiales se envian como base64
// dentro del JSON (facilmente superan el limite por defecto de 100kb).
app.use(express.json({ limit: "15mb" }));
app.use(auditLogMiddleware);

// Registro del router de usuarios
// Todas las rutas del feature users quedarán bajo el prefijo /api/users
// Ejemplo final: POST http://localhost:4000/api/users
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/access", accessRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/materiales", materialRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/marcas", marcaRoutes);
app.use("/api/prestamos", prestamoRoutes);
app.use("/api/tareas", tareaRoutes);
app.use("/api/devoluciones", devolucionRoutes);
app.use("/api/inventarios", inventarioRoutes);
app.use("/api/audit-logs", auditLogsRoutes);

// Manejador de errores global: evita que Express responda con su pagina
// de error HTML por defecto (rompe el .json() del frontend) ante fallos
// que ocurren antes de llegar a un controller, como un body demasiado grande.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  console.error("ERROR NO MANEJADO:", err.message);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    error: statusCode === 413
      ? "El archivo enviado es demasiado grande"
      : err.message || "Error interno del servidor",
  });
});

// Exportamos la aplicaciÃ³n configurada
// El arranque del servidor se hace en server.js
export default app;
