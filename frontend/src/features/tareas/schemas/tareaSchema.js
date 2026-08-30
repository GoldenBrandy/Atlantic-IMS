import { z } from "zod";

export const tareaSchema = z.object({
  assignedUsers: z
    .array(z.string())
    .min(1, "Debe seleccionar al menos un usuario"),
  assignedUserTypes: z
    .array(z.string())
    .min(1, "Debe seleccionar al menos un tipo de usuario"),
  taskName: z
    .string()
    .min(1, "El nombre de la tarea es obligatorio")
    .max(100, "El nombre es demasiado largo"),
  status: z.string().min(1, "Debe seleccionar un estado"),
  startDate: z.string().min(1, "Debe indicar la fecha de inicio"),
  endDate: z.string().min(1, "Debe indicar la fecha de fin"),
  description: z
    .string()
    .min(5, "La descripción debe tener al menos 5 caracteres")
    .max(500, "La descripción es demasiado larga"),
  userEndDates: z.record(z.string(), z.string()).optional(),
}).refine((data) => data.endDate >= data.startDate, {
  message: "La fecha fin no puede ser anterior a la fecha de inicio",
  path: ["endDate"],
}).refine(
  (data) =>
    data.assignedUsers.every((id) => {
      const userEndDate = data.userEndDates?.[id];
      return !userEndDate || userEndDate >= data.startDate;
    }),
  {
    message: "La fecha de finalización de cada usuario no puede ser anterior a la fecha de inicio",
    path: ["userEndDates"],
  },
);
