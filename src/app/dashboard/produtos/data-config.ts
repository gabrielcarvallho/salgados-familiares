import { DrawerConfig } from "@/components/datatable";
import { useProductList } from "@/hooks/useProduct";
import {
  ProductRequest,
  ProductResponse,
  ProductUpdateRequest,
  productUpdateRequestSchema,
} from "@/types/Product";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<ProductResponse, string>[] = [
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
  {
    id: "TempoProducao",
    accessorKey: "batch_production_days",
    header: "Tempo de produção (dia(s))",
    cell: ({ row }) => row.original.batch_production_days,
  },
  {
    id: "ProducaoDiaria",
    accessorKey: "daily_batch_capacity",
    header: "Fornadas/dia",
    cell: ({ row }) => row.original.daily_batch_capacity,
  },
];

export function useDrawerConfig() {
  const { mutate } = useProductList();

  // Configuração do drawer para edição
  const drawerConfig: DrawerConfig<ProductResponse, ProductUpdateRequest> = {
    title: (product) => `${product.name}`,
    description: () => "Detalhes do produto",
    updateSchema: productUpdateRequestSchema,
    mutate: mutate,
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
        colSpan: 2,
      },
      {
        name: "price",
        label: "Preço (R$)",
        type: "number" as const,
        colSpan: 2,
      },
      {
        name: "weight",
        label: "Peso/unidade (g)",
        type: "text" as const,
        colSpan: 2,
      },
      {
        name: "batch_production_days",
        label: "Tempo de produção (dia(s))",
        type: "number" as const,
        colSpan: 2,
      },
      {
        name: "daily_batch_capacity",
        label: "Fornadas/dia",
        type: "number" as const,
        colSpan: 2,
      },
    ],
  };
  return drawerConfig;
}
