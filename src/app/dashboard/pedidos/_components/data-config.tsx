"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { DrawerConfig } from "@/components/datatable";
import { Badge } from "@/components/ui/badge";
import {
  useOrderList,
  useOrderStatus,
  usePaymentMethods,
} from "@/hooks/useOrder";
import {
  badgesVariant,
  formatDateToBR,
  formatStatus,
  formatCurrency,
  cleanPhone,
  formatPhone,
} from "@/lib/utils";
import {
  type OrderUpdateRequest,
  orderUpdateRequestSchema,
  type OrderResponse,
} from "@/types/Order";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProductList } from "@/hooks/useProduct";
import DatePicker from "@/components/ui/date-picker";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShoppingCart,
  Building,
  CalendarClock,
  CreditCard,
  CheckCircle,
  Clock,
  Package,
  Calculator,
  Briefcase,
  Building2,
  Hash,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { ProductSelector } from "@/components/productSelector";
import { Input } from "@/components/ui/input";

// Helpers seguros
const safeCustomerName = (o: OrderResponse) => o?.customer?.name ?? "";
const safeCustomerFantasy = (o: OrderResponse) =>
  o?.customer?.fantasy_name ?? "";
const safeCustomerDisplay = (o: OrderResponse) => {
  const n = safeCustomerName(o);
  const f = safeCustomerFantasy(o);
  return f ? `${n} (${f})` : n;
};
const safePaymentName = (o: OrderResponse) => o?.payment_method?.name ?? "";

// Helper atualizado para usar a nova configuração de badges
const safeOrderStatusBadge = (o: OrderResponse) => {
  const st = o?.order_status;
  return badgesVariant({
    sequence_order: st?.sequence_order,
    category: st?.category,
    delivery_method: st?.delivery_method,
    description: st?.description,
  });
};

const safeDeliveryDate = (o: OrderResponse) =>
  o?.delivery_date ? formatDateToBR(o.delivery_date) : "";
const safeDueDate = (o: OrderResponse) =>
  o?.due_date ? formatDateToBR(o.due_date) : "";
const safeTotalPrice = (o: OrderResponse) => {
  return formatCurrency(o.total_price);
};

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
    header: "Cliente",
    cell: ({ row }) => safeCustomerDisplay(row.original),
  },
  {
    id: "payment_method",
    header: "Método de Pagamento",
    cell: ({ row }) => (
      <Badge variant="outline">{safePaymentName(row.original)}</Badge>
    ),
  },
  {
    id: "delivery_date",
    header: "Data de entrega",
    cell: ({ row }) => safeDeliveryDate(row.original),
  },

  {
    id: "order_status",
    header: "Status",
    cell: ({ row }) => {
      const { badge, stats } = safeOrderStatusBadge(row.original);
      return <Badge variant={badge as any}>{stats}</Badge>;
    },
  },
  {
    id: "total_price",
    header: "Preço",
    cell: ({ row }) => safeTotalPrice(row.original),
  },
];

