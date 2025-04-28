import { z } from "zod";
import { addressSchema } from "./Customer";

// --- Status de Pedido ---
export const orderStatusSchema = z.object({
  id: z.string().uuid({ message: "ID de status inválido" }),
  description: z.string().min(1, "Descrição do status é obrigatória"),
});

// --- Request de Pedido ---
export const orderRequestSchema = z.object({
  Customer_id: z.string().uuid({ message: "ID de cliente inválido" }),
  order_status_id: z.string().uuid({ message: "ID de status inválido" }),
  payment_method_id: z
    .string()
    .uuid({ message: "ID de método de pagamento inválido" }),
  delivery_date: z.string().datetime({ offset: true }),
  delivery_address_id: z.string().uuid({ message: "ID de endereço inválido" }),
  products: z.array(
    z.object({
      product_id: z.string().uuid({ message: "ID de produto inválido" }),
      quantity: z.coerce.number().min(1, "Quantidade deve ser maior que 0"),
    })
  ),
});

export const orderUpdateRequestSchema = orderRequestSchema.partial();

// --- Response de Pedido ---
export const orderResponseSchema = orderRequestSchema.extend({
  id: z.string().uuid({ message: "ID de pedido inválido" }),
});

// --- Pedido com Endereço de Entrega ---
export const orderWithAddressSchema = orderResponseSchema.extend({
  delivery_address: addressSchema,
});

// --- Lista de Pedidos ---
export const ordersResponseSchema = z.object({
  orders: z.array(orderResponseSchema),
});

export const ordersWithAddressResponseSchema = z.object({
  orders: z.array(orderWithAddressSchema),
});

// --- Types inferidos ---
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type OrderRequest = z.infer<typeof orderRequestSchema>;
export type OrderUpdateRequest = z.infer<typeof orderUpdateRequestSchema>;
export type OrderResponse = z.infer<typeof orderResponseSchema>;
export type OrderWithAddress = z.infer<typeof orderWithAddressSchema>;
export type OrdersResponse = z.infer<typeof ordersResponseSchema>;
export type OrdersWithAddressResponse = z.infer<
  typeof ordersWithAddressResponseSchema
>;
