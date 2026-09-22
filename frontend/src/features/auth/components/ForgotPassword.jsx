// Flujo de "olvidé mi contraseña": pedir el correo, verificar el código de 8 dígitos que se envía (simulado) a ese correo, y definir la nueva contraseña. Todo en un solo componente con 3 pasos internos, para mantenerlo simple.
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button, IconButton, bigLabelClass } from "@/shared";
import { MoveLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { sileo } from "sileo";
import { forgotPasswordSchema } from "../schemas/forgotPasswordSchema";
import { resetPasswordSchema } from "../schemas/resetPasswordSchema";
import { forgotPassword, resetPassword } from "../services/authService";

const CODE_LENGTH = 8;
//Tiempo de espera para poder pedir un nuevo código (cooldown visual del botón de reenvío), independiente de los 10 minutos que dura válido el código del backend.
const RESEND_COOLDOWN_SECONDS = 60;

//Fila de 8 casillas para el código de verificación, una por dígito, con avance automático de foco (y soporte para pegar el código completo). 
function CodeInput({ value, onChange, error }) {
  const inputsRef = useRef([]);

  const setDigit = (index, digit) => {
    const next = value.split("");
    next[index] = digit;
    onChange(next.join("").slice(0, CODE_LENGTH));
  };

  const handleChange = (index, e) => {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);
    setDigit(index, digit);
    if (digit && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted.padEnd(CODE_LENGTH, ""));
    inputsRef.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
  };

  return (
    <div>
      <div className="flex justify-center gap-2" onPaste={handlePaste}>
        {Array.from({ length: CODE_LENGTH }).map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputsRef.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] ?? ""}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={`h-12 w-10 rounded-md border text-center text-lg focus:outline-none ${
              error ? "border-red-800" : "border-border focus:border-[3px] focus:border-(--primary-950)"
            }`}
          />
        ))}
      </div>
      {error && <p className="mt-2 text-center text-caption text-red-800">
        {error}</p>}
    </div>
  );
}

export default function ForgotPassword({ backTo = "/auth" }) {
  const navigate = useNavigate();
  // step: "email" -> "code" -> "password"
  const [step, setStep] = useState("email");
  const [userEmail, setUserEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN_SECONDS);
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    const result = forgotPasswordSchema.safeParse({ userEmail });
    if (!result.success) {
      setErrors({ userEmail: result.error.issues[0].message });
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      await forgotPassword(userEmail);
      sileo.success({
        title: "Código enviado",
        description: "Revisa tu correo, te enviamos un código de verificación de 8 dígitos",
      });
      setStep("code");
      startCooldown();
    } catch (err) {
      sileo.error({ title: "No se pudo enviar el código", description: err?.message || String(err) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (cooldown > 0) return;
    setIsSubmitting(true);
    try {
      await forgotPassword(userEmail);
      sileo.success({
        title: "Código reenviado",
        description: "Revisa tu correo nuevamente"
      });
      startCooldown();
    } catch (err) {
      sileo.error({ title: "No se pudo reenviar el código", description: err?.message || String(err) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueCode = (e) => {
    e.preventDefault();
    if (code.length !== CODE_LENGTH || /\D/.test(code)) {
      setErrors({ code: "Ingresa los 8 dígitos del código" });
      return;
    }
    setErrors({});
    setStep("password");
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const result = resetPasswordSchema.safeParse({ code, newPassword, confirmPassword });
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issues) => {
        fieldErrors[issues.path[0]] = issues.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      await resetPassword({ userEmail, code, newPassword });
      sileo.success({
        title: "Contraseña actualizada",
        description: "Ya puedes iniciar sesión con tu nueva contraseña",
      });
      navigate("/auth", { replace: true });
    } catch (err) {
      if (err?.field) setErrors({ [err.field]: err.message });
      sileo.error({ title: "No se pudo restablecer la contraseña", description: err?.message || String(err) });
      // El codigo pudo haber vencido o ser incorrecto: volvemos al paso del
      // codigo para que lo reingrese o pida uno nuevo.
      if (err?.field === "code") setStep("code");
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordType = showPasswords ? "text" : "password";
  
  return (
    <section className="w-full max-w-md text-black [&_h1]:text-black [&_input]:text-black [&_input::placeholder]:text-black/70 [&_label]:text-black [&_span]:text-black">
      <div className="mb-4">
        <IconButton
          ariaLabel="Volver"
          variant="ghost"
          onClick={() => (step === "email" ? navigate(backTo) : setStep(step === "password" ? "code" : "email"))}
          className="text-black"
        >
          <MoveLeft />
        </IconButton>
      </div>

      <div className="mx-auto grid w-full max-w-md gap-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        {step === "email" && (
          <form className="grid gap-6" onSubmit={handleSendCode} noValidate>
            <div>
              <h1 className="text-text-primary mb-1 text-2xl text-center">¿Olvidaste tu contraseña?</h1>
              <p className="text-center text-medium text-black/70">
                Ingresa tu correo y te enviaremos un código de verificación
              </p>
            </div>

            <Input
              label="Correo"
              dense
              labelClassName={bigLabelClass}
              name="userEmail"
              placeholder="Ingresa tu correo"
              type="email"
              startAdornment={<Mail size={16} />}
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              error={errors.userEmail}
            />

            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar código"}
            </Button>
          </form>
        )}

        {step === "code" && (
          <form className="grid gap-6" onSubmit={handleContinueCode} noValidate>
            <div>
              <h1 className="text-text-primary mb-1 text-2xl text-center">Ingresar con código de acceso</h1>
              <p className="text-center text-medium text-black/70">
                Ingresa el código verificador de 8 dígitos que enviamos a tu correo.
              </p>
            </div>

            <CodeInput value={code} onChange={setCode} error={errors.code} />

            <p className="text-center text-medium text-black/70">
              {cooldown > 0 ? (
                <>
                  ¿Aún no llega? En {String(Math.floor(cooldown / 60)).padStart(2, "0")}:
                  {String(cooldown % 60).padStart(2, "0")} podrás pedir un nuevo código.
                </>
              ) : (
                <button type="button" className="text-(--primary-950) underline" onClick={handleResendCode}>
                  Pedir un nuevo código
                </button>
              )}
            </p>

            <Button variant="primary" type="submit" disabled={isSubmitting}>
              Continuar
            </Button>
          </form>
        )}

        {step === "password" && (
          <form className="grid gap-6" onSubmit={handleResetPassword} noValidate autoComplete="off">
            <div>
              <h1 className="text-text-primary mb-1 text-2xl text-center">Nueva contraseña</h1>
              <p className="text-center text-medium text-black/70">Define tu nueva contraseña de acceso</p>
            </div>

            <Input
              label="Nueva contraseña"
              dense
              labelClassName={bigLabelClass}
              name="newPassword"
              type={passwordType}
              placeholder="Ingresa tu nueva contraseña"
              startAdornment={<Lock size={16} />}
              endAdornment={
                <button type="button" onClick={() => setShowPasswords((prev) => !prev)} className="text-black/60 hover:text-black">
                  {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={errors.newPassword}
            />

            <Input
              label="Confirmar nueva contraseña"
              dense
              labelClassName={bigLabelClass}
              name="confirmPassword"
              type={passwordType}
              placeholder="Repite tu nueva contraseña"
              startAdornment={<Lock size={16} />}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
            />

            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Restablecer contraseña"}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}