import { z } from "zod";

const passwordComplexity = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Debes ingresar tu contraseña actual"),
    newPassword: z
      .string()
      .regex(
        passwordComplexity,
        "La nueva contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial",
      ),
    confirmPassword: z.string().min(1, "Debes confirmar la nueva contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
