import { z } from "zod";

const passwordComplexity = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

// El codigo de verificacion tiene 8 digitos (misma pantalla del diseño
// "Ingresar con código de acceso").
export const resetPasswordSchema = z
    .object({
        code: z.string().regex(/^\d{8}$/, "El código debe tener 8 dígitos"), newPassword: z
            .string()
            .regex(
                passwordComplexity,
                "La nueva contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial",
            ),
        confirmPassword: z.string().min(1, "Debe confirmar la nueva contraseña"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
    });