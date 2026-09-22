import { Navigate, useLocation } from "react-router-dom";
import { Login, isSuperUser, mustChangePassword } from "@/features/auth";

export function RequireAuth({ children }) {
    const location = useLocation();
    const token = sessionStorage.getItem("token");

    if (!token) {
        return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
    }

    // Si el admin registro a este usuario, debe cambiar su contrasena
  // automatica antes de usar el resto del sistema (evita que entre por una
  // URL directa saltandose la pantalla obligatoria).
  if (mustChangePassword() && location.pathname !== "/dashboard/cambiar-contrasena") {
    return <Navigate to="/dashboard/cambiar-contrasena" replace />;
  }

    return children;
}

// Solo el super administrador puede editar nombres/informacion personal de
// un usuario. Cualquier otro usuario que llegue directo a esta URL es
// redirigido a su perfil de solo lectura.
export function RequireSuperUser({ children }) {
    if (!isSuperUser()) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

export function LoginRoute({ cancelTo = "/auth" }) {
    const location = useLocation();
    const nextTo = location.state?.from ?? "/dashboard";

    return <Login nextTo={nextTo} cancelTo={cancelTo} />;
}