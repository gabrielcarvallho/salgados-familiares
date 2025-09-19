"use client"
import React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DrawerConfig } from "@/components/datatable"
import { Badge } from "@/components/ui/badge"
import { useOrderList, useOrderStatus, usePaymentMethods } from "@/hooks/useOrder"
import {
  badgesVariant,
  formatDateToBR,
  formatStatus,
  formatPaymentMethod,
  formatCEP,
  formatCurrency,
} from "@/lib/utils"
import {
  OrderUpdateRequest,
  orderUpdateRequestSchema,
  OrderResponse,
} from "@/types/Order"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useProductList } from "@/hooks/useProduct"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { CalendarClock, CreditCard, MapPin, Package, ShoppingCart, Building, Clock, Home, FileText, CheckCircle } from 'lucide-react'

// Colunas da tabela
export const columns: ColumnDef<OrderResponse, any>[] = [

  {
    id: "order_number",
    accessorKey: "order_number",
    header: "Pedido",
    cell: ({ row }) => row.original.order_number,
  },
  {
    id: "cliente",
    accessorKey: "customer.company_name",
    header: "Cliente",
    cell: ({ row }) => row.original.customer.name,
  },
  {
    id: "payment_method",
    accessorKey: "payment_method.name",
    header: "Método de Pagamento",
    cell: ({ row }) => (
      <Badge variant="outline">
        {formatPaymentMethod(row.original.payment_method.name)}
      </Badge>
    ),
  },
  {
    id: "delivery_date",
    accessorKey: "delivery_date",
    header: "Data de entrega",
    cell: ({ row }) => formatDateToBR(row.original.delivery_date),
  },
  {
    id: "order_status",
    header: "Status",
    cell: ({ row }) => {
      const st = row.original.order_status;
      const { badge, stats } = badgesVariant({
        sequence_order: st?.sequence_order,
        category: st?.category,
        delivery_method: st?.delivery_method, // pode ser string; a função já normaliza
        description: st?.description,
      });
      return <Badge variant={badge as any}>{stats}</Badge>;
    },
  },
  
  {
    id: "total_price",
    accessorKey: "total_price",
    header: "Preço",
    cell: ({ row }) => {
      const n =
        typeof row.original.total_price === "number"
          ? row.original.total_price
          : parseFloat(row.original.total_price as any) || 0
      return formatCurrency(n)
    },
  },
]

