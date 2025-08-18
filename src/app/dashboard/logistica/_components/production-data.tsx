"use client";

import type { DrawerConfig } from "@/components/datatable";
import type { ColumnDef } from "@tanstack/react-table";
import {
  type ProductionRecord,
  type ProductionUpdate,
  productionUpdateSchema,
  type ProductionItem,
} from "@/types/Production";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Hash,
  ListChecks,
  StickyNote,
  Package,
  Plus,
  Trash2,
} from "lucide-react";
import { useProductionList } from "@/hooks/useProduction";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import DatePicker from "@/components/ui/date-picker";
import { useProductList } from "@/hooks/useProduct";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ProductSelector } from "@/components/productSelector";
import React from "react";

// -------------------------
// Helpers
// -------------------------
const toBRDate = (s?: string | null) => {
  if (!s) return "-";
  const iso = s.length >= 10 ? s.slice(0, 10) : s;
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return s;
  return `${d}/${m}/${y}`;
};
const toYMD = (s?: string | null) => (s ? s.slice(0, 10) : "");
const isValidYMD = (s?: string | null) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);

const statusLabelPT = (s: number) =>
  s === 0 ? "Planejado" : s === 1 ? "Em produção" : "Concluído";
const statusBadgePT = (s: number) => {
  const base = "border ";
  if (s === 0)
    return `${base}bg-yellow-500/10 text-yellow-700 border-yellow-500/20`;
  if (s === 1) return `${base}bg-blue-500/10 text-blue-700 border-blue-500/20`;
  return `${base}bg-green-500/10 text-green-700 border-green-500/20`;
};

// -------------------------
// Tabela de listagem (se estiver usando)
// -------------------------
export const productionColumns: ColumnDef<ProductionRecord, string>[] = [
  {
    id: "start_date",
    header: "Início",
    cell: ({ row }) => toBRDate(row.original.start_date),
  },
  {
    id: "end_date",
    header: "Fim",
    cell: ({ row }) => toBRDate(row.original.end_date),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline" className={statusBadgePT(row.original.status)}>
        {statusLabelPT(row.original.status)}
      </Badge>
    ),
  },
  {
    id: "items",
    header: "Itens",
    cell: ({ row }) => String(row.original.production_items?.length ?? 0),
  },
  {
    id: "notes",
    header: "Observações",
    cell: ({ row }) => row.original.notes ?? "-",
  },
];

