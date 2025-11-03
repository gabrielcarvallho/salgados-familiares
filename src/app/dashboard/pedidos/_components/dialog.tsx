"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

// Utils
import { formatCurrency } from "@/lib/utils";

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

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// Icons
import {
  CalendarIcon,
  CreditCard,
  Home,
  Loader2,
  Package,
  Plus,
  ShoppingCart,
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
import {
  EMPTY_ORDER,
  type OrderRequest,
  type BaseOrderRequest,
  orderRequestSchema,
  baseOrderRequestSchema,
} from "@/types/Order";
import { ProductSelector } from "../../../../components/productSelector";
import DatePicker from "@/components/ui/date-picker";

export function DialogPedidos() {
  const { products } = useProductList("all", 1, 100);
  const { paymentMethods, isLoading: isPaymentMethodsLoading } =
    usePaymentMethods();
  const { customers, isLoading: isCustomersLoading } = useCustomerList(1, 100);
  const {
    create,
    isLoading,
    error: orderError,
  } = useOrder();
  const { mutate } = useOrderList();

  const [open, setOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const form = useForm<BaseOrderRequest>({
    resolver: zodResolver(baseOrderRequestSchema),
    defaultValues: { ...EMPTY_ORDER, delivery_method: "RETIRADA" },
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
  const watchedPaymentmethod = watch("payment_method_id");

  // Sempre RETIRADA
  const watchedDeliveryMethod = "RETIRADA";

  const { orderStatus, isLoading: isOrderStatusLoading } = useOrderStatus(
    watchedDeliveryMethod
  );

  // Boleto
  const boleto = paymentMethods.find((pm) => pm.name === "Boleto bancário");
  const isBoletoBancario = boleto ? watchedPaymentmethod === boleto.id : false;

  useEffect(() => {
    if (!customers || customers.length === 0) return;

    if (watchedCustomerId) {
      const customer = customers.find((c) => c.id === watchedCustomerId);
      if (customer && customer.id !== selectedCustomer?.id) {
        setSelectedCustomer(customer);
      }
    } else if (selectedCustomer !== null) {
      setSelectedCustomer(null);
    }
  }, [
    watchedCustomerId,
    customers?.length,
    selectedCustomer,
  ]);

  // Resetar status quando refaz pedido
  useEffect(() => {
    setValue("order_status_id", "", { shouldValidate: false });
  }, [setValue]);

  // Definir o primeiro status automaticamente
  useEffect(() => {
    if (
      orderStatus &&
      orderStatus.length > 0 &&
      !getValues("order_status_id")
    ) {
      setValue("order_status_id", orderStatus[0].id, { shouldValidate: false });
    }
  }, [orderStatus, setValue, getValues]);

  const cleanProducts = () => {
    const current = getValues("products") || [];
    const filtered = current.filter(
      (item) => item.product_id !== undefined && item.quantity > 0
    );
    setValue("products", filtered);
  };

  const handleFormSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setFormSubmitted(true);

    cleanProducts();

    // Garantir status definido
    if (!getValues("order_status_id") && orderStatus?.length > 0) {
      setValue("order_status_id", orderStatus[0].id, { shouldValidate: false });
    }

    const formValid = await trigger();

    if (formValid) {
      handleSubmit(onSubmit)();
    } else {
      toast.error("Por favor, corrija os erros no formulário", {
        duration: 5000,
      });
    }
  };

  const onSubmit = async (formData: BaseOrderRequest) => {
    try {
      const customer = customers.find((c) => c.id === formData.customer_id);
      if (!customer) {
        toast.error("Cliente não encontrado");
        return;
      }

      const transformedData = orderRequestSchema.parse(formData);

      let payload = {
        ...transformedData,
        products: transformedData.products.filter((p) => p.product_id),
      };

      // Remove delivery_address_id pois não precisa para retirada
      const { delivery_address_id, ...payloadWithoutAddress } = payload;

      await create(payloadWithoutAddress);

      mutate();
      toast.success("Pedido cadastrado com sucesso!");
      setOpen(false);
      reset({ ...EMPTY_ORDER, delivery_method: "RETIRADA" });
      setSelectedCustomer(null);
    } catch (error) {
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

  const handleDialogClose = (isOpen: boolean) => {
    if (!isOpen) {
      reset({ ...EMPTY_ORDER, delivery_method: "RETIRADA" });
      setFormSubmitted(false);
      setSelectedCustomer(null);
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
                {/* Cliente */}
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
                                    {c.name}
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

                {/* Card do cliente */}
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
                    </CardContent>
                  </Card>
                )}

                <Separator />

                {/* Seleção de Produtos */}
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
                          products={products.filter((p) => p.is_active !== false)}
                          value={field.value || []}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                      {watchedProducts.length > 0 && (
                        <div className="mt-2 text-right font-medium">
                          Total:{" "}
                          <span className="text-[#FF8F3F]">
                            {formatCurrency(calculateTotal(watchedProducts))}
                          </span>
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Método de pagamento */}
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
                  {/* Data da retirada */}
                  <FormField
                    control={control}
                    name="delivery_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <CalendarIcon className="mr-2 h-4 w-4 text-[#FF8F3F]" />
                          Data da retirada*
                        </FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value || ""}
                            onChange={(date) => field.onChange(date)}
                            label={undefined}
                            placeholder="Selecione uma data"
                            required
                            locale={ptBR}
                            dateFormat="dd/MM/yyyy"
                            buttonClassName="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Boleto - vencimento */}
                  {isBoletoBancario && (
                    <FormField
                      control={control}
                      name="due_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <CalendarIcon className="mr-2 h-4 w-4 text-[#FF8F3F]" />
                            Data de vencimento*
                          </FormLabel>
                          <FormControl>
                            <DatePicker
                              value={field.value || ""}
                              onChange={(date) => field.onChange(date)}
                              label={undefined}
                              placeholder="Selecione uma data"
                              errorMessage={errors.due_date?.message}
                              locale={ptBR}
                              dateFormat="dd/MM/yyyy"
                              buttonClassName="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Erros */}
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
                        {errors.products && (
                          <li>• Produtos: {errors.products.message}</li>
                        )}
                        {errors.delivery_date && (
                          <li>
                            • Data da retirada: {errors.delivery_date.message}
                          </li>
                        )}
                        {errors.due_date && (
                          <li>
                            • Data de vencimento: {errors.due_date.message}
                          </li>
                        )}
                        {errors.payment_method_id && (
                          <li>
                            • Método de pagamento: {errors.payment_method_id.message}
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