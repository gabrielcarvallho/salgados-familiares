"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// Icons
import {
  CalendarIcon,
  CheckCircle2,
  CreditCard,
  Home,
  Loader2,
  MapPin,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  User,
} from "lucide-react";

// Hooks and utilities
import { useCustomerList } from "@/hooks/useCustomer";
import {
  useOrder,
  useOrderList,
  useOrderStatus,
  usePaymentMethods,
} from "@/hooks/useOrder";
import { useProductList } from "@/hooks/useProduct";
import { formatOrderStatus, formatPaymentMethod } from "@/lib/utils";
import {
  EMPTY_ORDER,
  type OrderRequest,
  orderRequestSchema,
} from "@/types/Order";
import { ProductSelector } from "../../../components/productSelector";
import DatePicker from "@/components/ui/date-picker";

// Custom Product Selection Component

export function DialogPedidos() {
  const { products } = useProductList();
  const { orderStatus, isLoading: isOrderStatusLoading } = useOrderStatus();
  const { paymentMethods, isLoading: isPaymentMethodsLoading } =
    usePaymentMethods();
  const { customers, isLoading: isCustomersLoading } = useCustomerList();
  const { create, isLoading, error: orderError } = useOrder();
  const { mutate } = useOrderList();

  const [open, setOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerAddresses, setCustomerAddresses] = useState<any[]>([]);

  const form = useForm<OrderRequest>({
    resolver: zodResolver(orderRequestSchema),
    defaultValues: EMPTY_ORDER,
    mode: "onChange",
  });

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    trigger,
    watch,
    reset,
    setValue,
    getValues,
  } = form;

  const watchedProducts = watch("products");
  const watchedCustomerId = watch("customer_id");

  useEffect(() => {
    if (watchedCustomerId) {
      const customer = customers.find((c) => c.id === watchedCustomerId);
      if (customer) {
        setSelectedCustomer(customer);
        const addresses = [];
        if (customer.billing_address) {
          addresses.push({
            ...customer.billing_address,
            description: customer.billing_address.description || "Padrão",
          });
        }
        setCustomerAddresses(addresses);
        if (customer.billing_address?.id) {
          setValue("delivery_address_id", customer.billing_address.id);
        }
      }
    } else {
      setSelectedCustomer(null);
      setCustomerAddresses([]);
    }
  }, [watchedCustomerId, customers, setValue]);

  // Remove any empty products before validating
  const cleanProducts = () => {
    const current = getValues("products") || [];
    const filtered = current.filter(
      (item) => item.product_id !== undefined && item.quantity > 0
    );
    setValue("products", filtered);
  };

  // Adicionar isto no início da função DialogPedidos, logo após obter os orderStatus

// Modificação 1: Ajustar useEffect para definir o order_status_id quando orderStatus estiver disponível
useEffect(() => {
  if (orderStatus && orderStatus.length > 0) {
    setValue("order_status_id", orderStatus[0].id);
  }
}, [orderStatus, setValue]);

// Modificação 2: Ajustar a função handleFormSubmit
const handleFormSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setFormSubmitted(true);

  // clean out junk entries
  cleanProducts();
  
  // Garantir que order_status_id está definido
  if (orderStatus && orderStatus.length > 0 && !getValues("order_status_id")) {
    setValue("order_status_id", orderStatus[0].id);
  }

  console.log("Validando formulário, valores atuais:", getValues());
  const formValid = await trigger();
  console.log("Resultado da validação, erros:", errors);

  if (formValid) {
    handleSubmit(onSubmit)();
  } else {
    toast.error("Por favor, corrija os erros no formulário", {
      duration: 5000,
    });
  }
};

