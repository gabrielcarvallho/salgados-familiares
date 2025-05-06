import React from "react";
import { DrawerConfig } from "@/components/datatable";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  cleanCNPJ,
  cleanPhone,
  cleanCEP,
  formatCEP,
  formatCNPJ,
  formatDateInput,
  formatDateToBR,
  formatPhone,
} from "@/lib/utils";
import {
  CustomerResponse,
  CustomerUpdateRequest,
  CustomerUpdateRequestSchema,
} from "@/types/Customer";
import { ColumnDef } from "@tanstack/react-table";
import { useCustomerList } from "@/hooks/useCustomer";
import DatePicker from "@/components/ui/date-picker";

// Colunas da tabela
export const columns: ColumnDef<CustomerResponse, string>[] = [
  {
    id: "company_name",
    accessorKey: "company_name",
    header: "Razão Social",
    cell: ({ row }) => row.original.company_name,
  },
  {
    id: "brand_name",
    accessorKey: "brand_name",
    header: "Nome Fantasia",
    cell: ({ row }) => row.original.brand_name,
  },
  {
    id: "cnpj",
    accessorKey: "cnpj",
    header: "CNPJ",
    cell: ({ row }) => formatCNPJ(row.original.cnpj),
  },
  {
    id: "contact_name",
    accessorKey: "contact.name",
    header: "Contato",
    cell: ({ row }) => row.original.contact.name,
  },
  {
    id: "contact_phone",
    accessorKey: "contact.contact_phone",
    header: "Telefone",
    cell: ({ row }) => formatPhone(row.original.contact.contact_phone),
  },
];

export function useDrawerConfig() {
  // Configuração do drawer para edição
  const { mutate } = useCustomerList();
  const drawerConfig: DrawerConfig<CustomerResponse, CustomerUpdateRequest> = {
    title: (cliente) => cliente.brand_name,
    description: () => "Detalhes do cliente",
    updateSchema: CustomerUpdateRequestSchema,
    mutate: mutate,
    fields: [
      // Razão Social e Nome Fantasia sem formatação extra
      { name: "company_name", label: "Razão Social", type: "text", colSpan: 2 },
      { name: "brand_name", label: "Nome Fantasia", type: "text", colSpan: 2 },

      // CNPJ: exibe formatado, mas envia limpo
      {
        name: "cnpj",
        label: "CNPJ",
        type: "custom",
        colSpan: 2,
        defaultValue: (o) => formatCNPJ(o.cnpj),
        formatValue: (v) => formatCNPJ(v),
        parseValue: (v) => cleanCNPJ(v),
        customRender: (value: string, onChange: (v: string) => void) => (
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="00.000.000/0000-00"
          />
        ),
      },

      // Inscrição Estadual
      {
        name: "state_tax_registration",
        label: "Inscrição Estadual",
        type: "text",
        colSpan: 2,
      },

      // E-mail
      { name: "email", label: "E-mail", type: "text", colSpan: 2 },

      // Nome para Contato
      {
        name: "contact.name",
        label: "Nome para Contato",
        type: "text",
        colSpan: 2,
      },

      // Data de Nascimento: display BR, send ISO
      {
        name: "contact.date_of_birth",
        label: "Data de Nascimento",
        type: "custom",
        colSpan: 2,
        defaultValue: (o) => o.contact.date_of_birth,
        // formatValue continua identity: envia yyyy-MM-dd de volta
        formatValue: (v) => v,
        customRender: (value: string, onChange: (v: string) => void) => (
          // passe o onChange diretamente
          <DatePicker value={value} onChange={onChange} className="my-2"/>
        ),
      },

      // Telefone: exibe formatado, envia limpo
      {
        name: "contact.contact_phone",
        label: "Telefone para Contato",
        type: "custom",
        colSpan: 2,
        defaultValue: (o) => formatPhone(o.contact.contact_phone),
        formatValue: (v) => formatPhone(v),
        customRender: (value: string, onChange: (v: string) => void) => (
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="(00) 00000-0000"
          />
        ),
      },

      // CEP: exibe formatado, envia limpo
      {
        name: "billing_address.cep",
        label: "CEP",
        type: "custom",
        colSpan: 2,
        defaultValue: (o) => formatCEP(o.billing_address.cep),
        formatValue: (v) => formatCEP(v),
        customRender: (value: string, onChange: (v: string) => void) => (
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="00000-000"
          />
        ),
      },

      // Endereço completo em campos separados
      {
        name: "billing_address.street_name",
        label: "",
        type: "custom",
        colSpan: 2,
        formatValue: (v) => v,
        parseValue: (v) => v,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="flex flex-col space-y-3">
            <Label>Rua</Label>
            <Input value={value} onChange={(e) => onChange(e.target.value)} />
          </div>
        ),
      },
      {
        name: "billing_address.number",
        label: "Número",
        type: "text",
        colSpan: 1,
      },
      {
        name: "billing_address.district",
        label: "Bairro",
        type: "text",
        colSpan: 1,
      },
      {
        name: "billing_address.city",
        label: "Cidade",
        type: "text",
        colSpan: 1,
      },
      {
        name: "billing_address.state",
        label: "Estado",
        type: "text",
        colSpan: 1,
      },

      // Observação
      {
        name: "billing_address.observation",
        label: "Observação",
        type: "text",
        colSpan: 2,
      },
    ],
  };
  return drawerConfig;
}
