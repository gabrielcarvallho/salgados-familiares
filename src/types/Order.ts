import { z } from "zod";
import { addressSchema, CustomerResponseSchema } from "./Customer";
import { productResponseSchema } from "./Product";
import { paymentMethodResponseSchema } from "./PaymentMethod";

// --- Enum para Tipo de Entrega ---
export const deliveryMethodEnum = z.enum(["ENTREGA", "RETIRADA"], {
  message: "Tipo de entrega deve ser 'ENTREGA' ou 'RETIRADA'",
});

// --- Status de Pedido ---
export const orderStatus = z.object({
  id: z.string().uuid({ message: "ID de status inválido" }),
  description: z.string().min(1, "Descrição do status é obrigatória"),
  delivery_method: z.string().min(1, "Método de entrega é obrigatório"),
  sequence_order: z.coerce.number(),
  category: z.coerce.number(),
});

export const orderStatusSchema = z.object({
  status: z.array(orderStatus),
});

// --- Request de Pedido ---
export const baseOrderRequestSchema = z.object({
  id: z.string().optional(),
  customer_id: z.string().uuid({ message: "ID de cliente inválido" }),
  order_status_id: z.string().uuid({ message: "ID de status inválido" }),
  payment_method_id: z.string().uuid({ message: "ID de método de pagamento inválido" }),
  delivery_method: deliveryMethodEnum,
  delivery_date: z.string(),
  due_date: z.string().nullable().optional(),
  table_order: z.coerce.number().optional().nullable(),

  // ✅ Endereço opcional (validação condicional no frontend)
  delivery_address_id: z.string().optional().nullable(),
  delivery_address: addressSchema.optional().nullable(),

  products: z.array(
    z.object({
      sale_price: z.coerce.number().optional(),
      product_id: z.string().uuid({ message: "ID de produto inválido" }),
      quantity: z.coerce.number(),
    })
  ),
  is_delivered: z.boolean().optional(),
});

// Schema que transforma due_date em payment_due_days para o backend
export const orderRequestSchema = baseOrderRequestSchema
.transform((data) => {
  // Transformar due_date em payment_due_days para o backend
  if (data.due_date && data.delivery_date) {
    try {
      const deliveryDate = new Date(data.delivery_date);
      const dueDate = new Date(data.due_date);
      
      // Zerar as horas para calcular apenas a diferença de dias
      deliveryDate.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      
      // Calcular diferença em dias
      const diffTime = dueDate.getTime() - deliveryDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Remover due_date e adicionar payment_due_days
      const { due_date, ...rest } = data;
      return {
        ...rest,
        payment_due_days: Math.max(0, diffDays)
      };
    } catch (error) {
      console.warn('Erro ao calcular payment_due_days:', error);
      const { due_date, ...rest } = data;
      return rest;
    }
  }
  
  // Se não houver due_date, remove o campo e continua normalmente
  if (data.due_date === null || data.due_date === undefined || data.due_date === '') {
    const { due_date, ...rest } = data;
    return rest;
  }
  
  return data;
});

export const orderUpdateRequestSchema = baseOrderRequestSchema
  .omit({ delivery_address: true })
  .partial()
  .transform((data: any) => {
    // ✅ Transformar due_date em payment_due_days para o backend (mesmo para updates)
    if (data.due_date && data.delivery_date) {
      try {
        const deliveryDate = new Date(data.delivery_date);
        const dueDate = new Date(data.due_date);
        
        // Calcular diferença em dias
        const diffTime = dueDate.getTime() - deliveryDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Remover due_date e adicionar payment_due_days
        const { due_date, ...rest } = data;
        return {
          ...rest,
          payment_due_days: Math.max(0, diffDays)
        };
      } catch (error) {
        console.warn('Erro ao calcular payment_due_days no update:', error);
        // Se der erro, remove due_date e continua sem payment_due_days
        const { due_date, ...rest } = data;
        return rest;
      }
    }
    
    // Se não houver due_date, remove o campo
    if (data.due_date === null || data.due_date === undefined || data.due_date === '') {
      const { due_date, ...rest } = data;
      return rest;
    }

    return data;
  });

const orderItemSchema = z.object({
  id: z.string().uuid(),
  product: productResponseSchema,
  quantity: z.number().min(1, "Quantidade deve ser maior que 0"),
  total_price: z.coerce.number(),
  sale_price: z.coerce.number(),
});

// --- Response de Pedido ---
export const orderResponseSchema = z.object({
  id: z.string().uuid({ message: "ID de pedido inválido" }),
  order_number: z.coerce.number(),
  table_order: z.coerce.number(),
  is_delivered: z.boolean(),
  customer: CustomerResponseSchema.omit({ billing_address: true }),
  products: z.array(orderItemSchema),
  total_price: z.coerce.number(),
  payment_method: paymentMethodResponseSchema,

  // ✅ Inclui delivery_type na response
  delivery_type: deliveryMethodEnum,
  delivery_date: z.string().datetime({ offset: true }),
  due_date: z.string().datetime({ offset: true }).nullable().optional(),
  order_status: orderStatus,
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
});

// --- Lista de Pedidos ---
export const ordersResponseSchema = z.object({
  orders: z.array(orderResponseSchema),
});

// --- Types inferidos ---
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type OrderRequest = z.infer<typeof orderRequestSchema>;
export type BaseOrderRequest = z.infer<typeof baseOrderRequestSchema>; // Tipo antes da transformação
export type OrderUpdateRequest = z.infer<typeof orderUpdateRequestSchema>;
export type OrderResponse = z.infer<typeof orderResponseSchema>;
export type OrdersResponse = z.infer<typeof ordersResponseSchema>;

// ✅ EMPTY_ORDER atualizado com delivery_type - usando BaseOrderRequest que tem due_date
export const EMPTY_ORDER: BaseOrderRequest = {
  customer_id: "",
  order_status_id: "",
  payment_method_id: "",
  delivery_method: "RETIRADA", // Padrão: entrega no endereço
  delivery_date: "",
  due_date: "",
  products: [
    {
      product_id: "",
      quantity: 0,
    },
  ],
};