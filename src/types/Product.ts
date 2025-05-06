import { z } from "zod";

// --- Produtos: Request schema ---
export const productRequestSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  price: z.coerce.number().min(0.01, "Preço deve ser maior que 0"),
  weight: z.string().min(1, "Peso deve ser maior que 0"),
  batch_packages: z.coerce.number().min(1, "Pacotes deve ser maior que 0"),
  daily_batch_capacity: z.coerce
    .number()
    .min(1, "Capacidade diária deve ser maior que 0")
    .optional(),
  batch_production_days: z.coerce
    .number()
    .min(0, "Dias de produção devem ser >= 0")
    .optional(),
});
export const productUpdateRequestSchema = productRequestSchema
  .partial()
  .extend({
    id: z.string().uuid().optional(),
  });
export const productResponseSchema = productRequestSchema.extend({
  id: z.string().uuid(),
  daily_batch_capacity: z.coerce
    .number()
    .min(1, "Capacidade diária deve ser maior que 0")
    .optional(),
  batch_production_days: z.coerce
    .number()
    .min(0, "Dias de produção devem ser >= 0")
    .optional(),
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
});

// --- Paginação ---
export const paginationSchema = z.object({
  count: z.number(),
  next: z.string().url().nullable(),
  previous: z.string().url().nullable(),
});

export const productsResponseSchema = z.object({
  count: paginationSchema.shape.count,
  next: paginationSchema.shape.next,
  previous: paginationSchema.shape.previous,
  products: z.array(productResponseSchema),
});

export interface ProductOption {
  label: string;
  value: string;
  price: number;
  id: string;
}

export interface SelectedItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface MultiSelectProps {
  options: ProductOption[];
  onValueChange: (selectedItems: SelectedItem[]) => void;
  defaultValue: SelectedItem[];
  placeholder?: string;
  disabled?: boolean;
}

export type ProductRequest = z.infer<typeof productRequestSchema>;
export type ProductUpdateRequest = z.infer<typeof productUpdateRequestSchema>;
export type ProductResponse = z.infer<typeof productResponseSchema>;
export type ProductsResponse = z.infer<typeof productsResponseSchema>;
