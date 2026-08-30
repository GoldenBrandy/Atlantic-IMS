import { z } from 'zod';

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

const MAX_SIZE = 10 * 1024 * 1024; 

export const fileSchema = z.object({
    files: z.array(
        z.instanceof(File)
            .refine((file) => ACCEPTED_TYPES.includes(file.type), 'Tipo invalido')
        .refine((file) => file.size <= MAX_SIZE,  'Max 10MB'),
    )
    .min(1, 'Debe subir al menos un archivo')
    .max(12, 'Maximo 12 archivos'),
});