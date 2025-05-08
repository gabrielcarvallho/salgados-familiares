"use client"

import type { DrawerConfig } from "@/components/datatable"
import { useProductList } from "@/hooks/useProduct"
import { type ProductResponse, type ProductUpdateRequest, productUpdateRequestSchema } from "@/types/Product"
import type { ColumnDef } from "@tanstack/react-table"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Tag, Scale, Clock, Factory, Layers, Calculator } from "lucide-react"

export const columns: ColumnDef<ProductResponse, string>[] = [
  {
    id: "Nome",
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => row.original.name,
  },
  {
    id: "Preço",
    accessorKey: "price",
    header: "Preço",
    cell: ({ row }) => {
      const price =
        typeof row.original.price === "number" ? row.original.price : Number.parseFloat(String(row.original.price)) || 0
      return `R$ ${price.toFixed(2)}`
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
]

export function useDrawerConfig() {
  const { mutate } = useProductList()

  // Configuração do drawer para edição
  const drawerConfig: DrawerConfig<ProductResponse, ProductUpdateRequest> = {
    title: (product) => (
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-[#FF8F3F]" />
        <span>{product.name}</span>
      </div>
    ),
    description: (product) => (
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Detalhes do produto</span>
        <Badge variant="outline" className="ml-2 bg-[#FF8F3F]/10 text-[#FF8F3F] border-[#FF8F3F]/20">
          R${" "}
          {typeof product.price === "number"
            ? product.price.toFixed(2)
            : Number.parseFloat(String(product.price)).toFixed(2)}
        </Badge>
      </div>
    ),
    updateSchema: productUpdateRequestSchema,
    mutate: mutate,
    fields: [
      // Informações Básicas
      {
        name: "basic_info_separator",
        type: "custom",
        colSpan: 2,
        customRender: () => (
          <div className="col-span-2 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-5 w-5 text-[#FF8F3F]" />
              <h3 className="text-base font-medium">Informações Básicas</h3>
            </div>
            <Separator className="mb-4" />
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
              value={value}
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
              value={value}
              onChange={(e) => onChange(Number.parseFloat(e.target.value) || 0)}
              placeholder="0.00"
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
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Peso em gramas"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // Informações de Produção
      {
        name: "production_info_separator",
        type: "custom",
        colSpan: 2,
        customRender: () => (
          <div className="col-span-2 mt-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Factory className="h-5 w-5 text-[#FF8F3F]" />
              <h3 className="text-base font-medium">Informações de Produção</h3>
            </div>
            <Separator className="mb-4" />
          </div>
        ),
      },

      // Pacotes por Fornada
      {
        name: "batch_packages",
        type: "custom",
        colSpan: 2,
        customRender: (value: number, onChange: (v: number) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#FF8F3F]" />
              <span>Pacotes/Fornada</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              value={value}
              onChange={(e) => onChange(Number.parseInt(e.target.value) || 0)}
              placeholder="Quantidade de pacotes por fornada"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // Tempo de Produção
      {
        name: "batch_production_days",
        type: "custom",
        colSpan: 2,
        customRender: (value: number, onChange: (v: number) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#FF8F3F]" />
              <span>Tempo de produção (dia(s))</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              value={value}
              onChange={(e) => onChange(Number.parseInt(e.target.value) || 0)}
              placeholder="Dias necessários"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // Fornadas por Dia
      {
        name: "daily_batch_capacity",
        type: "custom",
        colSpan: 2,
        customRender: (value: number, onChange: (v: number) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-[#FF8F3F]" />
              <span>Fornadas/dia</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              value={value}
              onChange={(e) => onChange(Number.parseInt(e.target.value) || 0)}
              placeholder="Capacidade diária"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // Resumo do Produto
      
    ],
  }
  return drawerConfig
}
