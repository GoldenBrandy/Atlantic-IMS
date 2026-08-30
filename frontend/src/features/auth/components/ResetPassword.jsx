import { useState } from "react";
import { Input, Button, IconButton } from "@/shared";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MoveLeft, Lock, Eye, EyeOff } from "lucide-react";
import { sileo } from "sileo";

export default function ResetPassword({
  showBackButton = true,
  backTo = "/auth",
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (password.length < 8) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden");
      return;
    }

    setIsSubmitting(true);
    // Solo vista: todavia no hay backend que valide el token ni actualice la contraseña.
    setTimeout(() => {
      setIsSubmitting(false);
      sileo.success({
        title: "Contraseña actualizada",
        description: "Ya puedes iniciar sesión con tu nueva contraseña",
      });
      navigate("/auth");
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
        Restablecer contraseña
      </h1>
      <p className="mb-6 text-center text-sm text-black">
        Ingresa tu nueva contraseña para completar la recuperación
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mx-auto grid w-full max-w-md gap-6 rounded-md border bg-white/80 p-8 shadow-lg backdrop-blur-sm">
          {!token && (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Este enlace no incluye un token válido. Solicita uno nuevo desde
              "Recuperar contraseña".
            </p>
          )}

          <Input
            label="Nueva contraseña"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Ingrese su nueva contraseña"
            startAdornment={<Lock size={16} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            endAdornment={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                className="text-black cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />

          <Input
            label="Confirmar contraseña"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Confirme su nueva contraseña"
            startAdornment={<Lock size={16} />}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {errorMessage && (
            <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          <div className="flex justify-center pt-2">
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Cambiar contraseña"}
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
