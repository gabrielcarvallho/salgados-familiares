"use client";

import type { DrawerConfig } from "@/components/datatable";
import { useProductList } from "@/hooks/useProduct";
import { formatCurrency } from "@/lib/utils";
import {
  type ProductResponse,
  type ProductUpdateRequest,
  productUpdateRequestSchema,
} from "@/types/Product";
import type { ColumnDef } from "@tanstack/react-table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Package, Tag, Scale } from "lucide-react";

export const columns: ColumnDef<ProductResponse, string>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => row.original.name ?? "-",
  },
  {
    id: "price",
    accessorKey: "price",
    header: "Preço",
    cell: ({ row }) => {
      const price =
        typeof row.original.price === "number"
          ? row.original.price
          : Number.parseFloat(String(row.original.price)) || 0;
      return formatCurrency(price);
    },
  },
  {
    id: "weight",
    accessorKey: "weight",
    header: "Peso/unidade (g)",
    cell: ({ row }) => row.original.weight ?? "-",
  },
];

export function useDrawerConfig() {
  const { mutate } = useProductList("all");

  const drawerConfig: DrawerConfig<ProductResponse, ProductUpdateRequest> = {
    title: (product) => (
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-[#FF8F3F]" />
        <span>{product.name}</span>
      </div>
    ),

    description: (product) => (
      <div className="flex items-center gap-2 mt-2">
        <Tag className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Preço</span>
        <Badge
          variant="outline"
          className="bg-[#FF8F3F]/10 text-[#FF8F3F] border-[#FF8F3F]/20"
        >
          R{"$ "}
          {typeof product.price === "number"
            ? product.price.toFixed(2)
            : Number.parseFloat(String(product.price || 0)).toFixed(2)}
        </Badge>
      </div>
    ),

    updateSchema: productUpdateRequestSchema,
    mutate,

    fields: [
      // ID (read-only) — garante presença do id para o schema de PUT
      {
        name: "id",
        type: "custom",
        colSpan: 2,
        defaultValue: (o) => o.id,
        customRender: (value: string) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span>ID</span>
            </Label>
            <Input value={value ?? ""} disabled />
          </div>
        ),
      },

      // Seção: Informações Básicas
      {
        name: "basic_info_separator",
        type: "custom",
        colSpan: 2,
        customRender: () => (
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-5 w-5 text-[#FF8F3F]" />
              <h3 className="text-base font-medium">Informações Básicas</h3>
            </div>
            <Separator />
          </div>
        ),
      },

      // Nome do produto
      {
        name: "name",
        type: "custom",
        colSpan: 2,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Package className="h-4 w-4 text-[#FF8F3F]" />
              <span>Nome do Produto</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Nome do produto"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // Preço
      {
        name: "price",
        type: "custom",
        colSpan: 2,
        customRender: (value: number, onChange: (v: number) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-[#FF8F3F]" />
              <span>Preço (R$)</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              step="0.01"
              value={
                typeof value === "number"
                  ? value
                  : Number.parseFloat(String(value || 0)) || 0
              }
              onChange={(e) => onChange(Number.parseFloat(e.target.value) || 0)}
              placeholder="0,00"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // Peso
      {
        name: "weight",
        type: "custom",
        colSpan: 2,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-[#FF8F3F]" />
              <span>Peso/unidade (g)</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Peso em gramas (ex.: 50)"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },
    ],
  };

  return drawerConfig;
}
