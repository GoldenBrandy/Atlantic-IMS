import { z } from "zod";

export const cotizacionSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(120, "El nombre es demasiado largo"),
  fileUrl: z.string().min(1, "Debe adjuntar el PDF de la cotización"),
  quotationDate: z.string().min(1, "Debe indicar la fecha de la cotización"),
});