export function useDrawerConfig() {
  const { paymentMethods = [] } = usePaymentMethods()
  const { orderStatus: orderStatuses = [] } = useOrderStatus()
  const { products = [] } = useProductList("all")
  const { mutate } = useOrderList()

  const drawerConfig: DrawerConfig<OrderResponse, OrderUpdateRequest> = {
    title: (o) => (
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-5 w-5 text-[#FF8F3F]" />
        <span>Pedido #{o.order_number}</span>
      </div>
    ),
    description: (o) => {
      const st = o.order_status;
      const { badge, stats } = badgesVariant({
        sequence_order: st?.sequence_order,
        category: st?.category,
        delivery_method: st?.delivery_method,
        description: st?.description,
      });
    
      return (
        <div className="flex items-start gap-2 flex-col justify-center mt-2">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Cliente: {o.customer.name}
            </span>
          </div>
          {st && <Badge variant={badge as any}>{stats}</Badge>}
        </div>
      );
    },
    
    updateSchema: orderUpdateRequestSchema,
    mutate: mutate,

    fields: [
      // Informações do Pedido
      {
        name: "order_info_separator",
        type: "custom",
        colSpan: 2,
        customRender: () => (
          <div className="col-span-2 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="h-5 w-5 text-[#FF8F3F]" />
              <h3 className="text-base font-medium">Informações do Pedido</h3>
            </div>
            <Separator className="mb-4" />
          </div>
        ),
      },
      
      // Status do pedido
      {
        name: "order_status_id",
        type: "custom",
        colSpan: 1,
        defaultValue: (o) => o.order_status.id,
        formatValue: (v) => v,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[#FF8F3F]" />
              <span>Status do pedido</span>
            </Label>
            <Select value={value} onValueChange={onChange} disabled>
              <SelectTrigger className="w-full focus-visible:ring-[#FF8F3F]">
                <SelectValue placeholder="Selecione status" />
              </SelectTrigger>
              <SelectContent>
                {orderStatuses.map((st) => (
                  <SelectItem key={st.id} value={st.id}>
                    {formatStatus(st.description)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ),
      },
      
      // Método de pagamento
      {
        name: "payment_method_id",
        type: "custom",
        colSpan: 1,
        defaultValue: (o) => o.payment_method.id,
        formatValue: (v) => v,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#FF8F3F]" />
              <span>Método de pagamento</span>
            </Label>
            <Select value={value} onValueChange={onChange} disabled>
              <SelectTrigger className="w-full focus-visible:ring-[#FF8F3F]">
                <SelectValue placeholder="Selecione método" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((pm) => (
                  <SelectItem key={pm.id} value={pm.id}>
                    {formatPaymentMethod(pm.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ),
      },
      
      // Datas
      {
        name: "delivery_date",
        type: "custom",
        colSpan: 1,
        defaultValue: (o) => formatDateToBR(o.delivery_date),
        formatValue: (v) => formatDateToBR(v),
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-[#FF8F3F]" />
              <span>Data de entrega</span>
            </Label>
            <Input
              disabled
              value={value}
              onChange={(e: { target: { value: string } }) => onChange(e.target.value)}
              placeholder="dd/mm/yyyy"
              className="focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },
      
      {
        name: "due_date",
        type: "custom",
        colSpan: 1,
        defaultValue: (o) => formatDateToBR(o.due_date),
        formatValue: (v) => formatDateToBR(v),
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#FF8F3F]" />
              <span>Data de vencimento</span>
            </Label>
            <Input
              disabled
              value={value}
              onChange={(e: { target: { value: string } }) => onChange(e.target.value)}
              placeholder="dd/mm/yyyy"
              className="focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },
      
      // Endereço de Entrega
      {
        name: "address_separator",
        type: "custom",
        colSpan: 2,
        customRender: () => (
          <div className="col-span-2 mt-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-[#FF8F3F]" />
              <h3 className="text-base font-medium">Endereço de Entrega</h3>
            </div>
            <Separator className="mb-4" />
          </div>
        ),
      },
      
      // CEP
      {
        name: "delivery_address.cep",
        type: "custom",
        colSpan: 2,
        defaultValue: (o) => formatCEP(o.delivery_address.cep),
        formatValue: (v) => formatCEP(v),
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#FF8F3F]" />
              <span>CEP</span>
            </Label>
            <Input
              disabled
              value={value}
              onChange={(e: { target: { value: string } }) => onChange(e.target.value)}
              placeholder="00000-000"
              className="focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // Endereço completo em campos separados
      {
        name: "delivery_address.street_name",
        type: "custom",
        colSpan: 2,
        formatValue: (v) => v,
        parseValue: (v) => v,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Home className="h-4 w-4 text-[#FF8F3F]" />
              <span>Rua</span>
            </Label>
            <Input
              disabled
              value={value}
              onChange={(e: { target: { value: string } }) => onChange(e.target.value)}
              className="focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },
      
      // Número e Bairro
      {
        name: "delivery_address.number",
        type: "custom",
        colSpan: 1,
        customRender: (value) => (
          <div className="space-y-2">
            <Label>Número</Label>
            <Input 
              value={value} 
              disabled 
              className="focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },
      {
        name: "delivery_address.district",
        type: "custom",
        colSpan: 1,
        customRender: (value) => (
          <div className="space-y-2">
            <Label>Bairro</Label>
            <Input 
              value={value} 
              disabled 
              className="focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },
      
      // Cidade e Estado
      {
        name: "delivery_address.city",
        type: "custom",
        colSpan: 1,
        customRender: (value) => (
          <div className="space-y-2">
            <Label>Cidade</Label>
            <Input 
              value={value} 
              disabled 
              className="focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },
      {
        name: "delivery_address.state",
        type: "custom",
        colSpan: 1,
        customRender: (value) => (
          <div className="space-y-2">
            <Label>Estado</Label>
            <Input 
              value={value} 
              disabled 
              className="focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // Observação
      {
        name: "delivery_address.observation",
        type: "custom",
        colSpan: 2,
        customRender: (value) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#FF8F3F]" />
              <span>Observação</span>
            </Label>
            <Textarea 
              value={value} 
              disabled 
              className="min-h-[80px] focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },
      
      // Produtos
      {
        name: "products_separator",
        type: "custom",
        colSpan: 2,
        customRender: () => (
          <div className="col-span-2 mt-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-5 w-5 text-[#FF8F3F]" />
              <h3 className="text-base font-medium">Produtos</h3>
            </div>
            <Separator className="mb-4" />
          </div>
        ),
      },
      
      {
        name: "products",
        type: "custom",
        colSpan: 2,
        defaultValue: (o) =>
          Array.isArray(o.products)
            ? o.products.map((p: { product: { id: any }; quantity: any }) => ({
                product_id: p.product.id,
                quantity: p.quantity,
              }))
            : [],
        formatValue: (v) => (Array.isArray(v) ? v : []),
        customRender: (items = [], onChange) => {
          const list = Array.isArray(items) ? items : []

          return (
            <Card className="bg-muted/30 border-muted">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3">
                  {list.length > 0 ? (
                    <>
                      <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground mb-1">
                        <div className="col-span-8">Produto</div>
                        <div className="col-span-4 text-center">Quantidade</div>
                      </div>
                      {list.map((it, i) => {
                        const product = products.find(p => p.id === it.product_id)
                        return (
                          <div key={i} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-8">
                              <Select value={it.product_id} disabled>
                                <SelectTrigger className="w-full focus-visible:ring-[#FF8F3F]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {products.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                      {p.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-4">
                              <Input
                                type="number"
                                value={it.quantity}
                                className="text-center focus-visible:ring-[#FF8F3F]"
                                disabled
                              />
                            </div>
                          </div>
                        )
                      })}
                    </>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Nenhum produto encontrado
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        },
      },
    ],
  }

  return drawerConfig
}
