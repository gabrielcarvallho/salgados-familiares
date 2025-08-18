"use client";
import type { DrawerConfig } from "@/components/datatable";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  cleanCEP,
  cleanPhone,
  formatCEP,
  formatPhone,
  formatDocumentByType,
  cleanDocument,
  toISODateSafe,
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
  Mail,
  MapPin,
  Phone,
  User,
  Calendar,
  Hash,
} from "lucide-react";

/**
  Recomendação para os utils (garanta algo equivalente no seu "@/lib/utils"):
  - cleanDocument(doc?: string|null): string => apenas dígitos
  - formatDocumentByType(doc?: string|null, type?: "PF"|"PJ"): string
    - Deve limpar para dígitos e decidir a máscara por type (ou por length quando type ausente)
  - formatPhone(phone?: string|null): string => formatar a partir de dígitos de forma segura
  - Todas as funções devem tolerar undefined/null sem lançar erro
*/

// =====================
// Colunas da Tabela
// =====================
export const columns: ColumnDef<CustomerResponse, string>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => row.original.name ?? "-",
  },
  {
    id: "fantasy_name",
    accessorKey: "fantasy_name",
    header: "Nome Fantasia",
    cell: ({ row }) => row.original.fantasy_name ?? "-",
  },
  {
    id: "document",
    accessorKey: "document",
    header: "Documento",
    cell: ({ row }) => {
      const o = row.original as any;

      // Coleta robusta (prioriza "document"; depois legados)
      const rawDoc: string =
        o?.document ??
        o?.cpf ?? // legado PF
        o?.cnpj ?? // legado PJ
        "";

      const digits = cleanDocument(rawDoc);
      if (!digits) return "-";

      // Usa o customer_type quando existir; senão infere por length (<=11 => CPF)
      const type: "PF" | "PJ" =
        o?.customer_type ?? (digits.length > 11 ? "PJ" : "PF");

      const formatted = formatDocumentByType(digits, type);
      return formatted || "-";
    },
  },
  {
    id: "contact_name",
    accessorKey: "contact.name",
    header: "Contato",
    cell: ({ row }) => {
      const o = row.original as any;
      // Fallback visual: PF sem contact persistido exibe o próprio nome
      const name =
        o?.contact?.name ?? (o?.customer_type === "PF" ? o?.name : undefined);
      return name ?? "-";
    },
  },
  {
    id: "contact_phone",
    accessorKey: "contact.contact_phone",
    header: "Telefone",
    cell: ({ row }) => {
      const o = row.original as any;
      // Fallback visual: PF sem contact persistido exibe phone_number do cliente
      const phone =
        o?.contact?.contact_phone ??
        (o?.customer_type === "PF" ? o?.phone_number : undefined);
      return formatPhone(phone) || "-";
    },
  },
];

