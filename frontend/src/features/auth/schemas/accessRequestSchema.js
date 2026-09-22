import { z } from "zod";

export const accessRequestSchema = z.object({
    fullName: z.string().min(3, "El nombre debe tener al menos 3 carácteres"),
    email: z.string().email("Debe ser un correo electrónico válido"),
    reason: z.string().max(500, "El motivo es demasiado largo").optional(),
});