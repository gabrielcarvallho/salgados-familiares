// src/config/data-config2.tsx
"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DrawerConfig } from "@/components/datatable";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { formatBoolean, formatDateToDDMMYYYY } from "@/lib/utils";
import {
  PendingInvitations,
  ResendInvite,
  resendInviteSchema,
  UserResponse,
} from "@/types/User";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserList, useGroupList } from "@/hooks/useUser";

// Colunas da tabela de “Todos os usuários”
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
      row.groups.length > 0 ? row.groups.map(g => g.name).join(", ") : "—",
    cell: info => info.getValue<string>(),
  },
];

// DrawerConfig para edição de usuário
export function useDrawerConfigAll() {
  const { mutate } = useUserList();
  const { groups: allGroups = [] } = useGroupList();

  const drawerConfig: DrawerConfig<UserResponse, ResendInvite> = {
    title: user => user.email,
    description: user => `Usuário desde ${formatDateToDDMMYYYY(user.date_joined)}`,
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
        colSpan: 1,
        defaultValue: user => (user.is_admin ? "Sim" : "Não"),
        parseValue: (v: string) => v === "Sim",
        formatValue: (v: boolean) => (v ? "Sim" : "Não"),
        customRender: (value: string, onChange) => (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sim ou Não" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sim">Sim</SelectItem>
              <SelectItem value="Não">Não</SelectItem>
            </SelectContent>
          </Select>
        ),
      },

      // Data de entrada (display BR, envia ISO)
      {
        name: "date_joined",
        label: "Data de entrada",
        type: "custom",
        colSpan: 1,
        defaultValue: user => user.date_joined,
        formatValue: (v: string) => v, // já em yyyy-MM-dd
        parseValue: (v: string) => v,
        customRender: (value: string, onChange) => (
          <Input
            type="date"
            value={value.split("T")[0]}
            onChange={e => onChange(e.target.value)}
          />
        ),
      },

      // Separador visual (opcional)
      // Grupos: select de todos os grupos, pré-seleciona o primeiro
      {
        name: "group_id",
        label: "Grupo Principal",
        type: "custom",
        colSpan: 2,
        defaultValue: user => String(user.groups[0]?.id ?? ""),
        formatValue: (v: string) => [{ id: Number(v), name: "" }],
        parseValue: (v: string) => Number(v),
        customRender: (value: string, onChange) => (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o grupo" />
            </SelectTrigger>
            <SelectContent>
              {allGroups.map(g => (
                <SelectItem key={g.id} value={String(g.id)}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
      },
    ],
  };

  return drawerConfig;
}
