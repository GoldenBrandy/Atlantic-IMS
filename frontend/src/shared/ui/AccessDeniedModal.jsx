import { ShieldAlert } from "lucide-react";
import Button from "./Button";

// Se muestra cuando el usuario no tiene el permiso necesario para abrir una
// pantalla. No se puede cerrar haciendo click afuera: la unica salida es
// volver, para que el contenido protegido nunca llegue a mostrarse detras.
export default function AccessDeniedModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <ShieldAlert size={24} />
        </div>

        <h2 className="mb-2 text-lg font-semibold text-neutral-900">Acceso denegado</h2>

        <p className="mb-6 text-sm text-neutral-600">
          No tienes permiso para acceder a este contenido. Si crees que deberías tenerlo, contacta a un administrador.
        </p>

        <Button variant="primary" type="button" onClick={onClose} className="w-full">
          Volver
        </Button>
      </div>
    </div>
  );
}
