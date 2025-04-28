import { z } from "zod";

// --- Payment Method ---
export const paymentMethodRequestSchema = z.object({
  name: z.string().min(1, "Nome do método de pagamento é obrigatório"),
  is_requires_due_date: z.boolean({
    invalid_type_error: "Informe se o método requer data de vencimento",
  }),
  additional_info: z.any().optional().nullable(),
});


export const paymentMethodResponseSchema = paymentMethodRequestSchema.extend({
  id: z.string().uuid({ message: "ID de método de pagamento inválido" }),
});

// --- List Response ---
export const paymentMethodsResponseSchema = z.object({
  paymentMethods: z.array(paymentMethodResponseSchema),
});

// --- Types inferidos ---


export type PaymentMethodsResponse = z.infer<typeof paymentMethodsResponseSchema>;
