import { z } from "zod";

// Item de estoque na listagem (flat)
export const stockListItemSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  product_name: z.string(),
  current_stock: z.number().int(),
  min_stock_threshold: z.number().int(),
  max_stock_capacity: z.number().int(),
  is_active: z.boolean().optional(),
  updated_at: z.string().datetime({ offset: true }),
});

// Resposta da listagem
export const stockListResponseSchema = z.object({
  count: z.number(),
  next: z.string().url().nullable(),
  previous: z.string().url().nullable(),
  stock_configurations: z.array(stockListItemSchema),
});

// Create/Update (mantém como antes, pois o contrato de criação/edição é o mesmo)
export const stockConfigCreateSchema = z.object({
  product_id: z.string().uuid(),
  current_stock: z.coerce.number().int().min(0),
  min_stock_threshold: z.coerce.number().int().min(0),
  max_stock_capacity: z.coerce.number().int().min(0),
});

// Depois (incluindo product_id):
export const stockConfigUpdateSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  current_stock: z.coerce.number().int().min(0),
  min_stock_threshold: z.coerce.number().int().min(0),
  max_stock_capacity: z.coerce.number().int().min(0),
});

export type StockListItem = z.infer<typeof stockListItemSchema>;
export type StockListResponse = z.infer<typeof stockListResponseSchema>;
export type StockConfigCreate = z.infer<typeof stockConfigCreateSchema>;
export type StockConfigUpdate = z.infer<typeof stockConfigUpdateSchema>;
