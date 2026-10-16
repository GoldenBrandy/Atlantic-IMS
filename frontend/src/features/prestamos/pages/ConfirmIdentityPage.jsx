// Pantalla publica (sin sesion) a la que llega el solicitante o el
// prestador de un prestamo desde el link del correo, para confirmar su
// identidad con el codigo de 8 digitos. Mismo patron de CodeInput que
// ForgotPassword, para que se sienta consistente con el resto del sistema.
import { useRef, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/shared";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import { sileo } from "sileo";
import { confirmPrestamoIdentity, resendPrestamoIdentityCode } from "../services/prestamoService";

const CODE_LENGTH = 8;
const RESEND_COOLDOWN_SECONDS = 60;

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
      {error && <p className="mt-2 text-center text-caption text-red-800">{error}</p>}
    </div>
  );
}

export default function ConfirmIdentityPage() {
  const { prestamoId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = searchParams.get("role") === "lender" ? "lender" : "requester";
  const roleLabel = role === "lender" ? "prestador" : "solicitante";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [result, setResult] = useState(null); // { bothConfirmed }

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

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      await resendPrestamoIdentityCode(prestamoId, role);
      sileo.success({ title: "Código reenviado", description: "Revisa tu correo nuevamente" });
      startCooldown();
    } catch (err) {
      sileo.error({ title: "No se pudo reenviar el código", description: err?.message || String(err) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== CODE_LENGTH || /\D/.test(code)) {
      setError("Ingresa los 8 dígitos del código");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      const res = await confirmPrestamoIdentity(prestamoId, role, code);
      setResult(res);
    } catch (err) {
      setError(err?.message || "El código no es válido");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    return (
      <section className="w-full max-w-md text-center text-black [&_h1]:text-black">
        <div className="mx-auto grid w-full max-w-md gap-4 rounded-none border-0 bg-transparent p-0 shadow-none sm:rounded-2xl sm:border sm:border-neutral-200 sm:bg-white sm:p-6 sm:shadow-sm">
          <CheckCircle2 size={40} className="mx-auto text-green-600" />
          <h1 className="text-2xl">Identidad confirmada</h1>
          <p className="text-medium text-black/70">
            {result.bothConfirmed
              ? "Listo, ya confirmaste tu identidad y la de la otra persona también está confirmada. El préstamo ya está activo."
              : "Listo, ya confirmaste tu identidad. El préstamo queda activo en cuanto la otra persona también confirme la suya."}
          </p>
          <Button variant="primary" type="button" onClick={() => navigate("/auth")}>
            Entendido
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-md text-black [&_h1]:text-black [&_input]:text-black">
      <div className="mx-auto grid w-full max-w-md gap-6 rounded-none border-0 bg-transparent p-0 shadow-none sm:rounded-2xl sm:border sm:border-neutral-200 sm:bg-white sm:p-6 sm:shadow-sm">
        <form className="grid gap-6" onSubmit={handleSubmit} noValidate>
          <div>
            <ShieldCheck size={32} className="mx-auto mb-2 text-(--primary-950)" />
            <h1 className="text-text-primary mb-1 text-2xl text-center">Confirma tu identidad</h1>
            <p className="text-center text-medium text-black/70">
              Ingresa el código de 8 dígitos que te enviamos por correo para confirmar que eres tú quien
              figura como {roleLabel} en este préstamo.
            </p>
          </div>

          <CodeInput value={code} onChange={setCode} error={error} />

          <p className="text-center text-medium text-black/70">
            {cooldown > 0 ? (
              <>
                ¿Aún no llega? En {String(Math.floor(cooldown / 60)).padStart(2, "0")}:
                {String(cooldown % 60).padStart(2, "0")} podrás pedir un nuevo código.
              </>
            ) : (
              <button type="button" className="text-(--primary-950) underline" onClick={handleResend}>
                Pedir un nuevo código
              </button>
            )}
          </p>

          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Confirmando..." : "Confirmar identidad"}
          </Button>
        </form>
      </div>
    </section>
  );
}
