import { DrawerConfig } from "@/components/datatable";
import {
  CustomerRequest,
  CustomerResponse,
  CustomersResponse,
  CustomerUpdateRequest,
  CustomerUpdateRequestSchema,
} from "@/types/Customer";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<CustomerResponse, any>[] = [
  {
    id: "company_name",
    accessorKey: "company_name", // Use accessorKey com id definido
    header: "Razão Social",
    cell: ({ row }) => row.original.company_name,
  },
  {
    id: "Nome Fantasia",
    accessorKey: "brand", // Use accessorKey com id definido
    header: "Nome Fantasia",
    cell: ({ row }) => row.original.brand_name,
  },
  {
    id: "CNPJ",
    accessorKey: "cnpj",
    header: "CNPJ",
    cell: ({ row }) => row.original.cnpj,
  },
  {
    id: "Contato",
    accessorKey: "contact",
    header: "Contato",
    cell: ({ row }) => row.original.contact.name,
  },
  {
    id: "Telefone",
    accessorKey: "phone",
    header: "Telefone",
    cell: ({ row }) => row.original.contact.contact_phone,
  },
];

// Configuração do drawer para edição
export const drawerConfig: DrawerConfig<
  CustomerResponse,
  CustomerUpdateRequest
> = {
  title: (cliente: CustomerResponse) => `Cliente: ${cliente.brand_name}`,
  description: () => "Detalhes do cliente",
  updateSchema: CustomerUpdateRequestSchema,

  fields: [
    {
      name: "company_name",
      label: "Razão Social",
      type: "text" as const,
      colSpan: 1,
    },
    {
      name: "brand_name",
      label: "Nome Fantasia",
      type: "text" as const,
      colSpan: 1,
    },
    {
      name: "cnpj",
      label: "CNPJ",
      type: "text" as const,
      colSpan: 1,
    },
    {
      name: "state_tax_registration",
      label: "Inscrição Estadual",
      type: "text" as const,
      colSpan: 1,
    },
    {
      name: "billing_address.street_name",
      label: "Endereço",
      type: "text" as const,
      colSpan: 1,
    },
    {
      name: "email",
      label: "E-mail",
      type: "text" as const,
      colSpan: 1,
    },
    {
      name: "contact.name",
      label: "Nome para Contato",
      type: "text" as const,
      colSpan: 1,
    },
    {
      name: "contact.date_of_birth",
      label: "Data de Nascimento",
      type: "text" as const,
      colSpan: 1,
    },
    {
      name: "contact.contact_phone",
      label: "Telefone para Contato",
      type: "text" as const,
      colSpan: 1,
    },
    {
      name: "contact.contact_email",
      label: "E-mail para Contato",
      type: "text" as const,
      colSpan: 2,
    },
  ],
};