// Modificação 3: Simplificar o onSubmit, já que order_status_id estará definido
const onSubmit = async (formData: OrderRequest) => {
  try {
    const customer = customers.find((c) => c.id === formData.customer_id);
    if (!customer) {
      toast.error("Cliente não encontrado");
      return;
    }
    const delivery_address_id =
      formData.delivery_address_id || customer.billing_address?.id || null;
    if (!delivery_address_id) {
      toast.error("Endereço de entrega não encontrado");
      return;
    }
    
    // ensure no empty products
    const payload = {
      ...formData,
      products: formData.products.filter((p) => p.product_id),
      delivery_address_id
      // order_status_id já está definido corretamente no formData
    };
    
    console.log("Payload enviado:", payload);
    await create(payload);
    mutate();
    toast.success("Pedido cadastrado com sucesso!");
    setOpen(false);
    reset(EMPTY_ORDER);
    setSelectedCustomer(null);
    setCustomerAddresses([]);
  } catch (error: any) {
    toast.error("Falha ao cadastrar pedido!", {
      description: orderError || String(error),
      duration: 3000,
    });
  }
};

  const calculateTotal = (items: any[]) =>
    items.reduce((total, item) => {
      const product = products.find((p) => p.id === item.product_id);
      const price = product ? Number(product.price) || 0 : 0;
      return total + price * item.quantity;
    }, 0);

  const formatAddress = (address: any) =>
    address
      ? `${address.street_name}, ${address.number}, ${address.city} - ${address.state}`
      : "";

  const handleDialogClose = (isOpen: boolean) => {
    if (!isOpen) {
      reset(EMPTY_ORDER);
      setFormSubmitted(false);
      setSelectedCustomer(null);
      setCustomerAddresses([]);
    }
    setOpen(isOpen);
  };
  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-[#FF8F3F] text-white">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar pedido
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5 text-[#FF8F3F]" />
            Adicionar Pedido
          </DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para realizar um pedido novo
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="p-6 pt-2">
            <Form {...form}>
              <form onSubmit={handleFormSubmit} className="space-y-5">
                {/* Customer Selection */}
                <FormField
                  control={control}
                  name="customer_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-base">
                        <User className="mr-2 h-4 w-4 text-[#FF8F3F]" />
                        Cliente*
                      </FormLabel>
                      <FormControl>
                        {isCustomersLoading ? (
                          <div className="flex items-center justify-center h-10 border rounded-md">
                            <Loader2 className="animate-spin h-4 w-4" />
                          </div>
                        ) : (
                          <Select
                            value={field.value ? String(field.value) : ""}
                            onValueChange={(val) => field.onChange(val)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione o cliente..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Clientes registrados:</SelectLabel>
                                {customers.map((c) => (
                                  <SelectItem key={c.id} value={String(c.id)}>
                                    {c.company_name}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address Selection - Only show when customer is selected */}
                {selectedCustomer && (
                  <FormField
                    control={control}
                    name="delivery_address_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4 text-[#FF8F3F]" />
                          Endereço de entrega*
                        </FormLabel>
                        <FormControl>
                          <Select
                            value={field.value ? String(field.value) : ""}
                            onValueChange={(val) => field.onChange(val)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione o endereço..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>
                                  Endereços disponíveis:
                                </SelectLabel>
                                {customerAddresses.map((address) => (
                                  <SelectItem
                                    key={address.id}
                                    value={String(address.id)}
                                  >
                                    {address.description} -{" "}
                                    {formatAddress(address)}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Customer Info Card - Show when customer is selected */}
                {selectedCustomer && (
                  <Card className="bg-muted/40 border-muted">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">
                            {selectedCustomer.company_name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {selectedCustomer.email}
                          </p>
                        </div>
                      </div>

                      {selectedCustomer.contact && (
                        <div className="mt-2 text-sm">
                          <p className="text-muted-foreground">Contato:</p>
                          <p>
                            {selectedCustomer.contact.name} -{" "}
                            {selectedCustomer.contact.contact_phone}
                          </p>
                        </div>
                      )}

                      {selectedCustomer.billing_address && (
                        <div className="mt-2 text-sm flex items-start">
                          <Home className="mr-2 h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-muted-foreground">
                              {selectedCustomer.billing_address.description ||
                                "Endereço Padrão"}
                              :
                            </p>
                            <p>
                              {selectedCustomer.billing_address.street_name},{" "}
                              {selectedCustomer.billing_address.number}
                              {selectedCustomer.billing_address.complement &&
                                `, ${selectedCustomer.billing_address.complement}`}
                            </p>
                            <p>
                              {selectedCustomer.billing_address.district},{" "}
                              {selectedCustomer.billing_address.city} -{" "}
                              {selectedCustomer.billing_address.state},{" "}
                              {selectedCustomer.billing_address.cep}
                            </p>
                            {selectedCustomer.billing_address.observation && (
                              <p className="text-muted-foreground italic">
                                Obs:{" "}
                                {selectedCustomer.billing_address.observation}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Separator />

                {/* Products Selection - Custom Component */}
                <FormField
                  control={control}
                  name="products"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-base">
                        <Package className="mr-2 h-4 w-4 text-[#FF8F3F]" />
                        Produtos*
                      </FormLabel>
                      <FormControl>
                        <ProductSelector
                          products={products}
                          value={field.value || []}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                      {watchedProducts.length > 0 && (
                        <div className="mt-2 text-right font-medium">
                          Total:{" "}
                          <span className="text-[#FF8F3F]">
                            R$ {calculateTotal(watchedProducts).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Payment Method */}
                  <FormField
                    control={control}
                    name="payment_method_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <CreditCard className="mr-2 h-4 w-4 text-[#FF8F3F]" />
                          Método de pagamento*
                        </FormLabel>
                        <FormControl>
                          {isPaymentMethodsLoading ? (
                            <div className="flex items-center justify-center h-10 border rounded-md">
                              <Loader2 className="animate-spin h-4 w-4" />
                            </div>
                          ) : (
                            <Select
                              value={field.value ? String(field.value) : ""}
                              onValueChange={(val) => field.onChange(val)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione o método..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>
                                    Métodos disponíveis:
                                  </SelectLabel>
                                  {paymentMethods.map((m) => (
                                    <SelectItem key={m.id} value={String(m.id)}>
                                      {m.name}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Delivery Date - Fixed */}
                  <FormField
                    control={control}
                    name="delivery_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <CalendarIcon className="mr-2 h-4 w-4 text-[#FF8F3F]" />
                          Data de entrega*
                        </FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value || ""}
                            onChange={(date) => field.onChange(date)}
                            label={undefined}
                            placeholder="Selecione uma data"
                            required
                            errorMessage={errors.delivery_date?.message}
                            locale={ptBR}
                            dateFormat="dd/MM/yyyy"
                            buttonClassName="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Order Status */}
                  {/* <FormField
                    control={control}
                    name="order_status_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <CheckCircle2 className="mr-2 h-4 w-4 text-[#FF8F3F]" />
                          Status do pedido*
                        </FormLabel>
                        <FormControl>
                          {isOrderStatusLoading ? (
                            <div className="flex items-center justify-center h-10 border rounded-md">
                              <Loader2 className="animate-spin h-4 w-4" />
                            </div>
                          ) : (
                            <Select
                              value={field.value ? String(field.value) : ""}
                              onValueChange={(val) => field.onChange(val)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o status..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>Status disponíveis:</SelectLabel>
                                  {orderStatus.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)}>
                                      {formatOrderStatus(s.description)}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}
                </div>

                {/* Error Summary */}
                {formSubmitted && Object.keys(errors).length > 0 && (
                  <Card className="border-destructive/50 bg-destructive/5">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-destructive mb-2 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        Por favor, corrija os seguintes erros:
                      </h4>
                      <ul className="space-y-1 text-sm text-destructive">
                        {errors.customer_id && (
                          <li>• Cliente: {errors.customer_id.message}</li>
                        )}
                        {errors.delivery_address_id && (
                          <li>
                            • Endereço de entrega:{" "}
                            {errors.delivery_address_id.message}
                          </li>
                        )}
                        {errors.products && (
                          <li>• Produtos: {errors.products.message}</li>
                        )}
                        {errors.delivery_date && (
                          <li>
                            • Data de entrega: {errors.delivery_date.message}
                          </li>
                        )}
                        {errors.payment_method_id && (
                          <li>
                            • Método de pagamento:{" "}
                            {errors.payment_method_id.message}
                          </li>
                        )}
                        {errors.order_status_id && (
                          <li>
                            • Status do pedido: {errors.order_status_id.message}
                          </li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </form>
            </Form>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-0">
          <div className="flex w-full justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDialogClose(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant={"outline"}
              onClick={handleFormSubmit}
              className="bg-[#FF8F3F] text-white"
              disabled={isSubmitting || isLoading}
            >
              {isLoading || isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                <>Cadastrar pedido</>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
