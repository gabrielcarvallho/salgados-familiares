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
  formatDateInput,
  formatOrderStatus,
  formatPaymentMethod,
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
import { useOrder, useOrderStatus, usePaymentMethods } from "@/hooks/useOrder";
import { MultiSelect } from "./multiselect";
import { SelectedItem } from "@/types/Product";
import { useProductList } from "@/hooks/useProduct";

// Lista de produtos de exemplo - defina aqui ou importe
const produtos = [
  { label: "Coxinha", value: "coxinha", price: 3.5, id: "1" },
  { label: "Pastel", value: "pastel", price: 4.0, id: "2" },
  { label: "Empada", value: "empada", price: 4.5, id: "3" },
  { label: "Kibe", value: "kibe", price: 3.0, id: "4" },
  { label: "Bolinha de Queijo", value: "bolinha", price: 3.5, id: "5" },
];

export function DialogPedidos() {
  const { products } = useProductList()
  const { orderStatus, isLoading: isOrderStatusLoading } = useOrderStatus();
  const { paymentMethods, isLoading: isPaymentMethodsLoading } =
    usePaymentMethods();
  const { customers, isLoading: isCustomersLoading } = useCustomerList();
  const { create, isLoading, error: orderError } = useOrder();
  const [open, setOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

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

  const onSubmit = async (formData: OrderRequest) => {
    try {
      const customer = customers.find((c) => c.id === formData.costumer_id);
      if (!customer) {
        toast.error("Cliente não encontrado");
        return "";
      }

      const billing_address_id = customer.billing_address.id!;

      const payload = {
        ...formData,
        delivery_address_id: billing_address_id,
        delivery_date: convertDateFormat(formData.delivery_date),
      };

      console.log("Enviando ao servidor:", payload);

      await create(payload);
      toast.success("Pedido cadastrado com sucesso!");
      setOpen(false); // Fechar o dialog após sucesso
    } catch (error: any) {
      toast.error("Falha ao cadastrar pedido!", {
        description: orderError || String(error),
        duration: 3000,
      });
    }
  };

  // Função de validação e submissão
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);

    console.log("Tentando validar o formulário...");
    const formValid = await trigger();
    console.log("O formulário é válido?", formValid);

    if (formValid) {
      console.log("Formulário válido. Chamando onSubmit...");
      handleSubmit(onSubmit)();
    } else {
      toast.error("Por favor, corrija os erros no formulário", {
        duration: 5000,
      });
    }
  };

  // Função auxiliar para calcular o total
  const calculateTotal = (items: any) => {
    return items.reduce((total: any, item: any) => {
      const product = produtos.find((p) => p.id === item.product_id);
      return total + (product?.price || 0) * item.quantity;
    }, 0);
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
              name="costumer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente*</FormLabel>
                  <FormControl>
                    {isCustomersLoading ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      <Select
                        value={String(field.value ?? "")}
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
                  <FormMessage />
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
                        name: product.name,
                        value: product.name,
                        price: product.price,
                        quantity: item.quantity,
                      };
                    })
                    // type guard explícito: só seleciona os não-nulos
                    .filter((x): x is SelectedItem => x != null);
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
                                product_id: produtos.find(
                                  (p) => p.value === item.value
                                )!.id,
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
                    <FormMessage />
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
                        value={String(field.value ?? "")}
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
                  <FormMessage />
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
                      placeholder="00/00/0000"
                      value={formatDateInput(field.value)}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                      }}
                      onBlur={(e) => {
                        // Ao perder o foco, tentamos garantir que o formato está correto
                        field.onBlur();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
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
                        value={String(field.value ?? "")}
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
                  <FormMessage />
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
                  {errors.costumer_id && (
                    <li>Cliente: {errors.costumer_id.message}</li>
                  )}
                  {errors.products && (
                    <li>Produtos: {errors.products.message}</li>
                  )}
                  {errors.delivery_date && (
                    <li>Data de entrega: {errors.delivery_date.message}</li>
                  )}
                  {errors.payment_method_id && (
                    <li>
                      Método de pagamento: {errors.payment_method_id.message}
                    </li>
                  )}
                  {errors.order_status_id && (
                    <li>Status do pedido: {errors.order_status_id.message}</li>
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