// =====================
// Drawer de Edição
// =====================
export function useDrawerConfig() {
  const { mutate } = useCustomerList();

  const drawerConfig: DrawerConfig<CustomerResponse, CustomerUpdateRequest> = {
    title: (cliente) => (
      <div className="flex items-center gap-2">
        <Briefcase className="h-5 w-5 text-[#FF8F3F]" />
        <span>{cliente.fantasy_name || cliente.name}</span>
      </div>
    ),

    // Descrição com documento formatado de maneira robusta
    description: (cliente) => {
      const anyC = cliente as any;
      const rawDoc = anyC?.document ?? anyC?.cpf ?? anyC?.cnpj ?? "";
      const digits = cleanDocument(rawDoc);
      const t: "PF" | "PJ" =
        anyC?.customer_type ?? (digits.length > 11 ? "PJ" : "PF");
      const label = digits ? formatDocumentByType(digits, t) : "-";
      return (
        <Badge
          variant="outline"
          className=" bg-[#FF8F3F]/10 text-[#FF8F3F] border-[#FF8F3F]/20 mt-2"
        >
          {label}
        </Badge>
      );
    },

    updateSchema: CustomerUpdateRequestSchema,
    mutate,

    // Campos do Drawer alinhados ao contrato
    fields: [
      // Nome
      {
        name: "name",
        type: "custom",
        colSpan: 2,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#FF8F3F]" />
              <span>Nome</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              className="transition-all focus-visible:ring-[#FF8F3F]"
              placeholder="Nome (PF) ou Razão social (PJ)"
            />
          </div>
        ),
      },

      // Nome Fantasia (opcional)
      {
        name: "fantasy_name",
        type: "custom",
        colSpan: 2,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-[#FF8F3F]" />
              <span>Nome Fantasia</span>
            </Label>
            <Input
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              className="transition-all focus-visible:ring-[#FF8F3F]"
              placeholder="Nome fantasia (opcional)"
            />
          </div>
        ),
      },

      // Documento (CPF/CNPJ): exibe formatado a partir dos dígitos; envia limpo
      {
        name: "document",
        type: "custom",
        colSpan: 2,
        defaultValue: (o) => {
          const anyO = o as any;
          const raw = anyO?.document ?? anyO?.cpf ?? anyO?.cnpj ?? "";
          const digits = cleanDocument(raw);
          if (!digits) return "";
          const t: "PF" | "PJ" =
            anyO?.customer_type ?? (digits.length > 11 ? "PJ" : "PF");
          return formatDocumentByType(digits, t);
        },
        formatValue: (v: any) => {
          const digits = cleanDocument(v);
          if (!digits) return "";
          // Sem acesso ao objeto aqui: inferir por length
          const t: "PF" | "PJ" = digits.length > 11 ? "PJ" : "PF";
          return formatDocumentByType(digits, t);
        },
        parseValue: (v: any) => cleanDocument(v),
        customRender: (value: string, onChange: (v: string) => void, obj) => {
          const type: "PF" | "PJ" | undefined = (obj as any)?.customer_type;
          const placeholder =
            type === "PJ" ? "00.000.000/0000-00" : "000.000.000-00";
          return (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-[#FF8F3F]" />
                <span>{type === "PJ" ? "CNPJ" : "CPF"}</span>
                <span className="text-destructive">*</span>
              </Label>
              <Input
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="transition-all focus-visible:ring-[#FF8F3F]"
              />
            </div>
          );
        },
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
            </Label>
            <Input
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="email@exemplo.com"
              className="transition-all focus-visible:ring-[#FF8F3F]"
              type="email"
            />
          </div>
        ),
      },

      // Telefone (cliente)
      {
        name: "phone_number",
        type: "custom",
        colSpan: 2,
        defaultValue: (o) => formatPhone((o as any)?.phone_number),
        formatValue: (v) => formatPhone(v),
        parseValue: (v) => cleanPhone(v),
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#FF8F3F]" />
              <span>Telefone</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="(00) 00000-0000"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // Separador Contato
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

      // Contato: Nome
      {
        name: "contact.name",
        type: "custom",
        colSpan: 2,
        customRender: (value: string, onChange: (v: string) => void, obj) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4 text-[#FF8F3F]" />
              <span>Nome para Contato</span>
            </Label>
            <Input
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Nome da pessoa de contato"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // Contato: Data de Nascimento (string controlada pelo DatePicker)
      {
        name: "contact.date_of_birth",
        type: "custom",
        colSpan: 2,

        // valor inicial vindo da API
        defaultValue: (o) => (o as any)?.contact?.date_of_birth ?? "",

        // mostra sempre string vazia quando não existir
        formatValue: (v) => v || "",

        // transforma para ISO ou devolve undefined (NÃO null)
        parseValue: (v) => {
          const iso = toISODateSafe(v); // "" -> null ou "YYYY-MM-DD"
          return iso ?? undefined; // undefined = chave omitida
        },

        customRender: (val, onChange) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#FF8F3F]" />
              <span>Data de Nascimento</span>
            </Label>
            <DatePicker
              value={val ?? ""}
              onChange={onChange}
              className="w-full transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // Contato: Telefone
      {
        name: "contact.contact_phone",
        type: "custom",
        colSpan: 2,
        defaultValue: (o) => formatPhone((o as any)?.contact?.contact_phone),
        formatValue: (v) => formatPhone(v),
        parseValue: (v) => cleanPhone(v),
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#FF8F3F]" />
              <span>Telefone para Contato</span>
            </Label>
            <Input
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="(00) 00000-0000"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // Contato: E-mail
      {
        name: "contact.contact_email",
        type: "custom",
        colSpan: 2,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#FF8F3F]" />
              <span>E-mail para Contato</span>
            </Label>
            <Input
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="contato@exemplo.com"
              className="transition-all focus-visible:ring-[#FF8F3F]"
              type="email"
            />
          </div>
        ),
      },

      // Separador Endereço de Cobrança
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

      // CEP
      {
        name: "billing_address.cep",
        type: "custom",
        colSpan: 2,
        defaultValue: (o) => formatCEP((o as any)?.billing_address?.cep),
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
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="00000-000"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // Rua
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
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Rua"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // Número
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
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Número"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // Bairro
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
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Bairro"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // Cidade
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
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Cidade"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // Estado (UF)
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
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="UF"
              className="transition-all focus-visible:ring-[#FF8F3F]"
              maxLength={2}
            />
          </div>
        ),
      },

      // Descrição (opcional)
      {
        name: "billing_address.description",
        type: "custom",
        colSpan: 1,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span>Descrição</span>
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

      // Observação (opcional)
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
