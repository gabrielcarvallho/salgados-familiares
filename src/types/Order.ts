import { z } from "zod";
import { addressSchema, CustomerResponseSchema } from "./Customer";
import { productResponseSchema } from "./Product";
import { paymentMethodResponseSchema } from "./PaymentMethod";

// --- Status de Pedido ---
export const orderStatus = z.object({
  id: z.string().uuid({ message: "ID de status inválido" }),
  description: z.string().min(1, "Descrição do status é obrigatória"),
  identifier: z.coerce.number(),
});

export const orderStatusSchema = z.object({
  order_status: z.array(orderStatus),
});

// --- Request de Pedido ---
export const orderRequestSchema = z.object({
  id: z.string().uuid().optional(),

  customer_id: z.string().uuid({ message: "Cliente inválido" }),
  order_status_id: z.string().uuid({ message: "Status inválido" }),
  payment_method_id: z
    .string()
    .uuid({ message: "Método de pagamento inválido" }),
  delivery_date: z
    .string()
    .min(1, { message: "Data de entrega é obrigatória" })
    .refine((date) => {
      if (!date) return false;
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }),
  due_date: z.string().nullable().optional(),
  table_order: z.coerce.number().optional().nullable(),

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

export const orderUpdateRequestSchema = orderRequestSchema.partial();

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
  delivery_address: addressSchema,
  delivery_date: z.string().datetime({ offset: true }),
  due_date: z.string().datetime({ offset: true }),
  order_status: orderStatus,
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
});

// --- Pedido com Endereço de Entrega ---
export const orderWithAddressSchema = orderRequestSchema.merge(
  z.object({
    delivery_address: addressSchema,
  })
);

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

export const EMPTY_ORDER: OrderRequest = {
  customer_id: "",
  order_status_id: "",
  payment_method_id: "",
  delivery_date: "",
  due_date: "",
  delivery_address_id: "",
  products: [
    {
      product_id: "",
      quantity: 0,
    },
  ],
};
