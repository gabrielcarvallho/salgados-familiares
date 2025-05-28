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
  formatPaymentMethod,
  formatCEP,
  cleanCEP,
  cleanCNPJ,
  cleanPhone,
  formatCNPJ,
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
  Calendar,
  FileText,
  Hash,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { ProductSelector } from "@/components/productSelector";
import {
  ReactElement,
  JSXElementConstructor,
  ReactNode,
  ReactPortal,
  Key,
} from "react";
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
    cell: ({ row }) => row.original.customer.company_name,
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
          : Number.parseFloat(row.original.total_price as any) || 0;
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
    title: (o) => (
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-5 w-5 text-[#FF8F3F]" />
        <span>Pedido #{o.order_number}</span>
      </div>
    ),
    description: (o) => (
      <div className="flex items-start gap-2 flex-col justify-center mt-2">
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Cliente: {o.customer.company_name}
          </span>
        </div>
        {o.order_status && (
          <Badge variant={badgesVariant(o.order_status.identifier).badge}>
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
          <div className="col-span-2 ">
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
                disabled
              >
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

        // 1) estado interno do form: { items: [], isEditable: boolean }
        defaultValue: (o) => ({
          items: Array.isArray(o.products)
            ? o.products.map((p: { product: { id: any }; quantity: any }) => ({
                product_id: String(p.product.id),
                quantity: p.quantity,
              }))
            : [],
          isEditable: Number(o.order_status.identifier) === 0,
        }),

        // 2) antes de validar, extraímos só o array
        formatValue: (valueObj) => {
          if (
            valueObj &&
            typeof valueObj === "object" &&
            Array.isArray(valueObj.items)
          ) {
            return valueObj.items;
          }
          return [];
        },

        // 3) UI: continua recebendo { items, isEditable }
        customRender: (valueObj, onChange) => {
          const { items = [], isEditable } =
            typeof valueObj === "object" && valueObj !== null
              ? valueObj
              : { items: [], isEditable: false };



          // Função para atualizar os itens quando o ProductSelector mudar
          const handleProductChange = (newItems: any) => {
            onChange({ items: newItems, isEditable });
          };

          // Preparar os produtos para o ProductSelector
          const formattedProducts = products.map((product) => ({
            id: String(product.id),
            name: product.name,
            price: product.price,
          }));

          // Calcular o total do pedido
          const calculateTotal = () => {
            if (!items.length) return 0;

            return items.reduce(
              (
                total: number,
                item: { product_id: string; quantity: number }
              ) => {
                const product = products.find(
                  (p) => String(p.id) === item.product_id
                );
                if (!product) return total;

                const price =
                  typeof product.price === "number"
                    ? product.price
                    : Number.parseFloat(String(product.price)) || 0;

                return total + price * item.quantity;
              },
              0
            );
          };

          // Se for editável, mostrar o ProductSelector
          if (isEditable) {
            return (
              <div className="space-y-4">
                <div className="">
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
                        <h3 className="text-sm font-medium">
                          Resumo do Pedido
                        </h3>
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
          }

          // Se não for editável, mostrar a tabela de produtos
          return (
            <div className="space-y-4">
              <Card className="bg-muted/30 border-muted">
                <CardContent className="p-4">
                  <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground mb-3">
                    <div className="col-span-6">Produto</div>
                    <div className="col-span-3 text-center">Quantidade</div>
                    <div className="col-span-3 text-right">Subtotal</div>
                  </div>

                  {items.length > 0 ? (
                    <>
                      {items.map(
                        (
                          item: { product_id: string; quantity: number },
                          idx: Key | null | undefined
                        ) => {
                          const product = products.find(
                            (p) => String(p.id) === item.product_id
                          );
                          if (!product) return null;

                          const price =
                            typeof product.price === "number"
                              ? product.price
                              : Number.parseFloat(String(product.price)) || 0;

                          const subtotal = price * item.quantity;

                          return (
                            <div
                              key={idx}
                              className="grid grid-cols-12 gap-2 items-center py-2 last:border-0"
                            >
                              <div className="col-span-6 font-medium">
                                {product.name}
                              </div>
                              <div className="col-span-3 text-center">
                                {item.quantity}
                              </div>
                              <div className="col-span-3 text-right">
                                R$ {subtotal.toFixed(2)}
                              </div>
                            </div>
                          );
                        }
                      )}

                      <div className="flex justify-between items-center mt-4 pt-2 border-t border-muted">
                        <span className="font-medium">Total:</span>
                        <span className="font-medium text-lg text-[#FF8F3F]">
                          R$ {calculateTotal().toFixed(2)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Nenhum produto encontrado
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        },
      },
      {
        name: "company_name",
        type: "custom",
        colSpan: 2,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#FF8F3F]" />
              <span>Razão Social</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="transition-all focus-visible:ring-[#FF8F3F]"
              placeholder="Razão Social da empresa"
            />
          </div>
        ),
      },
      {
        name: "brand_name",
        type: "custom",
        colSpan: 2,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-[#FF8F3F]" />
              <span>Nome Fantasia</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="transition-all focus-visible:ring-[#FF8F3F]"
              placeholder="Nome Fantasia da empresa"
            />
          </div>
        ),
      },

      // CNPJ: exibe formatado, mas envia limpo
      {
        name: "customer.cnpj",
        type: "custom",
        colSpan: 2,
        defaultValue: (o) => formatCNPJ(o.customer.cnpj),
        formatValue: (v) => formatCNPJ(v),
        parseValue: (v) => cleanCNPJ(v),
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-[#FF8F3F]" />
              <span>CNPJ</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="00.000.000/0000-00"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // Inscrição Estadual
      {
        name: "customer.state_tax_registration",
        type: "custom",
        colSpan: 2,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#FF8F3F]" />
              <span>Inscrição Estadual</span>
            </Label>
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Inscrição Estadual"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // E-mail
      {
        name: "customer.email",
        type: "custom",
        colSpan: 2,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#FF8F3F]" />
              <span>E-mail</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="email@empresa.com"
              className="transition-all focus-visible:ring-[#FF8F3F]"
              type="email"
            />
          </div>
        ),
      },

      // Separador para Informações de Contato
      {
        name: "contact_separator",
        type: "custom",
        colSpan: 2,
        customRender: () => (
          <div className="col-span-2 pt-2">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-5 w-5 text-[#FF8F3F]" />
              <h3 className="text-base font-medium">Informações de Contato</h3>
            </div>
            <Separator />
          </div>
        ),
      },

      // Nome para Contato
      {
        name: "customer.contact.name",
        type: "custom",
        colSpan: 2,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4 text-[#FF8F3F]" />
              <span>Nome para Contato</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Nome da pessoa de contato"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // Data de Nascimento: display BR, send ISO
      {
        name: "customer.contact.date_of_birth",
        type: "custom",
        colSpan: 2,
        defaultValue: (o) => o.customer.contact.date_of_birth,
        formatValue: (v) => v,
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#FF8F3F]" />
              <span>Data de Nascimento</span>
            </Label>
            <DatePicker
              value={value}
              onChange={onChange}
              className="w-full transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // Telefone: exibe formatado, envia limpo
      {
        name: "customer.contact.contact_phone",
        type: "custom",
        colSpan: 2,
        defaultValue: (o) => formatPhone(o.customer.contact.contact_phone),
        formatValue: (v) => formatPhone(v),
        parseValue: (v) => cleanPhone(v),
        customRender: (value: string, onChange: (v: string) => void) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#FF8F3F]" />
              <span>Telefone para Contato</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="(00) 00000-0000"
              className="transition-all focus-visible:ring-[#FF8F3F]"
            />
          </div>
        ),
      },

      // Separador para Endereço
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
              value={value}
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
              value={value}
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
