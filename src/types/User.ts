import { z } from "zod";

// --- Grupo ---
export const groupSchema = z.object({
  id: z.string().uuid({ message: "ID de grupo inválido" }),
  name: z.string().min(1, "Nome do grupo é obrigatório"),
});

export const groupsResponseSchema = z.object({
  groups: z.array(groupSchema),
});

// --- Usuário ---
export const userResponseSchema = z.object({
  id: z.string().uuid({ message: "ID de usuário inválido" }),
  email: z.string().email({ message: "Digite um e-mail válido" }),
  is_admin: z.boolean({ invalid_type_error: "Informe se o usuário é administrador" }),
  date_joined: z.string().datetime({ offset: true, message: "Formato de data inválido. Use ISO 8601." }),
  group: groupSchema,
});

export const usersResponseSchema = z.object({
  users: z.array(userResponseSchema),
});

// --- Convite ---
export const inviteRequestSchema = z.object({
  email: z.string().email({ message: "Digite um e-mail válido" }),
  is_admin: z.boolean({ invalid_type_error: "Informe se o convite é para administrador" }),
  group: z.number().int({ message: "ID de grupo deve ser um número inteiro" }).optional(),
});

// --- Criação de Usuário ---
export const createUserRequestSchema = z.object({
  email: z.string().email({ message: "Digite um e-mail válido" }),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

// --- Types inferidos ---
export type Group = z.infer<typeof groupSchema>;
export type GroupsResponse = z.infer<typeof groupsResponseSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type UsersResponse = z.infer<typeof usersResponseSchema>;
export type InviteRequest = z.infer<typeof inviteRequestSchema>;
export type CreateUserRequest = z.infer<typeof createUserRequestSchema>;