// -------------------------
// Lista simples de itens de produção (1 coluna, estável)
// -------------------------
function ProductionItemsSimple({
  record,
  onChange,
}: {
  record: ProductionRecord;
  onChange: (items: ProductionItem[]) => void;
}) {
  // Busca produtos ativos para resolver nomes. Se preferir listar todos, troque status para "all".
  const { products = [] } = useProductList("active", 1, 1000);
  const [items, setItems] = useState<ProductionItem[]>([]);

  // Mapa id->nome para lookup rápido
  const productNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products) {
      if (p?.id) map.set(String(p.id), p.name ?? "");
    }
    return map;
  }, [products]);

  useEffect(() => {
    if (record && Array.isArray(record.production_items)) {
      // Clona para state local
      const newItems = record.production_items.map((it) => ({ ...it }));
      setItems(newItems);
      onChange(newItems);
    } else {
      setItems([]);
      onChange([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record?.id, record?.production_items]);

  const updateItems = useCallback(
    (next: ProductionItem[]) => {
      setItems(next);
      onChange(next);
    },
    [onChange]
  );

  const updateItem = useCallback(
    (index: number, field: keyof ProductionItem, value: any) => {
      const next = items.map((it, i) =>
        i === index ? { ...it, [field]: value } : it
      );
      updateItems(next);
    },
    [items, updateItems]
  );

  const addNewItem = useCallback(() => {
    const next = [
      ...items,
      {
        product_id: "",
        quantity_produced: 0,
        expiration_date: null,
      } as ProductionItem,
    ];
    updateItems(next);
  }, [items, updateItems]);

  const removeItem = useCallback(
    (idx: number) => {
      const next = items.filter((_, i) => i !== idx);
      updateItems(next);
    },
    [items, updateItems]
  );

  // Render estável em 1 coluna
  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-[#FF8F3F]" />
          <h3 className="text-base font-semibold">Itens Produzidos</h3>
        </div>
        <Button
          type="button"
          onClick={addNewItem}
          className="bg-[#FF8F3F] hover:bg-[#FF8F3F]/90 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Item
        </Button>
      </div>

      {(!record || !record.id) && (
        <div className="flex items-center justify-center p-8 text-muted-foreground">
          <div className="text-center">
            <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Carregando informações...</p>
          </div>
        </div>
      )}

      {record?.id && items.length === 0 && (
        <div className="text-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
          <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground mb-2">Nenhum item adicionado</p>
          <p className="text-sm text-muted-foreground/75">
            Clique em &ldquo;Adicionar Item&rdquo; para começar
          </p>
        </div>
      )}

      {/* Lista simples de cartões, 1 coluna */}
      {record?.id &&
        items.map((item, idx) => {
          const isExisting = !!(item as any).id;
          const resolvedName =
            (item as any).product_name ||
            productNameById.get(String(item.product_id)) ||
            "Produto";

          return (
            <div
              key={`${record.id}-${idx}-${item.product_id || idx}`}
              className="border rounded-lg bg-card"
            >
              <div
                className={`p-3 border-b ${
                  isExisting
                    ? "bg-green-50 border-green-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isExisting ? "bg-green-500/10" : "bg-blue-500/10"
                      }`}
                    >
                      <Package
                        className={
                          isExisting
                            ? "h-4 w-4 text-green-600"
                            : "h-4 w-4 text-blue-600"
                        }
                      />
                    </div>
                    <div>
                      <h4
                        className={
                          isExisting
                            ? "font-medium text-green-800"
                            : "font-medium text-blue-800"
                        }
                      >
                        {resolvedName}
                      </h4>
                      <p
                        className={
                          isExisting
                            ? "text-xs text-green-600"
                            : "text-xs text-blue-600"
                        }
                      >
                        {isExisting ? "Item existente" : "Novo item"}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(idx)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {!isExisting && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Produto</Label>
                    <Select
                      value={item.product_id || ""}
                      onValueChange={(v) => updateItem(idx, "product_id", v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o produto a ser produzido" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Quantidade Produzida
                  </Label>
                  <Input
                    type="number"
                    value={item.quantity_produced ?? 0}
                    onChange={(e) =>
                      updateItem(
                        idx,
                        "quantity_produced",
                        Number.parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                    min={0}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Data de Validade
                  </Label>
                  <DatePicker
                    value={
                      isValidYMD(item.expiration_date as any)
                        ? (item.expiration_date as string)
                        : ""
                    }
                    onChange={(s) =>
                      updateItem(idx, "expiration_date", s ? toYMD(s) : null)
                    }
                    placeholder="Selecione a validade (opcional)"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}

// Converte itens de produção -> itens do ProductSelector
const toSelectorItems = (items: ProductionItem[]) =>
  (items || []).map((it) => ({
    product_id: String(it.product_id || ""),
    quantity: Number(it.quantity_produced || 0),
  }));

// Converte itens do ProductSelector -> itens de produção
const fromSelectorItems = (
  selectorItems: { product_id: string; quantity: number }[],
  base?: ProductionItem[]
) => {
  const baseById = new Map(
    (base || []).map((it) => [String(it.product_id || ""), it])
  );
  return selectorItems.map((s) => {
    const prev = baseById.get(String(s.product_id));
    return {
      ...(prev || {}),
      product_id: String(s.product_id),
      quantity_produced: Number(s.quantity || 0),
      // mantém expiration_date se já existia (ou null)
      expiration_date: prev?.expiration_date ?? null,
    } as ProductionItem;
  });
};

// -------------------------
// Drawer (1 coluna, estável)
// -------------------------
export function useProductionDrawerConfig() {
  const { mutate } = useProductionList(undefined, undefined, 1, 10);
  
  // Mover o hook para o nível superior
  const { products = [] } = useProductList("all", 1, 1000);
  
  // Processar produtos uma única vez
  const productOptions = useMemo(() => 
    products.map((p) => ({
      id: String(p.id),
      name: p.name,
      price:
        typeof p.price === "number"
          ? p.price
          : Number.parseFloat(String(p.price || 0)) || 0,
    }))
  , [products]);

  const drawerConfig: DrawerConfig<ProductionRecord, ProductionUpdate> = {
    title: (rec) => (
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#FF8F3F]/10 rounded-lg">
          <ListChecks className="h-5 w-5 text-[#FF8F3F]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Registro de Produção</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie os dados de produção
          </p>
        </div>
      </div>
    ),

    description: (rec) => (
      <div className="flex items-center justify-between mt-4 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status atual:</span>
          <Badge variant="outline" className={statusBadgePT(rec.status)}>
            {statusLabelPT(rec.status)}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {rec.production_items?.length ?? 0} itens
        </div>
      </div>
    ),

    updateSchema: productionUpdateSchema,
    mutate,

    fields: [
      // ID obrigatório no payload final (read-only)
      {
        name: "id",
        type: "custom",
        colSpan: 2,
        defaultValue: (o) => String(o?.id ?? ""),
        formatValue: (v) => String(v ?? ""),
        customRender: (value: string) => (
          <div className="space-y-2 p-4 bg-muted/30 rounded-lg border">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Hash className="h-4 w-4 text-[#FF8F3F]" />
              Identificador
            </Label>
            <Input
              value={value ?? ""}
              disabled
              className="bg-background font-mono text-sm"
            />
          </div>
        ),
      },

      // Seção Período
      {
        name: "period_section",
        type: "custom",
        colSpan: 2,
        customRender: () => (
          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-base font-semibold">Período de Produção</h3>
            </div>
            <Separator className="my-2" />
          </div>
        ),
      },

      // Início
      {
        name: "start_date",
        type: "custom",
        colSpan: 2,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Data de Início</Label>
            <DatePicker
              value={isValidYMD(value) ? value : ""}
              onChange={(s) => onChange(toYMD(s))}
              placeholder="Selecione a data de início"
              className="w-full"
            />
          </div>
        ),
      },

      // Fim
      {
        name: "end_date",
        type: "custom",
        colSpan: 2,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Data de Término</Label>
            <DatePicker
              value={isValidYMD(value) ? value : ""}
              onChange={(s) => onChange(toYMD(s))}
              placeholder="Selecione a data de término"
              className="w-full"
            />
          </div>
        ),
      },

      // Status
      {
        name: "status",
        type: "custom",
        colSpan: 2,
        customRender: (value: number, onChange: (v: number) => void) => (
          <div className="space-y-3 mt-4">
            <Label className="text-sm font-medium">Status da Produção</Label>
            <div className="flex flex-col gap-2">
              {[0, 1, 2].map((s) => (
                <Button
                  key={s}
                  type="button"
                  variant={value === s ? "default" : "outline"}
                  className={`justify-start h-auto p-4 ${
                    value === s
                      ? "bg-[#FF8F3F] hover:bg-[#FF8F3F]/90 text-white border-[#FF8F3F]"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => onChange(s)}
                >
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-medium">{statusLabelPT(s)}</span>
                    <span className="text-xs opacity-80">
                      {s === 0
                        ? "Registro planejado, ainda não iniciado"
                        : s === 1
                        ? "Produção em andamento"
                        : "Produção concluída e estoque reposto"}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        ),
      },

      // Observações
      {
        name: "notes",
        type: "custom",
        colSpan: 2,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2 mt-4">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <StickyNote className="h-4 w-4 text-[#FF8F3F]" />
              Observações
            </Label>
            <Input
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Adicione observações sobre esta produção (opcional)"
              className="min-h-[40px]"
            />
          </div>
        ),
      },

      {
        name: "production_items",
        type: "custom",
        colSpan: 2,

        /* 1) API -> formato do ProductSelector */
        defaultValue: (o) => ({
          items: Array.isArray(o?.production_items)
            ? o.production_items.map((it: { product_id: any; quantity_produced: any; }) => ({
                product_id: String(it.product_id ?? ""),
                quantity: it.quantity_produced ?? 0,
              }))
            : [],
        }),

        /* 2) Drawer -> payload pro backend (precisa só de product_id e quantity_produced) */
        formatValue: (val) => {
          const items = (val as any)?.items ?? [];
          return items.map((it: any) => ({
            product_id: String(it.product_id),
            quantity_produced: Number(it.quantity || 0),
          }));
        },

        /* 3) UI igual ao drawer de Pedidos */
        customRender: (val, onChange) => {
          const items = (val as any)?.items ?? [];
          const handleChange = (next: any[]) => onChange({ items: next });

          return (
            <div className="space-y-4">
              <Label className="text-sm font-medium">Produtos produzidos</Label>
              <ProductSelector
                products={productOptions}
                value={items}
                onChange={handleChange}
              />
            </div>
          );
        },
      },
    ],
  };

  return drawerConfig;
}
