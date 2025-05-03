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
import {
  CustomerRequest,
  CustomerRequestSchema,
  EMPTY_CUSTOMER,
} from "@/types/Customer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustomer, useCustomerList } from "@/hooks/useCostumer";
import { useState } from "react";
import { cleanCNPJ, cleanPhone, convertDateFormat, formatCEP, formatCNPJ, formatDateInput, formatPhone } from "@/lib/utils";


export function DialogClientes() {
  const { mutate } = useCustomerList()
  const { create, isLoading, error: err } = useCustomer();
  const [open, setOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);



  const form = useForm<CustomerRequest>({
    resolver: zodResolver(CustomerRequestSchema),
    defaultValues: EMPTY_CUSTOMER,
    mode: "onSubmit",
  });

  const {
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

  const onSubmit = async (formData: CustomerRequest) => {
    try {
      // Limpar e formatar dados antes do envio
      const dataToSubmit = {
        ...formData,
        phone_number: cleanPhone(formData.phone_number),
        cnpj: cleanCNPJ(formData.cnpj),
        contact: {
          ...formData.contact,
          contact_phone: cleanPhone(formData.contact.contact_phone),
          date_of_birth: convertDateFormat(formData.contact.date_of_birth),
        },
      };

      console.log("Dados formatados para envio:", dataToSubmit);

      await create(dataToSubmit);
      mutate()
      toast.success("Cliente cadastrado com sucesso!", {
        duration: 3000,
      });
      form.reset(EMPTY_CUSTOMER);
      setFormSubmitted(false);
      setOpen(false);
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
      toast.error("Falha ao cadastrar cliente!", {
        description: err || String(error),
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-[#FF8F3F] text-primary-foreground"
          onClick={() => setOpen(true)}
        >
          <Plus />
          Adicionar cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Adicionar cliente</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para cadastrar seu cliente
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
            <Tabs defaultValue="cliente" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="cliente">Cliente</TabsTrigger>
                <TabsTrigger value="contato">Contato</TabsTrigger>
                <TabsTrigger value="endereco">Endereço</TabsTrigger>
              </TabsList>

              <TabsContent value="cliente" className="space-y-4">
                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razão social*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Insira a razão social da empresa do cliente"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brand_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome fantasia*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Insira o nome fantasia do cliente"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="00.000.000/0001-00"
                          value={formatCNPJ(field.value)}
                          onChange={(e) => {
                            // Atualizar o campo com o valor formatado para exibição
                            // mas armazenar apenas os números para validação
                            field.onChange(e.target.value);
                          }}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Telefone da empresa*
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(47) 99999-9999"
                          value={formatPhone(field.value)}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state_tax_registration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inscrição estadual</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Insira a inscrição estadual (9-14 caracteres)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail*</FormLabel>
                      <FormControl>
                        <Input placeholder="empresa@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="contato" className="space-y-4">
                <FormField
                  control={form.control}
                  name="contact.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome para contato*</FormLabel>
                      <FormControl>
                        <Input placeholder="Fernando" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact.date_of_birth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de nascimento*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="01/01/2001"
                          value={formatDateInput(field.value)}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                          onBlur={() => {
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
                  control={form.control}
                  name="contact.contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail para contato*</FormLabel>
                      <FormControl>
                        <Input placeholder="fernando@gmail.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact.contact_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Telefone para contato*
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(47) 99999-9999"
                          value={formatPhone(field.value)}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
              </TabsContent>

              <TabsContent value="endereco" className="space-y-4">
                <FormField
                  control={form.control}
                  name="billing_address.cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="89000-000"
                          value={formatCEP(field.value)}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="billing_address.street_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rua*</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua Dona Francisca" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="billing_address.number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número*</FormLabel>
                      <FormControl>
                        <Input placeholder="5130" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="billing_address.district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro*</FormLabel>
                      <FormControl>
                        <Input placeholder="Santo Antônio" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="billing_address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade*</FormLabel>
                      <FormControl>
                        <Input placeholder="Joinville" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="billing_address.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado*</FormLabel>
                      <FormControl>
                        <Input placeholder="Santa Catarina" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="billing_address.observation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observação</FormLabel>
                      <FormControl>
                        <Input placeholder="APTO 300" {...field} />
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
                  "Cadastrar cliente"
                )}
              </Button>
            </DialogFooter>
              </TabsContent>

              
            </Tabs>


            {formSubmitted && Object.keys(errors).length > 0 && (
              <div className="text-red-500 text-sm p-2 border border-red-300 rounded bg-red-50">
                <p className="font-medium mb-1">
                  Por favor, corrija os seguintes erros:
                </p>
                <ul className="list-disc pl-5">
                  {errors.company_name && (
                    <li>Razão social: {errors.company_name.message}</li>
                  )}
                  {errors.brand_name && (
                    <li>Nome fantasia: {errors.brand_name.message}</li>
                  )}
                  {errors.cnpj && <li>CNPJ: {errors.cnpj.message}</li>}
                  {errors.phone_number && (
                    <li>Telefone da empresa: {errors.phone_number.message}</li>
                  )}
                  {errors.email && <li>E-mail: {errors.email.message}</li>}
                  {errors.state_tax_registration && (
                    <li>
                      Inscrição estadual:{" "}
                      {errors.state_tax_registration.message}
                    </li>
                  )}
                  {errors.billing_address && (
                    <li>Preencha corretamente os campos de endereço</li>
                  )}
                  {errors.contact && (
                    <li>Preencha corretamente os campos de contato</li>
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