"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DrawerConfig } from "@/components/datatable";
import { Input } from "@/components/ui/input";
import { formatBoolean, formatDateToDDMMYYYY, formatGroup } from "@/lib/utils";
import {
  ResendInvite,
  resendInviteSchema,
  UserResponse,
} from "@/types/User";
import { SafeSelect } from "@/components/safeselect"; // Import the SafeSelect component
import { useUserList, useGroupList } from "@/hooks/useUser";
import DatePicker from "@/components/ui/date-picker";

// Colunas da tabela de "Todos os usuários"
export const columns: ColumnDef<UserResponse, string>[] = [
  {
    id: "email",
    accessorKey: "email",
    header: "E-mail",
    cell: ({ row }) => row.original.email,
  },
  {
    id: "isAdmin",
    accessorKey: "is_admin",
    header: "É admin",
    cell: ({ row }) => formatBoolean(String(row.original.is_admin)),
  },
  {
    id: "dateJoined",
    accessorKey: "date_joined",
    header: "Data de entrada",
    cell: ({ row }) => formatDateToDDMMYYYY(row.original.date_joined),
  },
  {
    id: "groups",
    header: "Grupos",
    accessorFn: (row) =>
      row.groups.length > 0 ? row.groups.map((g) => formatGroup(g.name)).join(", ") : "Administrador",
    cell: (info) => info.getValue<string>(),
  },
];

// DrawerConfig para edição de usuário
export function useDrawerConfigAll() {
  const { mutate } = useUserList();
  const { groups: allGroups = [] } = useGroupList();

  const drawerConfig: DrawerConfig<UserResponse, ResendInvite> = {
    title: (user) => user.email,
    description: (user) => `Usuário desde ${formatDateToDDMMYYYY(user.date_joined)}`,
    updateSchema: resendInviteSchema,
    mutate,
    fields: [
      // E-mail (sem formatação extra)
      {
        name: "email",
        label: "E-mail",
        type: "text",
        colSpan: 2,
      },

      // É admin? (exibe Sim/Não e envia boolean)
      {
        name: "is_admin",
        label: "É admin",
        type: "custom",
        colSpan: 2,
        defaultValue: (user) => (user.is_admin ? "Sim" : "Não"),
        formatValue: (v: string) => (v || "") as string,
        parseValue: (v: string) => v === "Sim",
        customRender: (value: string, onChange: (v: string) => void) => {
          return (
            <SafeSelect
              value={value}
              onValueChange={onChange}
              options={[
                { value: "Sim", label: "Sim" },
                { value: "Não", label: "Não" }
              ]}
              placeholder="Sim ou Não"
              className="w-full"
            />
          );
        },
      },

      // Data de entrada (display BR, envia ISO)
      {
        name: "date_joined",
        label: "Data de entrada",
        type: "custom",
        colSpan: 2,
        defaultValue: (user) => user.date_joined,
        formatValue: (v: string) => v,
        parseValue: (v: string) => v,
        customRender: (value: string, onChange: (v: string) => void) => {
          const safeValue = value || "";
          return (
            <DatePicker
              value={safeValue.split("T")[0]}
              onChange={(e) => onChange(value)}
            />
          );
        },
      },

      // Grupo Principal
      {
        name: "group_id",
        label: "Grupo Principal",
        type: "custom",
        colSpan: 2,
        defaultValue: (user) => String(user.groups[0]?.id ?? "Administrador"),
        formatValue: (v: string) => (v || "") as string,
        parseValue: (v: string) => Number(v),
        customRender: (value: string, onChange: (v: string) => void) => {
          // Transform allGroups into the format expected by SafeSelect
          const groupOptions = allGroups.map(g => ({
            value: String(g.id),
            label: formatGroup(g.name)
          }));
          
          return (
            <SafeSelect
              value={value}
              onValueChange={onChange}
              options={groupOptions}
              placeholder="Selecione o grupo"
              className="w-full"
            />
          );
        },
      },
    ],
  };

  return drawerConfig;
}