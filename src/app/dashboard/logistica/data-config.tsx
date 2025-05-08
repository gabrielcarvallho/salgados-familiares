"use client"
import type { ColumnDef } from "@tanstack/react-table"
import type { DrawerConfig } from "@/components/datatable"
import { Badge } from "@/components/ui/badge"
import { useOrderList, useOrderStatus, usePaymentMethods } from "@/hooks/useOrder"
import { badgesVariant, formatDateToBR, formatStatus, formatPaymentMethod } from "@/lib/utils"
import { type OrderUpdateRequest, orderUpdateRequestSchema, type OrderResponse } from "@/types/Order"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProductList } from "@/hooks/useProduct"
import DatePicker from "@/components/ui/date-picker"
import { ProductSelector } from "@/components/productSelector"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  ShoppingCart,
  Building,
  CalendarClock,
  CreditCard,
  CheckCircle,
  Clock,
  Package,
  Calculator,
} from "lucide-react"

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
    cell: ({ row }) => row.original.customer.company_name,
  },
  {
    id: "payment_method",
    accessorKey: "payment_method.name",
    header: "Método de Pagamento",
    cell: ({ row }) => <Badge variant="outline">{formatPaymentMethod(row.original.payment_method.name)}</Badge>,
  },
  {
    id: "delivery_date",
    accessorKey: "delivery_date",
    header: "Data de entrega",
    cell: ({ row }) => formatDateToBR(row.original.delivery_date),
  },
  {
    id: "due_date",
    accessorKey: "due_date",
    header: "Data de vencimento",
    cell: ({ row }) => formatDateToBR(row.original.due_date),
  },
  {
    id: "order_status",
    accessorKey: "order_status.description",
    header: "Status",
    cell: ({ row }) => {
      const { badge, stats } = badgesVariant(row.original.order_status.identifier)
      return <Badge variant={badge}>{stats}</Badge>
    },
  },
  {
    id: "is_delivered",
    accessorKey: "is_delivered",
    header: "Entregue",
    cell: ({ row }) => (row.original.is_delivered ? "Sim" : "Não"),
  },
  {
    id: "total_price",
    accessorKey: "total_price",
    header: "Preço",
    cell: ({ row }) => {
      const n =
        typeof row.original.total_price === "number"
          ? row.original.total_price
          : Number.parseFloat(row.original.total_price as any) || 0
      return `R$ ${n.toFixed(2)}`
    },
  },
]

export function useDrawerConfig() {
  const { paymentMethods = [] } = usePaymentMethods()
  const { orderStatus: orderStatuses = [] } = useOrderStatus()
  const { products = [] } = useProductList()
  const { mutate } = useOrderList()

  const drawerConfig: DrawerConfig<OrderResponse, OrderUpdateRequest> = {
    title: (o) => (
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-5 w-5 text-[#FF8F3F]" />
        <span>Pedido #{o.order_number}</span>
      </div>
    ),
    description: (o) => (
      <div className="flex items-center gap-2">
        <Building className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Cliente: {o.customer.company_name}</span>
        {o.order_status && (
          <Badge variant={badgesVariant(o.order_status.identifier).badge} className="ml-2">
            {badgesVariant(o.order_status.identifier).stats}
          </Badge>
        )}
      </div>
    ),
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
        defaultValue: (o) => String(o.order_status.id),
        formatValue: (v) => String(v),
        customRender: (value: string, onChange: (v: string) => void) => {
          const safeValue = value || ""
          return (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#FF8F3F]" />
                <span>Status do pedido</span>
                <span className="text-destructive">*</span>
              </Label>
              <Select value={safeValue} onValueChange={onChange}>
                <SelectTrigger className="w-full focus-visible:ring-[#FF8F3F]">
                  <SelectValue placeholder="Selecione status" />
                </SelectTrigger>
                <SelectContent>
                  {orderStatuses.map((st) => (
                    <SelectItem key={st.id} value={String(st.id)}>
                      {formatStatus(st.description)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )
        },
      },

      // Método de pagamento
      {
        name: "payment_method_id",
        type: "custom",
        colSpan: 1,
        defaultValue: (o) => String(o.payment_method.id),
        formatValue: (v) => String(v),
        customRender: (value: string, onChange: (v: string) => void) => {
          const safeValue = value || ""
          return (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#FF8F3F]" />
                <span>Método de pagamento</span>
                <span className="text-destructive">*</span>
              </Label>
              <Select value={safeValue} onValueChange={onChange}>
                <SelectTrigger className="w-full focus-visible:ring-[#FF8F3F]">
                  <SelectValue placeholder="Selecione método" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((pm) => (
                    <SelectItem key={pm.id} value={String(pm.id)}>
                      {formatPaymentMethod(pm.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )
        },
      },

      // Datas
      {
        name: "delivery_date",
        type: "custom",
        colSpan: 1,
        defaultValue: (o) => o.delivery_date,
        formatValue: (v) => v,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-[#FF8F3F]" />
              <span>Data de entrega</span>
              <span className="text-destructive">*</span>
            </Label>
            <DatePicker value={value} onChange={onChange} className="w-full focus-visible:ring-[#FF8F3F]" />
          </div>
        ),
      },

      {
        name: "due_date",
        type: "custom",
        colSpan: 1,
        defaultValue: (o) => o.due_date,
        formatValue: (v) => v,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#FF8F3F]" />
              <span>Data de vencimento</span>
            </Label>
            <DatePicker disabled value={value} onChange={onChange} className="w-full focus-visible:ring-[#FF8F3F]" />
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
                product_id: String(p.product.id),
                quantity: p.quantity,
              }))
            : [],
        formatValue: (v) => (Array.isArray(v) ? v : []),
        customRender: (items = [], onChange) => {
          // Converter o formato dos itens para o formato esperado pelo ProductSelector
          const formattedItems = Array.isArray(items)
            ? items.map((item) => ({
                product_id: item.product_id,
                quantity: item.quantity,
              }))
            : []

          // Função para atualizar os itens quando o ProductSelector mudar
          const handleProductChange = (newItems: any) => {
            onChange(newItems)
          }

          // Preparar os produtos para o ProductSelector
          const formattedProducts = products.map((product) => ({
            id: String(product.id),
            name: product.name,
            price: product.price,
          }))

          // Calcular o total do pedido
          const calculateTotal = () => {
            if (!formattedItems.length) return 0

            return formattedItems.reduce((total, item) => {
              const product = formattedProducts.find((p) => p.id === item.product_id)
              if (!product) return total

              const price =
                typeof product.price === "number" ? product.price : Number.parseFloat(String(product.price)) || 0

              return total + price * item.quantity
            }, 0)
          }

          return (
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-md p-4">
                <ProductSelector products={formattedProducts} value={formattedItems} onChange={handleProductChange} />
              </div>

              {formattedItems.length > 0 && (
                <Card className="bg-muted/40 border-muted">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Calculator className="h-4 w-4 text-[#FF8F3F]" />
                      <h3 className="text-sm font-medium">Resumo do Pedido</h3>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-medium text-lg text-[#FF8F3F]">R$ {calculateTotal().toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )
        },
      },
    ],
  }

  return drawerConfig
}
