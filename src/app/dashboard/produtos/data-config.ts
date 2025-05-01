import { DrawerConfig } from "@/components/datatable";
import { ProductRequest, ProductResponse, productResponseSchema, ProductsResponse, ProductUpdateRequest, productUpdateRequestSchema } from "@/types/Product";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<ProductResponse, any>[] = [
    {
      id: "Nome",
      accessorKey: "name", // Use accessorKey com id definido
      header: "Nome",
      cell: ({ row }) => row.original.name,
    },
    {
      id: "Preço",
      accessorKey: "price",
      header: "Preço",
      cell: ({ row }) => {
        const price =
          typeof row.original.price === "number"
            ? row.original.price
            : parseFloat(String(row.original.price)) || 0;
        return `R$ ${price.toFixed(2)}`;
      },
    },
    {
      id: "Peso",
      accessorKey: "weight",
      header: "Peso/unidade (g)",
      cell: ({ row }) => row.original.weight,
    },
  ];

  // Configuração do drawer para edição
  export const drawerConfig: DrawerConfig<
  ProductResponse,
  ProductUpdateRequest
> = {
  title: (product) => `Produto: ${product.name}`,
  description: () => "Detalhes do produto",
  updateSchema: productUpdateRequestSchema,
    fields: [
      {
        name: "name",
        label: "Nome",
        type: "text" as const,
        colSpan: 2,
      },
      {
        name: "batch_packages",
        label: "Pacotes/Fornada",
        type: "number" as const,
      },
      {
        name: "price",
        label: "Preço (R$)",
        type: "number" as const,
      },
      {
        name: "weight",
        label: "Peso/unidade (g)",
        type: "text" as const,
        colSpan: 1,
      },
      {
        name: "batch_production_days",
        label: "Tempo de produção",
        type: "number" as const,
        colSpan: 1,
      },
      {
        name: "daily_batch_capacity",
        label: "Capacidade diária",
        type: "number" as const,
        colSpan: 2,
      },
    ],
  };