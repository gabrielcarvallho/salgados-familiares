import { z } from "zod";

// Product (já definido anteriormente)
export const productRequestSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  price: z.coerce.number().min(0.01, "Preço deve ser maior que 0"),
  weight: z.string().min(1, "Peso é obrigatório"),
});

export const productUpdateRequestSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Nome é obrigatório"),
  price: z.coerce.number().min(0.01, "Preço deve ser maior que 0"),
  weight: z.string().min(1, "Peso é obrigatório"),
});

export const productResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  price: z.number(),
  weight: z.string(),
  is_active: z.boolean().optional(),
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
});



// Tipos
export type ProductRequest = z.infer<typeof productRequestSchema>;
export type ProductUpdateRequest = z.infer<typeof productUpdateRequestSchema>;
export type ProductResponse = z.infer<typeof productResponseSchema>;

