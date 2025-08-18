import { z } from "zod";

// Enum de status
export const ProductionStatusEnum = z.enum(["0", "1", "2"]).transform((v) => Number(v));
export type ProductionStatus = 0 | 1 | 2; // 0=PLANNED,1=INPROGRESS,2=COMPLETED

// Item de produção
export const productionItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity_produced: z.coerce.number().int().min(0),
  expiration_date: z.string().nullable().optional(), // YYYY-MM-DD ou null
});

// Create
export const productionCreateSchema = z.object({
  start_date: z.string().min(10), // YYYY-MM-DD
  end_date: z.string().min(10),   // YYYY-MM-DD
  status: z.coerce.number().int().min(0).max(2), // 0,1,2
  notes: z.string().optional().nullable(),
  production_items: z.array(productionItemSchema).min(1),
});

// Update (PUT completo)
export const productionUpdateSchema = z.object({
  id: z.string().uuid(),
  start_date: z.string().min(10),
  end_date: z.string().min(10),
  status: z.coerce.number().int().min(0).max(2),
  notes: z.string().optional().nullable(),
  production_items: z.array(productionItemSchema).min(1),
});

// Item de resposta (linha da tabela)
export const productionRecordSchema = z.object({
  id: z.string().uuid(),
  start_date: z.string(),
  end_date: z.string(),
  status: z.number().int(), // 0,1,2
  notes: z.string().nullable().optional(),
  // Dependendo do backend, pode ou não retornar itens; deixar opcional para tabela
  production_items: z.array(productionItemSchema).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Lista
export const productionListResponseSchema = z.object({
  count: z.number(),
  next: z.string().url().nullable(),
  previous: z.string().url().nullable(),
  production_records: z.array(productionRecordSchema),
});

// Tipos
export type ProductionItem = z.infer<typeof productionItemSchema>;
export type ProductionCreate = z.infer<typeof productionCreateSchema>;
export type ProductionUpdate = z.infer<typeof productionUpdateSchema>;
export type ProductionRecord = z.infer<typeof productionRecordSchema>;
export type ProductionListResponse = z.infer<typeof productionListResponseSchema>;
