import jwt from "jsonwebtoken";
import { auditLogService } from "../features/auditLogs/auditLogs.service.js";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const MODULE_LABELS = {
  users: "Usuarios",
  auth: "Autenticación",
  access: "Accesos",
  groups: "Grupos",
  permissions: "Permisos",
  marcas: "Marcas",
  materiales: "Materiales",
  productos: "Productos",
  tareas: "Tareas",
  prestamos: "Préstamos",
  devoluciones: "Devoluciones",
};

const ACTION_LABELS = {
  create: "creó un registro",
  update: "actualizó un registro",
  delete: "eliminó un registro",
  status: "cambió el estado de un registro",
  "bulk-disable": "deshabilitó varios registros",
  permissions: "actualizó permisos",
  password: "cambió una contraseña",
  login: "inició sesión",
  return: "registró una devolución",
};

function getModuleSegment(path) {
  const parts = path.split("/").filter(Boolean);
  return parts[0] === "api" ? parts[1] : parts[0];
}

function resolveAction(method, path) {
  if (path.endsWith("/bulk-disable")) return "bulk-disable";
  if (path.endsWith("/status")) return "status";
  if (path.endsWith("/permissions")) return "permissions";
  if (path.endsWith("/password")) return "password";
  if (path.endsWith("/login")) return "login";
  if (method === "POST") return "create";
  if (method === "DELETE") return "delete";
  return "update";
}

function decodeActor(req) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

function extractEntityId(req, body) {
  const paramId = Object.values(req.params ?? {})[0];
  if (paramId) return String(paramId);
  if (body && typeof body === "object") {
    const idKey = Object.keys(body).find((key) => /Id$/.test(key));
    if (idKey) return String(body[idKey]);
  }
  return null;
}

export function auditLogMiddleware(req, res, next) {
  const method = req.method.toUpperCase();
  if (!MUTATING_METHODS.has(method)) return next();

  const segment = getModuleSegment(req.path);
  if (!segment || segment === "audit-logs") return next();

  const originalJson = res.json.bind(res);
  let responseBody;
  res.json = (body) => {
    responseBody = body;
    return originalJson(body);
  };

  res.on("finish", () => {
    if (res.statusCode >= 400) return;

    const isLogin = segment === "auth" && req.path.endsWith("/login");
    const actor = isLogin
      ? responseBody?.user
        ? {
            id: responseBody.user.id,
            email: responseBody.user.email,
            isSuperUser: responseBody.user.isSuperUser,
          }
        : null
      : decodeActor(req);

    if (!actor) return;

    const action = resolveAction(method, req.path);
    const moduleLabel = MODULE_LABELS[segment] ?? segment;
    const entityId = isLogin
      ? String(responseBody?.user?.id ?? "")
      : extractEntityId(req, responseBody);

    auditLogService
      .record({
        actorId: actor.id ?? null,
        actorEmail: actor.email ?? null,
        isSuperUser: actor.isSuperUser ?? false,
        module: segment,
        action,
        entityId: entityId || null,
        description: `${actor.email ?? "Un usuario"} ${ACTION_LABELS[action] ?? "realizó una acción"} en ${moduleLabel}${entityId ? ` (id ${entityId})` : ""}`,
      })
      .catch((err) => console.error("Error registrando historial:", err));
  });

  next();
}
