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
  formatCEP,
  formatCurrency,
  cleanCEP,
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
  MapPin,
  Briefcase,
  Building2,
  Hash,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { ProductSelector } from "@/components/productSelector";
import { Textarea } from "@/components/ui/textarea";
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
          // 🔍 LOGS DE DIAGNÓSTICO - Análise dos produtos no pedido
          console.log('🔍 [PRODUTOS-DRAWER] Analisando pedido:', {
            orderId: o?.id,
            orderNumber: o?.order_number,
            hasProducts: !!o?.products,
            productsType: typeof o?.products,
            productsLength: Array.isArray(o?.products) ? o?.products.length : 'N/A',
            productsRaw: o?.products
          });

          if (!o?.products) {
            console.warn('🚨 [PRODUTOS-DRAWER] Pedido sem propriedade products:', {
              orderId: o?.id,
              orderNumber: o?.order_number,
              fullOrder: o
            });
          } else if (!Array.isArray(o.products)) {
            console.warn('🚨 [PRODUTOS-DRAWER] Products não é array:', {
              orderId: o?.id,
              orderNumber: o?.order_number,
              productsType: typeof o.products,
              products: o.products
            });
          } else if (o.products.length === 0) {
            console.warn('🚨 [PRODUTOS-DRAWER] Array de products vazio:', {
              orderId: o?.id,
              orderNumber: o?.order_number,
              products: o.products
            });
          } else {
            // Verificar cada produto individualmente
            o.products.forEach((p: any, index: number) => {
              if (!p) {
                console.error('🚨 [PRODUTOS-DRAWER] Item de produto null/undefined:', {
                  orderId: o?.id,
                  orderNumber: o?.order_number,
                  itemIndex: index,
                  item: p
                });
              } else if (!p.product) {
                console.error('🚨 [PRODUTOS-DRAWER] Item sem propriedade product:', {
                  orderId: o?.id,
                  orderNumber: o?.order_number,
                  itemIndex: index,
                  item: p,
                  productProperty: p.product
                });
              } else if (!p.product.id) {
                console.error('🚨 [PRODUTOS-DRAWER] Produto sem ID:', {
                  orderId: o?.id,
                  orderNumber: o?.order_number,
                  itemIndex: index,
                  product: p.product,
                  productId: p.product.id
                });
              } else {
                console.log('✅ [PRODUTOS-DRAWER] Item válido:', {
                  orderId: o?.id,
                  orderNumber: o?.order_number,
                  itemIndex: index,
                  productId: p.product.id,
                  productName: p.product.name,
                  quantity: p.quantity
                });
              }
            });
          }

          return {
            items: Array.isArray(o?.products)
              ? o.products.map((p: { product: { id: any }; quantity: any }) => ({
                  product_id: String(p?.product?.id ?? ""),
                  quantity: p?.quantity ?? 0,
                }))
              : [],
          };
        },

        // 2. DEPOIS: Ajuste o formatValue para garantir que sale_price seja preservado:

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

        // 3. FINALMENTE: O customRender ajustado:

        customRender: (valueObj, onChange) => {
          // 🔍 DIAGNÓSTICO: O que está chegando no customRender?
          console.log('🔍 [CUSTOM-RENDER] Valor recebido:', {
            valueObj,
            valueObjType: typeof valueObj,
            isNull: valueObj === null,
            isUndefined: valueObj === undefined,
            hasItems: valueObj?.items,
            itemsLength: Array.isArray(valueObj?.items) ? valueObj.items.length : 'N/A'
          });

          const { items = [], isEditable } =
            typeof valueObj === "object" && valueObj !== null
              ? valueObj
              : { items: [], isEditable: false };

          // 🔍 DIAGNÓSTICO: O que foi extraído?
          console.log('🔍 [CUSTOM-RENDER] Dados extraídos:', {
            items,
            itemsLength: Array.isArray(items) ? items.length : 'N/A',
            isEditable
          });

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

          // 🔍 DIAGNÓSTICO: O que está sendo passado para o ProductSelector?
          console.log('🔍 [PRODUCT-SELECTOR] Props:', {
            formattedProductsLength: formattedProducts.length,
            itemsLength: items.length,
            items: items,
            formattedProducts: formattedProducts.slice(0, 3) // Primeiros 3 para não poluir
          });

          return (
            <div className="space-y-4">
              <div>
                <ProductSelector
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

      // Endereço de Cobrança
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

      {
        name: "delivery_address.cep",
        type: "custom",
        colSpan: 2,
        defaultValue: (o) => formatCEP(o?.delivery_address?.cep ?? ""),
        formatValue: (v) => formatCEP(v ?? ""),
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#FF8F3F]" />
              <span>CEP</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="00000-000"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      {
        name: "delivery_address.street_name",
        type: "custom",
        colSpan: 1,
        defaultValue: (o) => o?.delivery_address?.street_name ?? "",
        formatValue: (v) => String(v ?? ""),
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span>Rua</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Nome da rua"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      {
        name: "delivery_address.number",
        type: "custom",
        colSpan: 1,
        defaultValue: (o) => o?.delivery_address?.number ?? "",
        formatValue: (v) => String(v ?? ""),
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span>Número</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={value ?? ""}
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
        defaultValue: (o) => o?.delivery_address?.district ?? "",
        formatValue: (v) => String(v ?? ""),
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span>Bairro</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Bairro"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      {
        name: "delivery_address.city",
        type: "custom",
        colSpan: 1,
        defaultValue: (o) => o?.delivery_address?.city ?? "",
        formatValue: (v) => String(v ?? ""),
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span>Cidade</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={value ?? ""}
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
        defaultValue: (o) => o?.delivery_address?.state ?? "",
        formatValue: (v) => String(v ?? ""),
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span>Estado</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={value ?? ""}
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
        defaultValue: (o) => o?.delivery_address?.description ?? "",
        formatValue: (v) => String(v ?? ""),
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span>Descrição</span>
            </Label>
            <Input
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Trabalho / Casa"
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
        defaultValue: (o) => o?.delivery_address?.observation ?? "",
        formatValue: (v) => String(v ?? ""),
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
