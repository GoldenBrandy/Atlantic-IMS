import { useRouteError, useNavigate, isRouteErrorResponse } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

// Pantalla de respaldo para errores inesperados durante el render de una
// ruta (ej. traducciones automaticas del navegador que alteran el DOM y
// rompen la reconciliacion de React). Evita mostrar el stack trace crudo
// que React Router muestra por defecto cuando no hay errorElement.
export default function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  const message = isRouteErrorResponse(error)
    ? error.statusText || `Error ${error.status}`
    : error?.message || "Ocurrió un error inesperado";

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-white p-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
        <AlertTriangle size={28} />
      </span>
      <h1 className="text-xl font-semibold text-black">Algo salió mal</h1>
      <p className="max-w-md text-sm text-neutral-500">{message}</p>
      <p className="max-w-md text-caption text-neutral-400">
        Si esto ocurrió justo después de traducir la página con el navegador, intenta recargar sin traducir.
      </p>

      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full bg-(--primary-950) px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-(--primary-800)"
        >
          Recargar página
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-full border border-(--primary-950) px-5 py-2 text-sm font-medium text-(--primary-950) transition-colors hover:bg-(--primary-950)/10"
        >
          Volver atrás
        </button>
      </div>
    </div>
  );
}