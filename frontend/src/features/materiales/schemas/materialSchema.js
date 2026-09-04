import { z } from "zod";

export const materialSchema = z
  .object({
    materialName: z
      .string()
      .min(3, "El nombre debe tener al menos 3 caracteres")
      .max(60, "El nombre es demasiado largo"),
    materialType: z.string().min(1, "Debe seleccionar un tipo de material"),
    materialQuantity: z.coerce
      .number({ invalid_type_error: "La cantidad debe ser un número" })
      .min(1, "La cantidad no puede ser negativa ni cero"),
    materialDescription: z
      .string()
      .max(200, "La descripción es demasiado larga")
      .optional(),
    isActive: z.boolean(),
    // Foto del material: hasta 3 imagenes, opcional.
    materialImages: z.array(z.string()).optional(),
    // Campos que aplican (y se exigen segun el tipo) para consumo y devolutivo.
    technicalSheetImages: z.array(z.string()).optional(),
    // Cotizaciones en PDF: obligatorias (1 a 3) para consumo y devolutivo.
    // Cada una lleva ademas su valor y su fecha (para el promedio de las
    // cotizaciones vigentes, <=90 dias).
    quotations: z
      .array(
        z.object({
          url: z.string().min(1),
          value: z.union([z.string(), z.number()]).optional(),
          date: z.string().optional(),
        }),
      )
      .optional(),
    senaPlate: z
      .string()
      .max(50, "La placa SENA es demasiado larga")
      .optional(),
    marca: z.string().optional(),
    custodian: z.string().optional(),
    inventario: z.string().optional(),
    location: z.string().max(150, "La ubicación es demasiado larga").optional(),
    purchaseDate: z.string().optional(),
    unitValue: z.union([z.string(), z.number()]).optional(),
    model: z.string().max(100, "El modelo es demasiado largo").optional(),
    category: z.string().optional(),
    externalId: z.string().max(50, "El ID es demasiado largo").optional(),
  })
  .superRefine((data, ctx) => {
    const isConsumo = data.materialType === "Consumo";
    const isDevolutivo = data.materialType === "Devolutivo";
    if (!isConsumo && !isDevolutivo) return;

    if (!data.materialDescription) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["materialDescription"],
        message: "La descripción es obligatoria",
      });
    }
    if (!data.marca) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["marca"],
        message: "Debe seleccionar una marca",
      });
    }
    if (!data.purchaseDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["purchaseDate"],
        message: "Debe indicar la fecha de compra",
      });
    }
    if (!data.quotations || data.quotations.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["quotations"],
        message: "Debe adjuntar al menos una cotización en PDF",
      });
    } else if (
      data.quotations.some(
        (q) =>
          q.value === undefined ||
          q.value === "" ||
          Number.isNaN(Number(q.value)) ||
          !q.date,
      )
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["quotations"],
        message: "Cada cotización debe tener su valor y su fecha",
      });
    }
    if (
      data.unitValue === undefined ||
      data.unitValue === "" ||
      Number.isNaN(Number(data.unitValue))
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["unitValue"],
        message: "Debe indicar el valor unitario",
      });
    } else if (Number(data.unitValue) < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["unitValue"],
        message: "El valor unitario no puede ser negativo",
      });
    }

    if (isConsumo && !data.custodian) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["custodian"],
        message: "Debe seleccionar un cuentadante",
      });
    }

    if (
      isConsumo &&
      (!data.technicalSheetImages || data.technicalSheetImages.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["technicalSheetImages"],
        message: "Debe adjuntar la ficha técnica",
      });
    }

    if (
      isConsumo &&
      data.senaPlate?.trim() &&
      Number(data.materialQuantity) !== 1
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["materialQuantity"],
        message:
          "Si el material de consumo tiene placa SENA, la cantidad debe ser 1",
      });
    }

    if (isDevolutivo) {
      if (!data.model) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["model"],
          message: "El modelo es obligatorio",
        });
      }
      if (!data.category) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["category"],
          message: "Debe seleccionar una categoría",
        });
      }
    }
  });
