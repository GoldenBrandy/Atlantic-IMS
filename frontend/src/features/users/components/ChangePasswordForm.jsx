import { useState } from "react";
import { Lock, Eye, EyeOff, Check } from "lucide-react";
import { Input, Button } from "@/shared";
import { changePasswordSchema } from "../schemas/changePasswordSchema";
import { changePassword } from "../services/userService";
import { sileo } from "sileo";

const emptyForm = { currentPassword: "", newPassword: "", confirmPassword: "" };

export default function ChangePasswordForm({ userId }) {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = changePasswordSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await changePassword(userId, result.data);
      sileo.success({
        title: "Contraseña actualizada",
        description: "Tu contraseña se cambió correctamente",
      });
      setFormData(emptyForm);
    } catch (err) {
      console.error(err);
      if (err?.field) {
        setErrors({ [err.field]: err.message });
      }
      sileo.error({
        title: "No se pudo cambiar la contraseña",
        description: err?.message || String(err),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordType = showPasswords ? "text" : "password";

  return (
    <form
      className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
      onSubmit={handleSubmit}
      noValidate
      autoComplete="off"
    >
      <h2 className="mb-4 text-base font-semibold">Cambiar contraseña</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input
          label="Contraseña actual"
          required
          name="currentPassword"
          type={passwordType}
          placeholder="Ingresa tu contraseña actual"
          startAdornment={<Lock size={16} />}
          value={formData.currentPassword}
          onChange={handleChange}
          error={errors.currentPassword}
        />

        <Input
          label="Nueva contraseña"
          required
          name="newPassword"
          type={passwordType}
          placeholder="Ingresa tu nueva contraseña"
          startAdornment={<Lock size={16} />}
          value={formData.newPassword}
          onChange={handleChange}
          error={errors.newPassword}
        />

        <Input
          label="Confirmar nueva contraseña"
          required
          name="confirmPassword"
          type={passwordType}
          placeholder="Repite tu nueva contraseña"
          startAdornment={<Lock size={16} />}
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowPasswords((prev) => !prev)}
          className="flex items-center gap-1 text-caption text-black/70 hover:text-black"
        >
          {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
          {showPasswords ? "Ocultar contraseñas" : "Mostrar contraseñas"}
        </button>

        <Button variant="primary" type="submit" disabled={isSubmitting} className="gap-2 rounded-full">
          <Check size={16} />
          {isSubmitting ? "Guardando..." : "Cambiar contraseña"}
        </Button>
      </div>
    </form>
  );
}
