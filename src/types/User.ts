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
  is_admin: z.boolean({
    invalid_type_error: "Informe se o usuário é administrador",
  }),
  date_joined: z
    .string()
    .datetime({
      offset: true,
      message: "Formato de data inválido. Use ISO 8601.",
    }),
  groups: z.array(groupSchema),
});

export const usersResponseSchema = z.object({
  users: z.array(userResponseSchema),
});

// --- Convite ---
export const inviteRequestSchema = z.object({
  email: z.string().email({ message: "Digite um e-mail válido" }),
  is_admin: z.boolean({
    invalid_type_error: "Informe se o convite é para administrador",
  }),
  group_id: z
    .number()
    .int({ message: "ID de grupo deve ser um número inteiro" })
    .optional(),
});

// --- Criação de Usuário ---

export const createUserRequestSchema = z
  .object({
    email: z.string().email({ message: "E-mail inválido" }),
    password: z.string().min(6, { message: "Mínimo 6 caracteres" }),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "As senhas precisam ser iguais",
    path: ["confirm_password"], // mostra erro no campo certo
  });

export const pendiningInvitations = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  token: z.string().jwt(),
  accepted: z.boolean(),
  created_at: z.string().date(),
  expire_at: z.string().date()
})


export const resendInviteSchema = z.object({
  token: z.string(), // ou apenas z.string() se não for UUID
});

// Se você quiser derivar do seu esquema completo, pode fazer:
// export const resendInviteSchema = fullSchema.pick({ token: true });

export const pendiningInvitationsResponse = z.object({
  count: z.coerce.number(),
  next: z.coerce.number().nullable(),
  previous: z.coerce.number().nullable(),
  pending_invitations: z.array(pendiningInvitations)
})

// --- Types inferidos ---
export type Group = z.infer<typeof groupSchema>;
export type ResendInvite = z.infer<typeof resendInviteSchema>;
export type GroupsResponse = z.infer<typeof groupsResponseSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type UsersResponse = z.infer<typeof usersResponseSchema>;
export type InviteRequest = z.infer<typeof inviteRequestSchema>;
export type CreateUserRequest = z.infer<typeof createUserRequestSchema>;
export type PendingInvitationsResponse = z.infer<typeof pendiningInvitationsResponse>;
export type PendingInvitations = z.infer<typeof pendiningInvitations>;


export const EMPTY_USER: InviteRequest = {
    email: "",
    is_admin: false,
    group_id: 0
};
