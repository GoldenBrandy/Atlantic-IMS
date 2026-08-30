import { z } from "zod";

export const userSchema = z
  .object({
    userFirstName: z
      .string()
      .min(1, "Los nombres son obligatorios")
      .max(120, "Los nombres son demasiado largos"),
    userLastName1: z
      .string()
      .min(1, "Los apellidos son obligatorios")
      .max(120, "Los apellidos son demasiado largos")
      .regex(/^[^0-9]*$/, "Los apellidos no pueden contener números"),
    userDocumentType: z
      .string()
      .min(1, "Debe seleccionar un tipo de documento"),
    userDocumentNumber: z
      .string()
      .min(5, "Número de documento inválido")
      .max(20, "El número de documento es demasiado largo")
      .regex(/^[0-9]+$/, "El número de documento solo debe contener números"),
    userGroup: z.string().min(1, "Debe seleccionar un tipo de usuario"),
    isInstructorFullTime: z.boolean().optional(),
    userEmail: z
      .string()
      .regex(
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "El correo electrónico no es válido",
      ),
    userInstitutionalEmail: z
      .string()
      .regex(
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "El correo institucional no es válido",
      )
      .optional()
      .or(z.literal("")),
    userPhone: z
      .string()
      .regex(
        /^[0-9]{10}$/,
        "El teléfono debe contener solo números y tener 10 dígitos",
      ),
    userSecondaryPhone: z
      .string()
      .regex(
        /^[0-9]{10}$/,
        "El teléfono secundario debe contener sólo números y tener 10 dígitos",
      )
      .optional()
      .or(z.literal("")),
    isCustodian: z.boolean().optional(),
    userAddress: z
      .string()
      .min(1, "La dirección es obligatoria")
      .max(120, "La dirección es demasiado larga"),
    // Las fechas son obligatorias sin importar el rol del usuario.
    userStartDate: z.string().min(1, "La fecha de inicio es obligatoria"),
    userEndDate: z.string().min(1, "La fecha de finalización es obligatoria"),
    avatarImage: z.string().optional(),
  })
  .refine(
    (data) => data.userEndDate >= data.userStartDate,
    {
      message:
        "La fecha de finalización no puede ser anterior a la fecha de inicio",
      path: ["userEndDate"],
    },
  );
