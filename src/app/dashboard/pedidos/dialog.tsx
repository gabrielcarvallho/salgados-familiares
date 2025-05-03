"use client";
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
import { Input } from "@/components/ui/input";
import { Loader2, Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

import { useCustomer, useCustomerList } from "@/hooks/useCostumer";
import { useState } from "react";
import {
  convertDateFormat,
  dateValidator,
  formatDateInput,
  formatOrderStatus,
  formatPaymentMethod,
  isValidDate,
} from "@/lib/utils";
import { EMPTY_ORDER, OrderRequest, orderRequestSchema } from "@/types/Order";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrder, useOrderList, useOrderStatus, usePaymentMethods } from "@/hooks/useOrder";
import { MultiSelect } from "./multiselect";
import { SelectedItem } from "@/types/Product";
import { useProductList } from "@/hooks/useProduct";

export function DialogPedidos() {
  const { products } = useProductList();
  const { orderStatus, isLoading: isOrderStatusLoading } = useOrderStatus();
  const { paymentMethods, isLoading: isPaymentMethodsLoading } =
    usePaymentMethods();
  const { customers, isLoading: isCustomersLoading } = useCustomerList();
  const { create, isLoading, error: orderError } = useOrder();
  const [open, setOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const { mutate } = useOrderList()

  const form = useForm<OrderRequest>({
    resolver: zodResolver(orderRequestSchema),
    defaultValues: EMPTY_ORDER,
    mode: "onSubmit",
  });

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    trigger,
  } = form;

  // Exibir todos os erros no console ao submeter o formulário
  if (formSubmitted && Object.keys(errors).length > 0) {
    console.log(
      "Todos os erros do formulário:",
      JSON.stringify(errors, null, 2)
    );
  }

  // Função de validação e submissão
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  
    console.log("Tentando validar o formulário...");
    console.log("DADOS DO FORMULÁRIO ANTES DA VALIDAÇÃO:", {
      completeFormData: form.getValues(),
      cliente: form.getValues().customer_id,
      produtos: form.getValues().products,
      metodoPagamento: form.getValues().payment_method_id,
      dataEntrega: {
        valor: form.getValues().delivery_date,
        formatoUsuario: form.getValues().delivery_date, // Mantém formato DD/MM/YYYY para validação
        ehValido: dateValidator(form.getValues().delivery_date) // Usa a função do schema
      },
      statusPedido: form.getValues().order_status_id
    });
  
    const formValid = await trigger();
    console.log("O formulário é válido?", formValid);
    
    if (formValid) {
      console.log("Formulário válido. Chamando onSubmit...");
      handleSubmit(onSubmit)();
    } else {
      console.log("ERROS DO FORMULÁRIO:", errors);
      toast.error("Por favor, corrija os erros no formulário", {
        duration: 5000,
      });
    }
  };
  
  const onSubmit = async (formData: OrderRequest) => {
    try {
      console.log("Iniciando submissão do formulário com dados:", formData);
      
      // Verificar se cliente existe
      const customer = customers.find((c) => c.id === formData.customer_id);
      if (!customer) {
        console.error("Cliente não encontrado:", formData.customer_id);
        toast.error("Cliente não encontrado");
        return;
      }
  
      // Verificar se o cliente tem billing_address antes de acessar
      if (!customer.billing_address || !customer.billing_address.id) {
        console.error("Endereço de cobrança não encontrado para o cliente:", customer);
        toast.error("Endereço de cobrança não encontrado para este cliente");
        return;
      }
  
      const billing_address_id = customer.billing_address.id;
      console.log("Endereço de cobrança encontrado:", billing_address_id);
  
      // Conversão da data para o formato esperado pela API (YYYY-MM-DD)
      const formattedDate = convertDateFormat(formData.delivery_date);
      console.log("Data convertida:", {
        original: formData.delivery_date,
        convertida: formattedDate
      });
  
      const payload = {
        ...formData,
        delivery_address_id: billing_address_id,
        delivery_date: formattedDate, // Data convertida para YYYY-MM-DD
      };
  
      console.log("Payload completo para envio ao servidor:", JSON.stringify(payload, null, 2));
  
      await create(payload);
      mutate()
      console.log("Pedido cadastrado com sucesso!");
      toast.success("Pedido cadastrado com sucesso!");
      setOpen(false); // Fechar o dialog após sucesso
      form.reset(EMPTY_ORDER); // Limpar o formulário após sucesso
    } catch (error: any) {
      console.error("Erro ao cadastrar pedido:", error);
      toast.error("Falha ao cadastrar pedido!", {
        description: orderError || String(error),
        duration: 3000,
      });
    }
  };

  // Função auxiliar para calcular o total
  const calculateTotal = (items: any) => {
    return items.reduce((total: any, item: any) => {
      const product = products.find((p) => p.id === item.product_id);
      return total + (product?.price || 0) * item.quantity;
    }, 0);
  };

  // Helper function to render error messages safely
  const renderErrorMessage = (error: any) => {
    if (!error) return null;
    return typeof error.message === 'string' ? error.message : 'Campo obrigatório';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-[#FF8F3F] text-primary-foreground"
          onClick={() => setOpen(true)}
        >
          <Plus />
          Adicionar pedido
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Adicionar Pedido</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para realizar um pedido novo
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
            <FormField
              control={control}
              name="customer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente*</FormLabel>
                  <FormControl>
                    {isCustomersLoading ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      <Select
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(val) => field.onChange(val)}
                      >
                        <SelectTrigger className="w-full rounded border px-3 py-2">
                          <SelectValue placeholder={"Selecione o cliente..."} />
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
                  <FormMessage>
                    {renderErrorMessage(errors.customer_id)}
                  </FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="products"
              render={({ field }) => {
                // Função para converter os valores da API para o formato do MultiSelect
                const convertApiToMultiSelect = () => {
                  if (!field.value) return [];

                  // Mapeia cada item e filtra os nulls
                  const validItems = field.value
                    .map((item) => {
                      const product = products.find(
                        (p) => p.id === item.product_id
                      );
                      if (!product) return null;

                      return {
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        quantity: item.quantity,
                      };
                    })
                    // type guard explícito: só seleciona os não-nulos
                    .filter((x): x is SelectedItem => x != null);

                  return validItems;
                };

                return (
                  <FormItem>
                    <FormLabel>Produtos*</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <MultiSelect
                          options={products}
                          onValueChange={(selectedItems) => {
                            const formattedProducts = selectedItems.map(
                              (item) => ({
                                product_id: item.id,
                                quantity: item.quantity,
                              })
                            );
                            field.onChange(formattedProducts);
                          }}
                          defaultValue={convertApiToMultiSelect()}
                          placeholder="Selecione os produtos"
                        />

                        {field.value && field.value.length > 0 && (
                          <div className="text-sm text-right font-medium">
                            Total: R$ {calculateTotal(field.value).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage>
                      {renderErrorMessage(errors.products)}
                    </FormMessage>
                  </FormItem>
                );
              }}
            />
            <FormField
              control={control}
              name="payment_method_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de pagamento*</FormLabel>
                  <FormControl>
                    {isPaymentMethodsLoading ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      <Select
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(val) => field.onChange(val)}
                      >
                        <SelectTrigger className="w-full rounded border px-3 py-2">
                          <SelectValue
                            placeholder={"Selecione o método de pagamento..."}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>
                              Métodos de pagamento disponíveis:
                            </SelectLabel>
                            {paymentMethods.map((m) => (
                              <SelectItem key={m.id} value={String(m.id)}>
                                {formatPaymentMethod(m.name)}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  </FormControl>
                  <FormMessage>
                    {renderErrorMessage(errors.payment_method_id)}
                  </FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="delivery_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de entrega*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="DD/MM/AAAA"
                      value={formatDateInput(field.value || "")}
                      onChange={(e) => {
                        // Atualiza o valor formatado para display (DD/MM/YYYY)
                        const formattedInput = formatDateInput(e.target.value);
                        field.onChange(formattedInput);
                      }}
                      onBlur={(e) => {
                        // Ao perder o foco, validamos se a data está completa
                        field.onBlur();
                        const currentValue = field.value;

                        // Verifica se temos uma data completa
                        if (currentValue && currentValue.length >= 8) {
                          if (!isValidDate(currentValue)) {
                            // Se a data for inválida, podemos notificar o usuário
                            toast.error(
                              "Data inválida. Use o formato DD/MM/AAAA",
                              {
                                duration: 3000,
                              }
                            );
                          }
                        }
                      }}
                      maxLength={10} // Limita a entrada para DD/MM/YYYY (10 caracteres)
                    />
                  </FormControl>
                  <FormMessage>
                    {renderErrorMessage(errors.delivery_date)}
                  </FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="order_status_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status do pedido*</FormLabel>
                  <FormControl>
                    {isOrderStatusLoading ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      <Select
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(val) => field.onChange(val)}
                      >
                        <SelectTrigger className="w-full rounded border px-3 py-2">
                          <SelectValue placeholder={"Selecione o status..."} />
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
                  <FormMessage>
                    {renderErrorMessage(errors.order_status_id)}
                  </FormMessage>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setFormSubmitted(false);
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="outline"
                className="bg-[#FF8F3F] text-primary-foreground"
                disabled={isSubmitting || isLoading}
              >
                {isLoading || isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  "Cadastrar pedido"
                )}
              </Button>
            </DialogFooter>
            {formSubmitted && Object.keys(errors).length > 0 && (
              <div className="text-red-500 text-sm p-2 border border-red-300 rounded bg-red-50">
                <p className="font-medium mb-1">
                  Por favor, corrija os seguintes erros:
                </p>
                <ul className="list-disc pl-5">
                  {errors.customer_id && (
                    <li>Cliente: {renderErrorMessage(errors.customer_id)}</li>
                  )}
                  {errors.products && (
                    <li>Produtos: {renderErrorMessage(errors.products)}</li>
                  )}
                  {errors.delivery_date && (
                    <li>Data de entrega: {renderErrorMessage(errors.delivery_date)}</li>
                  )}
                  {errors.payment_method_id && (
                    <li>
                      Método de pagamento: {renderErrorMessage(errors.payment_method_id)}
                    </li>
                  )}
                  {errors.order_status_id && (
                    <li>Status do pedido: {renderErrorMessage(errors.order_status_id)}</li>
                  )}
                </ul>
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}