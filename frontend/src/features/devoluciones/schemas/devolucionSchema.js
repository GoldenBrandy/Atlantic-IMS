import { z } from "zod";

export const devolucionSchema = z.object({
  prestamoId: z.string().min(1, "Debe seleccionar el préstamo a devolver"),
  returnedBy: z.string().min(1, "Debe seleccionar quién devuelve el material"),
  observation: z
    .string()
    .max(300, "La observación es demasiado larga")
    .optional(),
  materials: z
    .array(
      z.object({
        materialId: z.string().min(1),
        materialName: z.string().optional(),
        quantityReturned: z.coerce
          .number({ invalid_type_error: "La cantidad devuelta debe ser un número" })
          .min(0, "La cantidad devuelta no puede ser negativa"),
        condition: z.string().min(1, "Debe indicar el estado de cada material"),
      }),
    )
    .min(1, "Debe seleccionar un préstamo y completar el estado de sus materiales"),
});