export function useDrawerConfig() {
  const { paymentMethods = [] } = usePaymentMethods();
  // Lista base para exibir nomes de status (readonly)
  const { orderStatus: orderStatuses = [] } = useOrderStatus("ENTREGA");
  const { products = [] } = useProductList("all");
  const { mutate } = useOrderList();

  const drawerConfig: DrawerConfig<OrderResponse, OrderUpdateRequest> = {
    title: (o) => (
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-5 w-5 text-[#FF8F3F]" />
        <span>Pedido #{o.order_number}</span>
      </div>
    ),
    description: (o) => {
      const { badge, stats } = safeOrderStatusBadge(o);
      return (
        <div className="flex items-start gap-2 flex-col justify-center mt-2">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Cliente: {safeCustomerDisplay(o)}
            </span>
          </div>
          {o?.customer?.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{o.customer.email}</span>
            </div>
          )}
          {o?.customer?.contact?.name && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Contato: {o.customer.contact.name}
              </span>
            </div>
          )}
          {o?.customer?.contact?.contact_phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {formatPhone(o.customer.contact.contact_phone)}
              </span>
            </div>
          )}
          {o.order_status && <Badge variant={badge as any}>{stats}</Badge>}
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
          <div className="col-span-2 ">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="h-5 w-5 text-[#FF8F3F]" />
              <h3 className="text-base font-medium">Informações do Pedido</h3>
            </div>
            <Separator />
          </div>
        ),
      },

      // Status do pedido (readonly)
      {
        name: "order_status_id",
        type: "custom",
        colSpan: 2,
        defaultValue: (o) => {
          const id = String(o?.order_status?.id ?? "");
          const isEditable = Number(o?.order_status?.sequence_order ?? 1) === 0;
          return { value: id, isEditable };
        },
        formatValue: (v) =>
          typeof v === "object" && v !== null
            ? String(v.value)
            : String(v ?? ""),
        customRender: (valueObj, onChange) => {
          const { value, isEditable } =
            typeof valueObj === "object" && valueObj !== null
              ? valueObj
              : { value: String(valueObj ?? ""), isEditable: false };

          const safeValue = value || "";

          return (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#FF8F3F]" />
                <span>Status do pedido</span>
              </Label>
              <Select
                value={safeValue}
                onValueChange={(newValue) =>
                  onChange({ value: newValue, isEditable })
                }
                disabled
              >
                <SelectTrigger className="w-full focus-visible:ring-[#FF8F3F]">
                  <SelectValue placeholder="Selecione status" />
                </SelectTrigger>
                <SelectContent>
                  {orderStatuses.map((st: any) => (
                    <SelectItem key={st.id} value={String(st.id)}>
                      {formatStatus(st.description)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        },
      },

      // Método de Pagamento
      {
        name: "payment_method_id",
        type: "custom",
        colSpan: 2,
        defaultValue: (o) => ({
          value: String(o?.payment_method?.id ?? ""),
          isEditable: Number(o?.order_status?.sequence_order ?? 1) === 0,
        }),
        formatValue: (v) =>
          typeof v === "object" && v !== null
            ? String(v.value)
            : String(v ?? ""),
        customRender: (valueObj, onChange) => {
          const { value, isEditable } =
            typeof valueObj === "object" && valueObj !== null
              ? valueObj
              : { value: String(valueObj ?? ""), isEditable: false };

          const safeValue = value || "";

          return (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#FF8F3F]" />
                <span>Método de pagamento</span>
              </Label>
              <Select
                value={safeValue}
                onValueChange={(newValue) =>
                  onChange({ value: newValue, isEditable })
                }
                disabled={!isEditable}
              >
                <SelectTrigger className="w-full focus-visible:ring-[#FF8F3F]">
                  <SelectValue placeholder="Selecione método" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((pm) => (
                    <SelectItem key={pm.id} value={String(pm.id)}>
                      {pm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        },
      },

      // Datas
      {
        name: "delivery_date",
        type: "custom",
        colSpan: 2,
        defaultValue: (o) => ({
          value: o?.delivery_date ?? "",
          isEditable: Number(o?.order_status?.sequence_order ?? 1) === 0,
        }),
        formatValue: (v) =>
          typeof v === "object" && v !== null ? v.value : v ?? "",
        customRender: (valueObj, onChange) => {
          const { value, isEditable } =
            typeof valueObj === "object" && valueObj !== null
              ? valueObj
              : { value: valueObj ?? "", isEditable: false };

          return (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-[#FF8F3F]" />
                <span>Data de entrega</span>
              </Label>
              <DatePicker
                disabled={!isEditable}
                value={value}
                onChange={(newValue) =>
                  onChange({ value: newValue, isEditable })
                }
                className="w-full focus-visible:ring-[#FF8F3F]"
              />
            </div>
          );
        },
      },

      {
        name: "due_date",
        type: "custom",
        colSpan: 2,
        defaultValue: (o) => ({
          value: o?.due_date ?? "",
          isEditable: false,
        }),
        formatValue: (v) =>
          typeof v === "object" && v !== null ? v.value : v ?? "",
        customRender: (valueObj, onChange) => {
          const { value, isEditable } =
            typeof valueObj === "object" && valueObj !== null
              ? valueObj
              : { value: valueObj ?? "", isEditable: false };

          return (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#FF8F3F]" />
                <span>Data de vencimento</span>
              </Label>
              <DatePicker
                disabled
                value={value}
                onChange={(newValue) =>
                  onChange({ value: newValue, isEditable })
                }
                className="w-full focus-visible:ring-[#FF8F3F]"
              />
            </div>
          );
        },
      },

      // Produtos
      {
        name: "products_separator",
        type: "custom",
        colSpan: 2,
        customRender: () => (
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-[#FF8F3F]" />
            <h3 className="text-base font-medium">Produtos</h3>
          </div>
        ),
      },

      {
        name: "products",
        type: "custom",
        colSpan: 2,

        // 1. PRIMEIRO: Ajuste o defaultValue do campo "products" para garantir que sale_price seja mapeado corretamente:

        defaultValue: (o) => {
          return {
            items: Array.isArray(o?.products)
              ? o.products.map((p: { product: { id: any }; quantity: any }) => ({
                  product_id: String(p?.product?.id ?? ""),
                  quantity: p?.quantity ?? 0,
                }))
              : [],
          };
        },

        // 2. Ajuste o formatValue para garantir que sale_price seja preservado:

        formatValue: (valueObj) => {
          if (
            valueObj &&
            typeof valueObj === "object" &&
            Array.isArray(valueObj.items)
          ) {
            return valueObj.items.filter(
              (item: { quantity: number }) => typeof item.quantity === "number"
            );
          }
          return [];
        },

        // 3. O customRender ajustado:

        customRender: (valueObj, onChange) => {
          // Aguardar dados válidos antes de renderizar
          const { items = [], isEditable } =
            typeof valueObj === "object" && valueObj !== null && valueObj.items
              ? valueObj
              : { items: [], isEditable: false };

          const handleProductChange = (newItems: any) => {
            onChange({ items: newItems, isEditable });
          };

          const formattedProducts = products.map((product) => ({
            id: String(product.id),
            name: product.name,
            price: product.price,
          }));

          const calculateTotal = () => {
            return items.reduce(
              (
                total: number,
                item: { product_id: string; quantity: number }
              ) => {
                const product = products.find(
                  (p) => String(p.id) === item.product_id
                );
                const price =
                  product && typeof product.price === "number"
                    ? product.price
                    : Number(product?.price as any) || 0;
                return total + price * (item.quantity || 0);
              },
              0
            );
          };

          return (
            <div className="space-y-4">
              <div>
                <ProductSelector
                  products={formattedProducts}
                  value={items}
                  onChange={handleProductChange}
                />
              </div>

              {items.length > 0 && (
                <Card className="bg-muted/40 border-muted">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Calculator className="h-4 w-4 text-[#FF8F3F]" />
                      <h3 className="text-sm font-medium">Resumo do Pedido</h3>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-medium text-lg text-[#FF8F3F]">
                        {formatCurrency(calculateTotal())}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          );
        },
      },
    ],
  };

  return drawerConfig;
}
