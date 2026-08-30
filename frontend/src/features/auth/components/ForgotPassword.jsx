import { useState } from "react";
import { Input, Button, IconButton } from "@/shared";
import { useNavigate } from "react-router-dom";
import { MoveLeft, Mail, Check } from "lucide-react";
import { sileo } from "sileo";

export default function ForgotPassword({
  showBackButton = true,
  backTo = "/auth",
}) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    // Solo vista: todavia no hay backend que envie el correo de recuperacion.
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      sileo.success({
        title: "Correo enviado",
        description: `Si ${email} está registrado, recibirás un enlace para restablecer tu contraseña`,
      });
    }, 600);
  };

  return (
    <section className="w-full max-w-md [&_input]:text-black [&_input::placeholder]:text-black/70 [&_label]:text-black [&_select]:text-black [&_span]:text-black">
      {showBackButton && (
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
      )}

      <h1 className="text-text-primary text-2xl mb-2 text-center">
        Recuperar contraseña
      </h1>
      <p className="mb-6 text-center text-sm text-white">
        Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña
      </p>

      <div className="mx-auto grid w-full max-w-md gap-6 rounded-md border bg-white/80 p-8 shadow-lg backdrop-blur-sm">
        {isSent ? (
          <div className="flex flex-col items-center gap-3 text-center text-black">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Check size={24} />
            </span>
            <p>
              Si <strong>{email}</strong> está registrado, recibirás un correo
              con instrucciones para restablecer tu contraseña.
            </p>
            <Button variant="primary" onClick={() => navigate("/auth")}>
              Volver a iniciar sesión
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-6" noValidate>
            <Input
              label="Correo"
              name="email"
              type="email"
              placeholder="Ingrese su correo"
              startAdornment={<Mail size={16} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="flex justify-center pt-2">
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Enviar enlace"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
