import { z } from "zod";

// Contato (sem transforms aqui; tratar no submit)
export const contactSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Nome é obrigatório").optional(),
  date_of_birth: z.string().nullable().optional(),
  contact_phone: z.string().optional(),
  contact_email: z
    .string()
    .email("Digite um endereço de e-mail válido.")
    .optional(),
});

export const viaCepSchema = z.object({
  logradouro: z.string(),
  bairro: z.string(),
  localidade: z.string(),
  uf: z.string(),
});

// Endereço
export const addressSchema = z.object({
  id: z.string().uuid().optional(),
  cep: z.string(),
  street_name: z.string().min(1, "Rua é obrigatória"),
  district: z.string().min(1, "Bairro é obrigatório"),
  number: z.string().min(1, "Número de residência é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
  observation: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

// Base (ZodObject puro, sem effects)
export const CustomerRequestBaseSchema = z.object({
  customer_type: z.enum(["PF", "PJ"]),
  document: z.string().min(11, "Documento inválido"),
  name: z.string().min(1, "Nome é obrigatório"),
  fantasy_name: z.string().optional(),
  phone_number: z.string().min(1, "Telefone é obrigatório").max(16),
  email: z.string().email("Digite um endereço de e-mail válido.").optional(),
  // PF: string|null|undefined; PJ: omitir no payload (tratado no submit)
  birth_date: z.string().nullable().optional(),
  billing_address: addressSchema.omit({ id: true }),
  // PF opcional; PJ obrigatório (regra aplicada no submit)
  contact: contactSchema.omit({ id: true }).optional(),
});

// Request (mesmo shape do base; condições fora do Zod)
export const CustomerRequestSchema = CustomerRequestBaseSchema;

// Update (partial seguro)
const shallowPartial = CustomerRequestBaseSchema.partial();
export const addressUpdateSchema = addressSchema.partial();

export const CustomerUpdateRequestSchema = shallowPartial
  .omit({ billing_address: true, contact: true })
  .extend({
    billing_address: addressUpdateSchema.optional(),
    contact: contactSchema.partial().optional(),
  });

// Response
export const CustomerResponseSchema = z.object({
  id: z.string().uuid(),
  ...CustomerRequestBaseSchema.shape,
  billing_address: addressSchema,
  contact: contactSchema,
});

// Tipos
export type CustomerRequest = z.infer<typeof CustomerRequestSchema>;
export type Address = z.infer<typeof addressSchema>;
export type ViaCEP = z.infer<typeof viaCepSchema>;
export type CustomerUpdateRequest = z.infer<typeof CustomerUpdateRequestSchema>;
export type CustomerResponse = z.infer<typeof CustomerResponseSchema>;
