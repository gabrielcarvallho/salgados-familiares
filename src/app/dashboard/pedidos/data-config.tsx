import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DrawerConfig } from "@/components/datatable";
import { Badge } from "@/components/ui/badge";
import {
  useOrder,
  useOrderList,
  useOrderStatus,
  usePaymentMethods,
} from "@/hooks/useOrder";
import {
  badgesVariant,
  formatDateToBR,
  formatDateInput,
  formatStatus,
  formatPaymentMethod,
} from "@/lib/utils";
import {
  OrderUpdateRequest,
  orderUpdateRequestSchema,
  OrderResponse,
} from "@/types/Order";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { IconTrash } from "@tabler/icons-react";
import { useProductList } from "@/hooks/useProduct";
import { useDrawerFormContext } from "@/hooks/contexts/DrawerFormContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import { mutate } from "swr";
import DatePicker from "@/components/ui/date-picker";

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "Selecione a data";
  try {
    return format(parseISO(dateString), "dd/MM/yyyy");
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return "Data inválida";
  }
};

// Colunas da tabela
export const columns: ColumnDef<OrderResponse, any>[] = [
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
  const { mutate } = useOrderList();

  const drawerConfig: DrawerConfig<OrderResponse, OrderUpdateRequest> = {
    title: (o) => `Pedido #${o.id}`,
    description: (o) => `Cliente: ${o.customer.company_name}`,
    updateSchema: orderUpdateRequestSchema,
    mutate: { mutate },
    fields: [
      {
        name: "order_status_id",
        label: "Status do pedido",
        type: "custom",
        colSpan: 2,
        // Ensure default value is a string
        defaultValue: (o) => String(o.order_status.id),
        formatValue: (v) => String(v),
        customRender: (value: string, onChange: (v: string) => void) => {
          // Make sure value is not undefined before rendering
          const safeValue = value || '';
          
          return (
            <Select 
              value={safeValue} 
              onValueChange={onChange}
            >
              <SelectTrigger className="w-full">
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
          );
        },
      },
      {
        name: "payment_method_id",
        label: "Método de pagamento",
        type: "custom",
        colSpan: 2,
        // Ensure default value is a string
        defaultValue: (o) => String(o.payment_method.id),
        formatValue: (v) => String(v),
        customRender: (value: string, onChange: (v: string) => void) => {
          // Make sure value is not undefined before rendering
          const safeValue = value || '';
          
          return (
            <Select 
              value={safeValue} 
              onValueChange={onChange}
            >
              <SelectTrigger className="w-full">
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
          );
        },
      },
      {
        name: "delivery_address_id",
        label: "Endereço de entrega",
        type: "custom",
        colSpan: 2,
        // Ensure default value is a string
        defaultValue: (o) => String(o.delivery_address.id),
        formatValue: (v) => String(v),
        customRender: (value: string, onChange: (v: string) => void) => {
          // Make sure value is not undefined before rendering
          const safeValue = value || '';
          
          return (
            <Select 
              value={safeValue} 
              onValueChange={onChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione endereço" />
              </SelectTrigger>
              <SelectContent>{/* mapeie seus endereços aqui */}</SelectContent>
            </Select>
          );
        },
      },
      // Keep the rest of your fields as they were
      {
        name: "delivery_date",
        label: "Data de entrega",
        type: "custom",
        colSpan: 1,
        defaultValue: (o) => o.delivery_date,
        formatValue: (v) => v,
        customRender: (value: string, onChange: (v: string) => void) => (
          <DatePicker value={value} onChange={onChange} className="my-2"/>
        ),
      },
      {
        name: "due_date",
        label: "Data de vencimento",
        type: "custom",
        colSpan: 1,
        defaultValue: (o) => o.due_date,
        formatValue: (v) => v,
        customRender: (value: string, onChange: (v: string) => void) => (
          <DatePicker disabled value={value} onChange={onChange} />
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
                product_id: String(p.product.id), // Convert to string
                quantity: p.quantity,
              }))
            : [],
        formatValue: (v) => (Array.isArray(v) ? v : []),
        customRender: (items = [], onChange) => {
          const list = Array.isArray(items) ? items : [];

          const add = () =>
            onChange([
              ...list,
              { product_id: products[0]?.id ? String(products[0].id) : "", quantity: 1 },
            ]);

          const remove = (idx: number) =>
            onChange(list.filter((_, j) => j !== idx));

          const updateItem = (
            idx: number,
            key: string,
            value: string | number
          ) =>
            onChange(
              list.map((item, j) =>
                j === idx ? { ...item, [key]: value } : item
              )
            );

          return (
            <div className="flex flex-col gap-3">
              <Button variant={"secondary"} onClick={add}>
                Adicionar produto
              </Button>
              {list.map((it, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Select
                    value={String(it.product_id) || ''}
                    onValueChange={(v) => updateItem(i, "product_id", v)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={it.quantity}
                    onChange={(e) =>
                      updateItem(i, "quantity", Number(e.target.value))
                    }
                    className="w-16"
                  />
                  <Button variant="outline" onClick={() => remove(i)}>
                    <IconTrash />
                  </Button>
                </div>
              ))}
            </div>
          );
        },
      },
    ],
  };

  return drawerConfig;
}