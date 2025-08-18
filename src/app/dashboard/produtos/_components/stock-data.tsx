"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { DrawerConfig } from "@/components/datatable";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { stockConfigUpdateSchema, type StockListItem, type StockConfigUpdate } from "@/types/Stock";
import { useStockList } from "@/hooks/useStock";
import { Package, ArrowDownToDot, ArrowUpToLine, Hash } from "lucide-react";

// Badge de status
function StockStatusBadge({ item }: { item: StockListItem }) {
  const { current_stock, min_stock_threshold, max_stock_capacity } = item;
  let label = "OK";
  let color = "bg-blue-500/10 text-blue-600 border-blue-500/20";
  if (current_stock <= min_stock_threshold) {
    label = "Baixo";
    color = "bg-red-500/10 text-red-600 border-red-500/20";
  } else if (current_stock >= max_stock_capacity) {
    label = "Cheio";
    color = "bg-green-500/10 text-green-600 border-green-500/20";
  }
  return (
    <Badge variant="outline" className={color}>
      {label}
    </Badge>
  );
}

// Colunas (flat)
export const stockColumns: ColumnDef<StockListItem, string>[] = [
  {
    id: "product_name",
    header: "Produto",
    cell: ({ row }) => row.original.product_name,
  },
  {
    id: "current_stock",
    header: "Atual",
    cell: ({ row }) => String(row.original.current_stock),
  },
  {
    id: "min_stock_threshold",
    header: "Mínimo",
    cell: ({ row }) => String(row.original.min_stock_threshold),
  },
  {
    id: "max_stock_capacity",
    header: "Máximo",
    cell: ({ row }) => String(row.original.max_stock_capacity),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => <StockStatusBadge item={row.original} />,
  },
];

// Drawer para editar estoque (PUT completo)
export function useStockDrawerConfig() {
  const { mutate } = useStockList();

  const drawerConfig: DrawerConfig<StockListItem, StockConfigUpdate> = {
    title: (item) => (
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-[#FF8F3F]" />
        <span>{item.product_name}</span>
      </div>
    ),

    description: (item) => (
      <div className="flex items-center gap-2 mt-2">
        <span className="text-muted-foreground">
          Editar configuração de estoque
        </span>
      </div>
    ),

    updateSchema: stockConfigUpdateSchema,
    mutate,

    fields: [
      // Seção
      {
        name: "stock_separator",
        type: "custom",
        colSpan: 2,
        customRender: () => (
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-5 w-5 text-[#FF8F3F]" />
              <h3 className="text-base font-medium">Estoque</h3>
            </div>
            <Separator />
          </div>
        ),
      },

      // Campos read-only para satisfazer o schema (id e product_id)
      {
        name: "id",
        type: "custom",
        colSpan: 2,
        defaultValue: (o) => o.id,
        customRender: (value: string) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-[#FF8F3F]" />
              <span>ID da configuração</span>
            </Label>
            <Input value={value ?? ""} disabled />
          </div>
        ),
      },
      {
        name: "product_id",
        type: "custom",
        colSpan: 2,
        defaultValue: (o) => o.product_id,
        customRender: (value: string) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-[#FF8F3F]" />
              <span>ID do produto</span>
            </Label>
            <Input value={value ?? ""} disabled />
          </div>
        ),
      },

      // Campos editáveis
      {
        name: "current_stock",
        type: "custom",
        colSpan: 2,
        customRender: (value: number, onChange: (v: number) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ArrowDownToDot className="h-4 w-4 text-[#FF8F3F]" />
              <span>Estoque atual</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              value={Number.isFinite(value as any) ? (value as any) : 0}
              onChange={(e) => onChange(Number.parseInt(e.target.value) || 0)}
              placeholder="0"
              className="transition-all focus-visible:ring-[#FF8F3F]"
              min={0}
            />
          </div>
        ),
      },
      {
        name: "min_stock_threshold",
        type: "custom",
        colSpan: 1,
        customRender: (value: number, onChange: (v: number) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ArrowDownToDot className="h-4 w-4 text-[#FF8F3F]" />
              <span>Mínimo</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              value={Number.isFinite(value as any) ? (value as any) : 0}
              onChange={(e) => onChange(Number.parseInt(e.target.value) || 0)}
              placeholder="0"
              className="transition-all focus-visible:ring-[#FF8F3F]"
              min={0}
            />
          </div>
        ),
      },
      {
        name: "max_stock_capacity",
        type: "custom",
        colSpan: 1,
        customRender: (value: number, onChange: (v: number) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ArrowUpToLine className="h-4 w-4 text-[#FF8F3F]" />
              <span>Máximo</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              value={Number.isFinite(value as any) ? (value as any) : 0}
              onChange={(e) => onChange(Number.parseInt(e.target.value) || 0)}
              placeholder="0"
              className="transition-all focus-visible:ring-[#FF8F3F]"
              min={0}
            />
          </div>
        ),
      },
    ],
  };

  return drawerConfig;
}