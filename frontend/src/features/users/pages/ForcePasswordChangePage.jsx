// Pantalla de cambio de contraseña obligatorio: se muestra el admin registró al usuario (contraseña generada automáticamente). No tiene forma de omitirse; una vez cambiada, sessionStorage se actualiza y se libera el resto del sistema (ver RequireAuth en routerGuards.jsx).

import { getCurrentUser } from "@/features/auth";
import ChangePasswordForm from "../components/ChangePasswordForm";

export default function ForcePasswordChangePage() {
  const currentUser = getCurrentUser();

  const handleSuccess = () => {
    if (!currentUser) return;
    sessionStorage.setItem(
      "user",
      JSON.stringify({ ...currentUser, mustChangePassword: false }),
    );
    window.location.replace("/dashboard");
  };

  return (
    <div className="relative min-h-full w-full flex-1 overflow-hidden p-6">
      <div className="relative text-black [&_h1]:text-black [&_input]:text-black [&_input::placeholder]:text-black/70 [&_label]:text-black [&_span]:text-black">
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="mb-1 text-center text-2xl font-semibold">
            Cambio de contraseña obligatorio
          </h1>
          <p className="mb-6 text-center text-sm text-black">
            Tu cuenta se creó con una contraseña generada automáticamente. Por
            seguridad, debes definir una nueva antes de continuar
          </p>

          <ChangePasswordForm
            userId={currentUser?.id}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </div>
  );
}
