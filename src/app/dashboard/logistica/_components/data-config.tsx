"use client";
import type { ColumnDef } from "@tanstack/react-table";
import type { DrawerConfig } from "@/components/datatable";
import { Badge } from "@/components/ui/badge";
import {
  useOrderById,
  useOrderList,
  useOrderStatus,
  usePaymentMethods,
} from "@/hooks/useOrder";
import {
  badgesVariant,
  formatDateToBR,
  formatStatus,
  formatPaymentMethod,
  formatCEP,
  cleanCEP,
} from "@/lib/utils";
import {
  type OrderUpdateRequest,
  orderUpdateRequestSchema,
  type OrderResponse,
  ordersResponseSchema,
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
  MapPin,
} from "lucide-react";
import { ProductSelector } from "@/components/productSelector";

import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

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
      <Badge variant="outline">{row.original.payment_method.name}</Badge>
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
      const st = row.original.order_status ?? {};
      const { badge, stats } = badgesVariant({
        sequence_order: (st as any).sequence_order,
        category: (st as any).category,
        delivery_method: (st as any).delivery_method,
        description: (st as any).description,
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
          : Number.parseFloat(row.original.total_price as any) || 0;
      return `R$ ${n.toFixed(2)}`;
    },
  },
];

export function useDrawerConfig() {
  const { paymentMethods = [] } = usePaymentMethods();
  const { orderStatus: orderStatuses = [] } = useOrderStatus();
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
    
          {st && (
            <Badge variant={badge as any}>
              {stats}
            </Badge>
          )}
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
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="h-5 w-5 text-[#FF8F3F]" />
              <h3 className="text-base font-medium">Informações do Pedido</h3>
            </div>
            <Separator />
          </div>
        ),
      },

      // Status do pedido
      {
        name: "order_status_id",
        type: "custom",
        colSpan: 2,

        defaultValue: (o) => {
          return {
            value: String(o.order_status.id),
            isEditable: Number(o.order_status.identifier) === 0,
          };
        },
        formatValue: (v) =>
          typeof v === "object" && v !== null ? String(v.value) : String(v),
        customRender: (valueObj, onChange) => {
          // Extract value and editable state from the object
          const { value, isEditable } =
            typeof valueObj === "object" && valueObj !== null
              ? valueObj
              : { value: String(valueObj), isEditable: false };

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
              >
                <SelectTrigger className="w-full focus-visible:ring-[#FF8F3F]">
                  <SelectValue placeholder="Selecione status" />
                </SelectTrigger>
                <SelectContent>
                  {orderStatuses.map((st) => (
                    <SelectItem key={st.id} value={String(st.id)}>
                      {st.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        },
      },

      {
        name: "payment_method_id",
        type: "custom",
        colSpan: 2,
        defaultValue: (o) => ({
          value: String(o.payment_method.id),
          isEditable: Number(o.order_status.identifier) === 0,
        }),
        formatValue: (v) =>
          typeof v === "object" && v !== null ? String(v.value) : String(v),
        customRender: (valueObj, onChange) => {
          // Extract value and editable state from the object
          const { value, isEditable } =
            typeof valueObj === "object" && valueObj !== null
              ? valueObj
              : { value: String(valueObj), isEditable: false };

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
          value: o.delivery_date,
          isEditable: Number(o.order_status.identifier) === 0,
        }),
        formatValue: (v) => (typeof v === "object" && v !== null ? v.value : v),
        customRender: (valueObj, onChange) => {
          // Extract value and editable state from the object
          const { value, isEditable } =
            typeof valueObj === "object" && valueObj !== null
              ? valueObj
              : { value: valueObj, isEditable: false };

          return (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-[#FF8F3F]" />
                <span>Data de entrega</span>
              </Label>
              <DatePicker
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
          value: o.due_date,
          isEditable: Number(o.order_status.identifier) === 0,
        }),
        formatValue: (v) => (typeof v === "object" && v !== null ? v.value : v),
        customRender: (valueObj, onChange) => {
          // Extract value and editable state from the object
          const { value, isEditable } =
            typeof valueObj === "object" && valueObj !== null
              ? valueObj
              : { value: valueObj, isEditable: false };

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

        defaultValue: (o) => ({
          items: Array.isArray(o.products)
            ? o.products.map(
                (p: {
                  product: { id: any; price: any };
                  quantity: any;
                  sale_price: any;
                }) => ({
                  product_id: String(p.product.id),
                  quantity: p.quantity,
                  sale_price:
                    Number(p.sale_price) || Number(p.product.price) || 0, // ✅ Fallback para product.price
                  price: Number(p.product.price) || 0,
                })
              )
            : [],
          order_status: o.order_status,
          order_id: o.id, // Caso precise do ID também
        }),

        formatValue: (valueObj) => {
          if (
            valueObj &&
            typeof valueObj === "object" &&
            Array.isArray(valueObj.items)
          ) {
            return valueObj.items
              .filter(
                (item: { quantity: number }) =>
                  item.quantity > 0 || item.quantity === 0
              )
              .map((item: any) => ({
                ...item,
                sale_price: Number(item.sale_price) || 0, // ✅ Garantir que sale_price seja preservado
              }));
          }
          return [];
        },

        // 3. FINALMENTE: O customRender ajustado:

        customRender: (valueObj, onChange) => {
          const {
            items = [],
            order_status = null,
            order_id = null,
          } = typeof valueObj === "object" && valueObj !== null
            ? valueObj
            : { items: [], order_status: null, order_id: null };

          const handleProductChange = (newItems: any) => {
            // ✅ Preservar o order_status ao atualizar
            onChange({
              items: newItems,
              order_status,
              order_id,
            });
          };

          // ✅ Calcular total usando sale_price de cada item do pedido

          // ✅ CORREÇÃO: Formatar produtos base sem sale_price (que vem dos items)
          const formattedProducts = products.map((product) => ({
            id: String(product.id),
            name: product.name,
            price: Number(product.price) || 0,
            // ❌ Remover sale_price daqui, pois não existe no produto base
            // sale_price: Number(product.sale_price) || 0
          }));

          // ✅ Calcular total usando sale_price de cada item do pedido
          const calculateTotal = () => {
            if (!items.length) return 0;

            return items.reduce(
              (
                total: number,
                item: {
                  product_id: string;
                  quantity: number;
                  sale_price?: number;
                  price?: number;
                }
              ) => {
                // ✅ Usar o sale_price do item do pedido com fallbacks
                const itemSalePrice = Number(item.sale_price) || 0;
                const itemPrice = Number(item.price) || 0;

                // Fallback para preço do produto base se necessário
                const fallbackPrice =
                  products.find((p) => String(p.id) === item.product_id)
                    ?.price || 0;

                const finalPrice =
                  itemSalePrice || itemPrice || Number(fallbackPrice) || 0;

                return total + finalPrice * item.quantity;
              },
              0
            );
          };

          return (
            <div className="space-y-4">
              <div className="">
                <ProductSelector
                  onDisabled={() => {
                    // Sem necessidade de hook adicional!
                    return order_status ? order_status.identifier > 1 : false;
                  }}
                  products={formattedProducts}
                  value={items} // ✅ items já inclui sale_price do backend
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
                        R$ {calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          );
        },
      },
      {
        name: "address_separator",
        type: "custom",
        colSpan: 2,
        customRender: () => (
          <div className="col-span-2 pt-2">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-[#FF8F3F]" />
              <h3 className="text-base font-medium">Endereço de Cobrança</h3>
            </div>
            <Separator />
          </div>
        ),
      },

      // CEP: exibe formatado, envia limpo
      {
        name: "delivery_address.cep",
        type: "custom",
        colSpan: 2,
        defaultValue: (o) => formatCEP(o.delivery_address.cep),
        formatValue: (v) => formatCEP(v),
        parseValue: (v) => cleanCEP(v),
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#FF8F3F]" />
              <span>CEP</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="00000-000"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // Endereço completo em campos separados
      {
        name: "delivery_address.street_name",
        type: "custom",
        colSpan: 1,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span>Rua</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Nome da rua"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // Número e Bairro na mesma linha
      {
        name: "delivery_address.number",
        type: "custom",
        colSpan: 1,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span>Número</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Número"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },
      {
        name: "delivery_address.district",
        type: "custom",
        colSpan: 1,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span>Bairro</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Bairro"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // Cidade e Estado na mesma linha
      {
        name: "delivery_address.city",
        type: "custom",
        colSpan: 1,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span>Cidade</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Cidade"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },
      {
        name: "delivery_address.state",
        type: "custom",
        colSpan: 1,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span>Estado</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="UF"
              className="transition-all focus-visible:ring-[#FF8F3F]"
              maxLength={2}
            />
          </div>
        ),
      },
      {
        name: "delivery_address.description",
        type: "custom",
        colSpan: 1,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span>Descrição</span>
              <span className="text-destructive"></span>
            </Label>
            <Input
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Trabalho"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // Observação
      {
        name: "delivery_address.observation",
        type: "custom",
        colSpan: 2,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span>Observação</span>
            </Label>
            <Textarea
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Observações sobre o endereço"
              className="min-h-[80px] transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },
    ],
  };

  return drawerConfig;
}
