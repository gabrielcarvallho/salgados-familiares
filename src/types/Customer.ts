import {
  cleanCEP,
  cleanCNPJ,
  cleanPhone,
  convertDateFormat,
} from "@/lib/utils";
import { z } from "zod";

// --- Contato ---
export const contactSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  name: z.string().min(1, "Nome é obrigatório"),
  date_of_birth: z.string().transform(convertDateFormat),
  contact_phone: z.string().transform(cleanPhone),
  contact_email: z.string().email("Digite um endereço de e-mail válido."),
});

// --- Endereço ---
export const addressSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  cep: z.string().transform(cleanCEP),
  street_name: z.string().min(1, "Rua é obrigatória"),
  district: z.string().min(1, "Bairro é obrigatório"),
  number: z.string().min(1, "Número de residência é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
  observation: z.string().optional(),
  description: z.string().optional().nullable(),
});

// --- Atualização de Endereço (opcional) ---
export const addressUpdateSchema = addressSchema.partial();

// --- Cliente: Request schema ---
export const CustomerRequestSchema = z.object({
  company_name: z.string().min(1, "Razão social é obrigatória"),
  brand_name: z.string().min(1, "Nome fantasia é obrigatória"),
  cnpj: z
    .string()
    .min(14, "CNPJ inválido. Deve conter 14 dígitos numéricos.")
    .transform(cleanCNPJ),
  phone_number: z
    .string()
    .regex(
      /^[0-9]{10,11}$/,
      "Número de telefone inválido. Deve conter 10 ou 11 dígitos numéricos."
    )
    .transform(cleanPhone),
  email: z.string().email("Digite um endereço de e-mail válido."),
  state_tax_registration: z.string().optional(),
  billing_address: addressSchema.omit({ id: true }),
  contact: contactSchema.omit({ id: true }),
});

// --- Cliente: Update Request schema ---
// 1) Cria um partial superficial de todos os campos raiz:
const shallowPartial = CustomerRequestSchema.partial();

// 2) Omite billing_address e contact (pois vamos redefinir eles):
const withoutNested = shallowPartial.omit({
  billing_address: true,
  contact: true,
});

// 3) Estende com as versões parciais dos sub-schemas:
export const CustomerUpdateRequestSchema = withoutNested.extend({
  billing_address: addressUpdateSchema.optional(),
  contact: contactSchema.partial().optional(),
});

// --- Cliente: Response schema ---
export const CustomerResponseSchema = z.object({
  id: z.string().uuid(),
  ...CustomerRequestSchema.shape,
  billing_address: addressSchema,
  contact: contactSchema,
});

// --- Paginação ---
export const paginationSchema = z.object({
  count: z.number(),
  next: z.string().url().nullable(),
  previous: z.string().url().nullable(),
});

// --- Resposta de Lista de Clientes ---
export const customersResponseSchema = z.object({
  count: paginationSchema.shape.count,
  next: paginationSchema.shape.next,
  previous: paginationSchema.shape.previous,
  customers: z.array(CustomerResponseSchema),
});

// --- Types inferred ---
export type Contact = z.infer<typeof contactSchema>;
export type Address = z.infer<typeof addressSchema>;
export type AddressUpdate = z.infer<typeof addressUpdateSchema>;
// export type CreatedBy = z.infer<typeof createdBySchema>;
export type CustomerRequest = z.infer<typeof CustomerRequestSchema>;
export type CustomerUpdateRequest = z.infer<typeof CustomerUpdateRequestSchema>;
export type CustomerResponse = z.infer<typeof CustomerResponseSchema>;
export type CustomersResponse = z.infer<typeof customersResponseSchema>;

export const EMPTY_CUSTOMER: CustomerRequest = {
  company_name: "",
  brand_name: "",
  cnpj: "",
  phone_number: "",
  email: "",
  state_tax_registration: "",
  billing_address: {
    cep: "",
    street_name: "",
    district: "",
    number: "",
    city: "",
    state: "",
    observation: "",
  },
  contact: {
    name: "",
    date_of_birth: "",
    contact_phone: "",
    contact_email: "",
  },
};
