import { z } from "zod";

export const loginSchema = z.object({
  userEmail: z.string().email("Ingrese un correo electrónico válido"),
  userPassword: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});
