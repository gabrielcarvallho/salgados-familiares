import { DrawerConfig } from "@/components/datatable";
import { formatBoolean, formatDateToDDMMYYYY } from "@/lib/utils";
import { PendingInvitations, ResendInvite, resendInviteSchema } from "@/types/User";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<PendingInvitations, string>[] = [
  {
    id: "Email",
    accessorKey: "email",
    header: "E-mail",
    cell: ({ row }) => row.original.email,
  },
  {
    id: "Accepted",
    accessorKey: "accepted",
    header: "Aceito",
    cell: ({ row }) => formatBoolean(String(row.original.accepted)),
  },
  {
    id: "CreatedAt",
    accessorKey: "created_at",
    header: "Criado em",
    cell: ({ row }) => formatDateToDDMMYYYY(row.original.created_at),
  },
  {
    id: "ExpireAt",
    accessorKey: "expire_at",
    header: "Expira em",
    cell: ({ row }) => formatDateToDDMMYYYY(row.original.expire_at),
  },
];

export const drawerConfig: DrawerConfig<
  PendingInvitations,
  ResendInvite
> = {
  title: (user) => `${user.email}`,
  description: () => "Detalhes do usuário",
  updateSchema: resendInviteSchema,
  fields: [
    {
      name: "email",
      label: "E-mail",
      type: "text" as const,
      colSpan: 2,
    },
    {
      name: "accepted",
      label: "Aceito",
      type: "text" as const,
      colSpan: 2,
    },
    {
      name: "created_at",
      label: "Criado em",
      type: "text" as const,
      colSpan: 2,
    },
    {
      name: "expire_at",
      label: "Expira em",
      type: "text" as const,
      colSpan: 2,
    },
    {
      name: "token",
      label: "Token",
      type: "text" as const,
      colSpan: 2,
    },
  ],
};