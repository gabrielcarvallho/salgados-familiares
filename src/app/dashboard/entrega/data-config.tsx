import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DrawerConfig } from "@/components/datatable";
import { Badge } from "@/components/ui/badge";
import { useOrderList, useOrderStatus, usePaymentMethods } from "@/hooks/useOrder";
import {
  badgesVariant,
  formatDateToBR,
  formatStatus,
  formatPaymentMethod,
  formatCEP,
} from "@/lib/utils";
import {
  OrderUpdateRequest,
  orderUpdateRequestSchema,
  OrderResponse,
} from "@/types/Order";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useProductList } from "@/hooks/useProduct";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

// Colunas da tabela
export const columns: ColumnDef<OrderResponse, any>[] = [
  {
    id: "id",
    accessorKey: "id",
    header: "Pedido",
    cell: ({ row }) => row.original.id,
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
    accessorKey: "order_status.description",
    header: "Status",
    cell: ({ row }) => {
      const { badge, stats } = badgesVariant(
        row.original.order_status.identifier
      );
      return <Badge variant={badge}>{stats}</Badge>;
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
          : parseFloat(row.original.total_price as any) || 0;
      return `R$ ${n.toFixed(2)}`;
    },
  },
];

export function useDrawerConfig() {
  const { paymentMethods = [] } = usePaymentMethods();
  const { orderStatus: orderStatuses = [] } = useOrderStatus();
  const { products = [] } = useProductList();
  const { mutate } = useOrderList()

  const drawerConfig: DrawerConfig<OrderResponse, OrderUpdateRequest> = {
    title: (o) => `Pedido #${o.id}`,
    description: (o) => `Cliente: ${o.customer.company_name}`,
    updateSchema: orderUpdateRequestSchema,
    mutate: mutate,

    fields: [
      {
        name: "order_status_id",
        label: "Status do pedido",
        type: "custom",
        colSpan: 2,
        defaultValue: (o) => o.order_status.id,
        formatValue: (v) => v,
        customRender: (value: string, onChange: (v: string) => void) => (
          <Select value={value} onValueChange={onChange} disabled>
            <SelectTrigger className="w-full">
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
        ),
      },
      {
        name: "payment_method_id",
        label: "Método de pagamento",
        type: "custom",
        colSpan: 2,
        defaultValue: (o) => o.payment_method.id,
        formatValue: (v) => v,
        customRender: (value: string, onChange: (v: string) => void) => (
          <Select value={value} onValueChange={onChange} disabled>
            <SelectTrigger className="w-full">
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
        ),
      },
      {
        name: "delivery_date",
        label: "Data de entrega",
        type: "custom",
        colSpan: 1,
        defaultValue: (o) => formatDateToBR(o.delivery_date),
        formatValue: (v) => formatDateToBR(v),
        customRender: (value: string, onChange: (v: string) => void) => (
          <Input
            disabled
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="dd/mm/yyyy"
          />
        ),
      },
      {
        name: "due_date",
        label: "Data de vencimento",
        type: "custom",
        colSpan: 1,
        defaultValue: (o) => formatDateToBR(o.due_date),
        formatValue: (v) => formatDateToBR(v),
        customRender: (value: string, onChange: (v: string) => void) => (
          <Input
            disabled
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="dd/mm/yyyy"
          />
        ),
      },
      {
        name: "products",
        label: "Produtos",
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
          const list = Array.isArray(items) ? items : [];

          return (
            <div className="flex flex-col gap-3">
              {list.map((it, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Select value={it.product_id} disabled>
                    <SelectTrigger className="w-32">
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
                  <Input
                    type="number"
                    value={it.quantity}
                    className="w-16"
                    disabled
                  />
                </div>
              ))}
            </div>
          );
        },
      },

      {
        name: "delivery_address.cep",
        label: "CEP",
        type: "custom",
        colSpan: 2,
        defaultValue: (o) => formatCEP(o.delivery_address.cep),
        formatValue: (v) => formatCEP(v),
        customRender: (value: string, onChange: (v: string) => void) => (
          <Input
            disabled
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="00000-000"
          />
        ),
      },

      // Endereço completo em campos separados
      {
        name: "delivery_address.street_name",
        label: "",
        type: "custom",
        colSpan: 2,
        formatValue: (v) => v,
        parseValue: (v) => v,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="flex flex-col space-y-3">
            <Label>Rua</Label>
            <Input
              disabled
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
        ),
      },
      {
        name: "delivery_address.number",
        label: "Número",
        type: "custom",
        colSpan: 1,
        customRender: (value) => <Input value={value} disabled />,
      },
      {
        name: "delivery_address.district",
        label: "Bairro",
        type: "custom",
        colSpan: 1,
        customRender: (value) => <Input value={value} disabled />,
      },
      {
        name: "delivery_address.city",
        label: "Cidade",
        type: "custom",
        colSpan: 1,
        customRender: (value) => <Input value={value} disabled />,
      },
      {
        name: "delivery_address.state",
        label: "Estado",
        type: "custom",
        colSpan: 1,
        customRender: (value) => <Input value={value} disabled />,
      },

      // Observação
      {
        name: "delivery_address.observation",
        label: "Observação",
        type: "custom",
        colSpan: 2,
        customRender: (value) => <Input value={value} disabled />,
      },
    ],
  };

  return drawerConfig;
}
