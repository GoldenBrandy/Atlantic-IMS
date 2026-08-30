import { z } from "zod";

export const prestamoSchema = z.object({
  materialIds: z.array(z.string()).min(1, "Debe seleccionar al menos un ítem a prestar"),
  requestingUser: z.string().min(1, "Debe seleccionar el usuario solicitante"),
  lendingUser: z.string().min(1, "Debe seleccionar el usuario prestador"),
  ficha: z.string().min(1, "Debe indicar la ficha de aprendices"),
  justification: z
    .string()
    .min(5, "La justificación debe tener al menos 5 caracteres")
    .max(300, "La justificación es demasiado larga"),
  loanType: z.string().min(1, "Debe seleccionar un tipo de préstamo"),
  startDate: z.string().min(1, "Debe indicar la fecha de salida"),
  dueDate: z.string().min(1, "Debe indicar la fecha de entrega"),
  signatureUrl: z.string().min(1, "Debe adjuntar la firma digital para legalizar el préstamo"),
}).refine((data) => data.dueDate >= data.startDate, {
  message: "La fecha de entrega no puede ser anterior a la fecha de salida",
  path: ["dueDate"],
});