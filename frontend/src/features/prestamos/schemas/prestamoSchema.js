import {  z } from "zod";

export const prestamoSchema = z
  .object({
    materialIds: z
      .array(z.string())
      .min(1, "Debe seleccionar al menos un ítem a prestar"),
    requestingUser: z.string().optional(),
    requesterEmail: z.string().optional(),
    lendingUser: z.string().optional(),
    ficha: z.string().optional(),
    requesterIdentityConfirmed: z
      .boolean()
      .refine(
        (value) => value === true,
        "Debe confirmarse la identidad del usuario solicitante",
      ),
    lenderIdentityConfirmed: z
      .boolean()
      .refine(
        (value) => value === true,
        "Debe confirmarse la identidad del usuario prestador",
      ),
    justification: z
      .string()
      .min(5, "La justificación debe tener al menos 5 caracteres")
      .max(300, "La justificación es demasiado larga"),
    loanType: z.string().min(1, "Debe seleccionar un tipo de préstamo"),
    startDate: z.string().min(1, "Debe indicar la fecha de salida"),
    dueDate: z.string().min(1, "Debe indicar la fecha de entrega"),
    signatureUrl: z
      .string()
      .min(1, "Debe adjuntar la firma digital para legalizar el préstamo"),
  })
  .refine((data) => data.dueDate >= data.startDate, {
    message: "La fecha de entrega no puede ser anterior a la fecha de salida",
    path: ["dueDate"],
  })
  // Si no se elige un usuario solicitante registrado, hace falta al menos su correo.
  .refine((data) => Boolean(data.requestingUser) || Boolean(data.requesterEmail), {
    message: "Indica el correo del solicitante si no está registrado en el sistema",
    path: ["requesterEmail"],
  })
  .refine(
    (data) =>
      !data.requesterEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.requesterEmail),
    {
      message: "El correo del solicitante no es válido",
      path: ["requesterEmail"],
    },
  );
