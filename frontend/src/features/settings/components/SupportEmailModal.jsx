import { useEffect, useState } from "react";
import { X, Mail } from "lucide-react";
import { Button, Input } from "@/shared";
import { getSupportEmail, updateSupportEmail } from "../services/settingsService";
import { sileo } from "sileo";

// Modal para que un super administrador vea y cambie el correo de soporte
// (el que recibe las solicitudes de acceso simuladas por correo).
export default function SupportEmailModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    getSupportEmail()
      .then(setEmail)
      .catch((err) => {
        sileo.error({ title: "No se pudo cargar el correo de soporte", description: err?.message || String(err) });
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setError("");
    setIsSaving(true);
    try {
      await updateSupportEmail(email);
      sileo.success({ title: "Correo de soporte actualizado" });
      onClose();
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-neutral-900">Correo de soporte</h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1 text-neutral-500 transition-colors hover:bg-neutral-100"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mb-4 text-sm text-neutral-600">
          A este correo llegan las solicitudes de acceso de personas que aún no tienen cuenta.
        </p>

        <Input
          label="Correo de soporte"
          dense
          name="supportEmail"
          type="email"
          startAdornment={<Mail size={16} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
        />

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button variant="primary" type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
