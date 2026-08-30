import { useState } from "react";
import { Input, Button, IconButton } from "@/shared";
import { useNavigate, Link } from "react-router-dom";
import { MoveLeft, Eye, EyeOff } from "lucide-react";

const API_URL = "http://localhost:4000/api/auth/login";

export default function Login({
  nextTo = "/dashboard",
  showBackButton = false,
  backTo = "/auth",
}) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userEmail: "",
    userPassword: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No fue posible iniciar sesión");
      }

      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      navigate(nextTo, {
        replace: true,
      });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
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

      <h1 className="text-text-primary text-2xl mb-6 text-center">
        Iniciar Sesión
      </h1>

      <form
        className="grid grid-cols-1 items-center "
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="mx-auto grid w-full max-w-md gap-6 rounded-md border bg-white/80 p-8 shadow-lg backdrop-blur-sm">
          <Input
            label="Correo"
            name="userEmail"
            placeholder="Ingrese su correo"
            type="email"
            value={formData.userEmail}
            onChange={handleChange}
          />

          <Input
            label="Contraseña"
            name="userPassword"
            placeholder="Ingrese su contraseña"
            type={showPassword ? "text" : "password"}
            value={formData.userPassword}
            onChange={handleChange}
            endAdornment={
              <button
              type="button"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              onClick={() => setShowPassword((prev) => 
              !prev)}
              className="text-black/60 hover:text-black"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                
              </button>
            }
          />

          <Link
            to="/auth/recuperar"
            className="text-right text-small text-(--primary-950) hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>

          {errorMessage && (
            <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          <div className="flex justify-center pt-2">
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Ingresando..." : "Iniciar Sesión"}
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
