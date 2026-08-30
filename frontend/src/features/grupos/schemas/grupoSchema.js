import { z } from "zod";

export const grupoSchema = z.object({
  groupName: z
    .string()
    .min(1, "El nombre del grupo es obligatorio")
    .max(80, "El nombre es demasiado largo"),
  description: z
    .string()
    .max(300, "La descripción es demasiado larga")
    .optional(),
});