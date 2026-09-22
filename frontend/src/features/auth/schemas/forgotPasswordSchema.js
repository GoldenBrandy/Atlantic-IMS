import { z } from 'zod';

export const forgotPasswordSchema = z.object({
    userEmail: z.string().email("Debe ser un correo electrónico válido"),
});