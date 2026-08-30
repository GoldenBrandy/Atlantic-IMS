import { z } from "zod";

export const marcaSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(80, "El nombre es demasiado largo"),
  description: z
    .string()
    .max(300, "La descripción es demasiado larga")
    .optional(),
});