// Reglas de validacion del formulario de inventarios: solo el nombre.
import { z } from "zod";

export const inventarioSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(80, "El nombre es demasiado largo"),
});
