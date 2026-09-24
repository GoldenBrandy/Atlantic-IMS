// Formulario simple para pedirle acceso al administrador: no hay auto-registro público, así que esto solo notifica (por correo, simulado) para que el admin revise la solicitud y cree la cuenta manualmente.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button, IconButton, bigLabelClass } from "@/shared";
import { MoveLeft, User, Mail, MessageSquare } from "lucide-react";
import { sileo } from "sileo";
import { accessRequestSchema } from "../schemas/accessRequestSchema";
import { requestAccess } from "../services/authService";

const emptyForm = { fullName: "", email: "", reason: "" };

export default function RequestAccess({ backTo = "/auth" }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((Prev) => ({ ...Prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = accessRequestSchema.safeParse(formData);
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
      await requestAccess(result.data);
      sileo.success({
        title: "Solicitud enviada",
        description:
          "Espera la aprobación del administrador; te contactará por correo",
      });
      navigate("/auth", { replace: true });
    } catch (err) {
      sileo.error({
        title: "No se pudo enviar la solicitud",
        description: err?.message || String(err),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full max-w-md text-black [&_h1]:text-black [&_input]:text-black [&_input::placeholder]:text-black/70 [&_label]:text-black [&_span]:text-black">
      <div className="mb-4">
        <IconButton
          ariaLabel="Volver"
          variant="ghost"
          onClick={() => navigate(backTo)}
          className="text-black"
        >
          <MoveLeft />
        </IconButton>
      </div>

      <form
        className="mx-auto grid w-full max-w-md gap-6 rounded-none border-0 bg-transparent p-0 shadow-none sm:rounded-2xl sm:border sm:border-neutral-200 sm:bg-white sm:p-6 sm:shadow-sm"
        onSubmit={handleSubmit}
        noValidate
      >
        <div>
          <h1 className="text-text-primary mb-1 text-2xl text-center">
            Solicitar registro
          </h1>
          <p className="text-center text-medium text-black/70">
            No puedes crear tu cuenta directamente: pídele acceso al
            administrador
          </p>
        </div>

        <Input
          label="Nombre completo"
          required
          dense
          labelClassName={bigLabelClass}
          name="fullName"
          placeholder="Tu nombre completo"
          startAdornment={<User size={16} />}
          value={formData.fullName}
          onChange={handleChange}
          error={errors.fullName}
        />

        <Input
          label="Correo"
          required
          dense
          labelClassName={bigLabelClass}
          name="email"
          placeholder="Tu correo"
          startAdornment={<Mail size={16} />}
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />

        <Input
          label="Motivo (opcional)"
          dense
          labelClassName={bigLabelClass}
          name="reason"
          placeholder="Cuéntanos por qué necesitas acceso"
          startAdornment={<MessageSquare size={16} />}
          value={formData.reason}
          onChange={handleChange}
          error={errors.reason}
        />

        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Solicitar registro"}
        </Button>
      </form>
    </section>
  );
}
