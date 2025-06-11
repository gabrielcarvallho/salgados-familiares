"use client";
import type { DrawerConfig } from "@/components/datatable";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  cleanCNPJ,
  cleanPhone,
  cleanCEP,
  formatCEP,
  formatCNPJ,
  formatPhone,
} from "@/lib/utils";
import {
  type CustomerResponse,
  type CustomerUpdateRequest,
  CustomerUpdateRequestSchema,
} from "@/types/Customer";
import type { ColumnDef } from "@tanstack/react-table";
import { useCustomerList } from "@/hooks/useCustomer";
import DatePicker from "@/components/ui/date-picker";
import {
  Building2,
  Briefcase,
  FileText,
  Mail,
  MapPin,
  Phone,
  User,
  Calendar,
  Hash,
} from "lucide-react";

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
    title: (cliente) => (
      <div className="flex items-center gap-2">
        <Briefcase className="h-5 w-5 text-[#FF8F3F]" />
        <span>{cliente.brand_name}</span>
      </div>
    ),
    description: (cliente) => (
      <Badge
        variant="outline"
        className=" bg-[#FF8F3F]/10 text-[#FF8F3F] border-[#FF8F3F]/20 mt-2"
      >
        {formatCNPJ(cliente.cnpj)}
      </Badge>
    ),
    updateSchema: CustomerUpdateRequestSchema,
    mutate: mutate,
    fields: [
      // Razão Social e Nome Fantasia sem formatação extra
      {
        name: "company_name",
        type: "custom",
        colSpan: 2,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#FF8F3F]" />
              <span>Razão Social</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={value}
              onChange={(e: { target: { value: string } }) =>
                onChange(e.target.value)
              }
              className="transition-all focus-visible:ring-[#FF8F3F]"
              placeholder="Razão Social da empresa"
            />
          </div>
        ),
      },
      {
        name: "brand_name",
        type: "custom",
        colSpan: 2,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-[#FF8F3F]" />
              <span>Nome Fantasia</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={value}
              onChange={(e: { target: { value: string } }) =>
                onChange(e.target.value)
              }
              className="transition-all focus-visible:ring-[#FF8F3F]"
              placeholder="Nome Fantasia da empresa"
            />
          </div>
        ),
      },

      // CNPJ: exibe formatado, mas envia limpo
      {
        name: "cnpj",
        type: "custom",
        colSpan: 2,
        defaultValue: (o) => formatCNPJ(o.cnpj),
        formatValue: (v) => formatCNPJ(v),
        parseValue: (v) => cleanCNPJ(v),
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-[#FF8F3F]" />
              <span>CNPJ</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="00.000.000/0000-00"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // Inscrição Estadual
      {
        name: "state_tax_registration",
        type: "custom",
        colSpan: 2,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#FF8F3F]" />
              <span>Inscrição Estadual</span>
            </Label>
            <Input
              value={value}
              onChange={(e: { target: { value: string } }) =>
                onChange(e.target.value)
              }
              placeholder="Inscrição Estadual"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // E-mail
      {
        name: "email",
        type: "custom",
        colSpan: 2,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#FF8F3F]" />
              <span>E-mail</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={value}
              onChange={(e: { target: { value: string } }) =>
                onChange(e.target.value)
              }
              placeholder="email@empresa.com"
              className="transition-all focus-visible:ring-[#FF8F3F]"
              type="email"
            />
          </div>
        ),
      },

      // Separador para Informações de Contato
      {
        name: "contact_separator",
        type: "custom",
        colSpan: 2,
        customRender: () => (
          <div className="col-span-2 pt-2">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-5 w-5 text-[#FF8F3F]" />
              <h3 className="text-base font-medium">Informações de Contato</h3>
            </div>
            <Separator />
          </div>
        ),
      },

      // Nome para Contato
      {
        name: "contact.name",
        type: "custom",
        colSpan: 2,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4 text-[#FF8F3F]" />
              <span>Nome para Contato</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={value}
              onChange={(e: { target: { value: string } }) =>
                onChange(e.target.value)
              }
              placeholder="Nome da pessoa de contato"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // Data de Nascimento: display BR, send ISO
      {
        name: "contact.date_of_birth",
        type: "custom",
        colSpan: 2,
        defaultValue: (o) => o.contact.date_of_birth,
        formatValue: (v) => v,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#FF8F3F]" />
              <span>Data de Nascimento</span>
            </Label>
            <DatePicker
              value={value}
              onChange={onChange}
              className="w-full transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // Telefone: exibe formatado, envia limpo
      {
        name: "contact.contact_phone",
        type: "custom",
        colSpan: 2,
        defaultValue: (o) => formatPhone(o.contact.contact_phone),
        formatValue: (v) => formatPhone(v),
        parseValue: (v) => cleanPhone(v),
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#FF8F3F]" />
              <span>Telefone para Contato</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input

              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="(00) 00000-0000"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // Separador para Endereço
      {
        name: "address_separator",
        type: "custom",
        colSpan: 2,
        customRender: () => (
          <div className="col-span-2 pt-2">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-[#FF8F3F]" />
              <h3 className="text-base font-medium">Endereço de Cobrança</h3>
            </div>
            <Separator />
          </div>
        ),
      },

      // CEP: exibe formatado, envia limpo
      {
        name: "billing_address.cep",
        type: "custom",
        colSpan: 2,
        defaultValue: (o) => formatCEP(o.billing_address.cep),
        formatValue: (v) => formatCEP(v),
        parseValue: (v) => cleanCEP(v),
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#FF8F3F]" />
              <span>CEP</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input

              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="00000-000"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // Endereço completo em campos separados
      {
        name: "billing_address.street_name",
        type: "custom",
        colSpan: 1,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span>Rua</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input

onChange={(e) => onChange(e.target.value)}
placeholder="000.000.000-00"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // Número e Bairro na mesma linha
      {
        name: "billing_address.number",
        type: "custom",
        colSpan: 1,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span>Número</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={value}
              onChange={(e: { target: { value: string } }) =>
                onChange(e.target.value)
              }
              placeholder="Número"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },
      {
        name: "billing_address.district",
        type: "custom",
        colSpan: 1,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span>Bairro</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={value}
              onChange={(e: { target: { value: string } }) =>
                onChange(e.target.value)
              }
              placeholder="Bairro"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // Cidade e Estado na mesma linha
      {
        name: "billing_address.city",
        type: "custom",
        colSpan: 1,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span>Cidade</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={value}
              onChange={(e: { target: { value: string } }) =>
                onChange(e.target.value)
              }
              placeholder="Cidade"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },
      {
        name: "billing_address.state",
        type: "custom",
        colSpan: 1,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span>Estado</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="UF"
              className="transition-all focus-visible:ring-[#FF8F3F]"
              maxLength={2}
            />
          </div>
        ),
      },
      {
        name: "billing_address.description",
        type: "custom",
        colSpan: 1,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span>Descrição</span>
              <span className="text-destructive"></span>
            </Label>
            <Input
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Trabalho"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // Observação
      {
        name: "billing_address.observation",
        type: "custom",
        colSpan: 2,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span>Observação</span>
            </Label>
            <Textarea
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Observações sobre o endereço"
              className="min-h-[80px] transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },
    ],
  };
  return drawerConfig;
}
