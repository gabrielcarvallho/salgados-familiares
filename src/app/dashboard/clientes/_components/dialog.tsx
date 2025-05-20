"use client";
import { useState, useEffect } from "react";
import type React from "react";

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
import {
  Loader2,
  Plus,
  Building2,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Hash,
  FileText,
  Home,
  CheckCircle,
  AlertCircle,
  X,
  Hotel,
} from "lucide-react";
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
  type CustomerRequest,
  CustomerRequestSchema,
  EMPTY_CUSTOMER,
} from "@/types/Customer";
import { useCustomer, useCustomerList, useViaCEP } from "@/hooks/useCustomer";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  cleanCNPJ,
  cleanPhone,
  cleanCEP,
  convertDateFormat,
  formatCEP,
  formatCNPJ,
  formatDateInput,
  formatPhone,
} from "@/lib/utils";

export function DialogClientes() {
  const { mutate } = useCustomerList();
  const { create, isLoading, error: err } = useCustomer();
  const [open, setOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("cliente");
  const [cepValue, setCepValue] = useState("");

  const shouldFetch = (cep: string): string => {
    const cepLength = cep.length;

    if (cepLength == 9) return cep;

    return "";
  };

  const cep = shouldFetch(cepValue);

  // Usar o hook useViaCEP para buscar o endereço
  const {
    address,
    isLoading: loadingAddress,
    isError: errorAddress,
  } = useViaCEP(cleanCEP(cep));

  const form = useForm<CustomerRequest>({
    resolver: zodResolver(CustomerRequestSchema),
    defaultValues: EMPTY_CUSTOMER,
    mode: "onSubmit",
  });

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    trigger,
    reset,
    setValue,
    watch,
  } = form;

  // Observar mudanças no CEP para atualizar o estado local
  const watchedCep = watch("billing_address.cep");

  useEffect(() => {
    setCepValue(watchedCep || "");
  }, [watchedCep]);

  useEffect(() => {
    if (address && typeof address === "object") {
      setValue("billing_address.street_name", address.logradouro || "", {
        shouldValidate: true,
      });
      setValue("billing_address.district", address.bairro || "", {
        shouldValidate: true,
      });
      setValue("billing_address.city", address.localidade || "", {
        shouldValidate: true,
      });
      setValue("billing_address.state", address.uf || "", {
        shouldValidate: true,
      });

      // Notificar o usuário
      if (address.logradouro) {
        toast.success("Endereço preenchido automaticamente!", {
          duration: 2000,
        });
      }
    }
  }, [address, setValue]);

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
      mutate();
      toast.success("Cliente cadastrado com sucesso!", {
        duration: 3000,
      });
      reset(EMPTY_CUSTOMER);
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

  const handleClose = () => {
    setOpen(false);
    // Pequeno delay para resetar o formulário após a animação de fechamento
    setTimeout(() => {
      reset(EMPTY_CUSTOMER);
      setFormSubmitted(false);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-[#FF8F3F] text-white">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus className="h-4 w-4" />
            Adicionar cliente
          </motion.div>
        </Button>
      </DialogTrigger>

      <AnimatePresence>
        {open && (
          <DialogContent
            className="sm:max-w-[600px] p-0 overflow-hidden "
            forceMount
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader className="px-6 pt-6 pb-2">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-[#FF8F3F]" />
                    Novo Cliente
                  </DialogTitle>
                </div>
                <DialogDescription className="text-muted-foreground mt-1.5">
                  Preencha as informações do cliente para cadastrá-lo no sistema
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={handleFormSubmit} className="flex flex-col">
                  <div className="px-6">
                    <Tabs
                      value={activeTab}
                      onValueChange={setActiveTab}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger
                          value="cliente"
                          className="flex items-center gap-2"
                        >
                          <Building2 className="h-4 w-4" />
                          Empresa
                        </TabsTrigger>
                        <TabsTrigger
                          value="contato"
                          className="flex items-center gap-2"
                        >
                          <User className="h-4 w-4" />
                          Contato
                        </TabsTrigger>
                        <TabsTrigger
                          value="endereco"
                          className="flex items-center gap-2"
                        >
                          <MapPin className="h-4 w-4" />
                          Endereço
                        </TabsTrigger>
                      </TabsList>

                      <div className="mt-4 relative min-h-[300px]">
                        <TabsContent value="cliente" className="space-y-4 mt-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                            <FormField
                              control={form.control}
                              name="company_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-1.5">
                                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                    Razão social*
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Insira a razão social da empresa"
                                      className="focus-visible:ring-[#FF8F3F]"
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
                                  <FormLabel className="flex items-center gap-1.5">
                                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                    Nome fantasia*
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Insira o nome fantasia"
                                      className="focus-visible:ring-[#FF8F3F]"
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
                                  <FormLabel className="flex items-center gap-1.5">
                                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                                    CNPJ*
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="00.000.000/0001-00"
                                      className="focus-visible:ring-[#FF8F3F]"
                                      value={formatCNPJ(field.value)}
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
                              name="phone_number"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-1.5">
                                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                    Telefone da empresa*
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      maxLength={15}
                                      placeholder="(47) 99999-9999"
                                      className="focus-visible:ring-[#FF8F3F]"
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
                                  <FormLabel className="flex items-center gap-1.5">
                                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                    Inscrição estadual
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Insira a inscrição estadual"
                                      className="focus-visible:ring-[#FF8F3F]"
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
                                  <FormLabel className="flex items-center gap-1.5">
                                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                    E-mail*
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="empresa@exemplo.com"
                                      className="focus-visible:ring-[#FF8F3F]"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </TabsContent>

                        <TabsContent value="contato" className="space-y-4 mt-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="contact.name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-1.5">
                                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                                    Nome para contato*
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Fernando"
                                      className="focus-visible:ring-[#FF8F3F]"
                                      {...field}
                                    />
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
                                  <FormLabel className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                    Data de nascimento*
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="01/01/2001"
                                      className="focus-visible:ring-[#FF8F3F]"
                                      value={formatDateInput(field.value)}
                                      onChange={(e) => {
                                        field.onChange(e.target.value);
                                      }}
                                      onBlur={() => {
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
                                  <FormLabel className="flex items-center gap-1.5">
                                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                    E-mail para contato*
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="fernando@gmail.com"
                                      className="focus-visible:ring-[#FF8F3F]"
                                      {...field}
                                    />
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
                                  <FormLabel className="flex items-center gap-1.5">
                                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                    Telefone para contato*
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      maxLength={15}
                                      placeholder="(47) 99999-9999"
                                      className="focus-visible:ring-[#FF8F3F]"
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
                          </div>
                        </TabsContent>

                        <TabsContent
                          value="endereco"
                          className="space-y-4 mt-0"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="billing_address.cep"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                    CEP*
                                  </FormLabel>
                                  <div className="relative">
                                    <FormControl>
                                      <Input
                                        placeholder="89000-000"
                                        className={cn(
                                          "focus-visible:ring-[#FF8F3F] pr-10",
                                          loadingAddress && "pr-12"
                                        )}
                                        value={formatCEP(field.value)}
                                        onChange={(e) => {
                                          field.onChange(e.target.value);
                                        }}
                                        onBlur={field.onBlur}
                                      />
                                    </FormControl>
                                    {loadingAddress && (
                                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                      </div>
                                    )}
                                    {!loadingAddress &&
                                      address &&
                                      !errorAddress &&
                                      cleanCEP(field.value).length === 8 && (
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                          <CheckCircle className="h-4 w-4 text-green-500" />
                                        </div>
                                      )}
                                    {!loadingAddress &&
                                      errorAddress &&
                                      cleanCEP(field.value).length === 8 && (
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                          <AlertCircle className="h-4 w-4 text-red-500" />
                                        </div>
                                      )}
                                  </div>
                                  <FormMessage />
                                  {!loadingAddress &&
                                    errorAddress &&
                                    cleanCEP(field.value).length === 8 && (
                                      <p className="text-xs text-red-500 mt-1">
                                        CEP não encontrado
                                      </p>
                                    )}
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="billing_address.street_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-1.5">
                                    <Home className="h-3.5 w-3.5 text-muted-foreground" />
                                    Rua*
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Rua Dona Francisca"
                                      className="focus-visible:ring-[#FF8F3F]"
                                      {...field}
                                      disabled={loadingAddress}
                                    />
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
                                  <FormLabel className="flex items-center gap-1.5">
                                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                                    Número*
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="5130"
                                      className="focus-visible:ring-[#FF8F3F]"
                                      {...field}
                                    />
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
                                  <FormLabel className="flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                    Bairro*
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Santo Antônio"
                                      className="focus-visible:ring-[#FF8F3F]"
                                      {...field}
                                      disabled={loadingAddress}
                                    />
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
                                  <FormLabel className="flex items-center gap-1.5">
                                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                    Cidade*
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Joinville"
                                      className="focus-visible:ring-[#FF8F3F]"
                                      {...field}
                                      disabled={loadingAddress}
                                    />
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
                                  <FormLabel className="flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                    UF*
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="SC"
                                      className="focus-visible:ring-[#FF8F3F]"
                                      {...field}
                                      disabled={loadingAddress}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="md:col-span-1">
                              <FormField
                                control={form.control}
                                name="billing_address.observation"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="flex items-center gap-1.5">
                                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                      Observação
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="APTO 300"
                                        className="focus-visible:ring-[#FF8F3F]"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="md:col-span-1">
                              <FormField
                                control={form.control}
                                name="billing_address.description"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="flex items-center gap-1.5">
                                      <Hotel className="h-3.5 w-3.5 text-muted-foreground" />
                                      Descrição
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Trabalho"
                                        className="focus-visible:ring-[#FF8F3F]"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </TabsContent>
                      </div>
                    </Tabs>
                  </div>

                  {formSubmitted && Object.keys(errors).length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="px-6 mt-4"
                    >
                      <div className="text-red-500 text-sm p-3 border border-red-300 rounded-md bg-red-50">
                        <p className="font-medium mb-1 flex items-center gap-1.5">
                          <X className="h-4 w-4" />
                          Por favor, corrija os seguintes erros:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                          {errors.company_name && (
                            <li>{errors.company_name.message}</li>
                          )}
                          {errors.brand_name && (
                            <li>{errors.brand_name.message}</li>
                          )}
                          {errors.cnpj && <li>{errors.cnpj.message}</li>}
                          {errors.phone_number && (
                            <li>{errors.phone_number.message}</li>
                          )}
                          {errors.email && <li>{errors.email.message}</li>}
                          {errors.state_tax_registration && (
                            <li>{errors.state_tax_registration.message}</li>
                          )}
                          {errors.contact?.name && (
                            <li>
                              Nome para contato: {errors.contact.name.message}
                            </li>
                          )}
                          {errors.contact?.date_of_birth && (
                            <li>
                              Data de nascimento:{" "}
                              {errors.contact.date_of_birth.message}
                            </li>
                          )}
                          {errors.contact?.contact_email && (
                            <li>
                              Email de contato:{" "}
                              {errors.contact.contact_email.message}
                            </li>
                          )}
                          {errors.contact?.contact_phone && (
                            <li>
                              Telefone de contato:{" "}
                              {errors.contact.contact_phone.message}
                            </li>
                          )}
                          {errors.billing_address?.cep && (
                            <li>CEP: {errors.billing_address.cep.message}</li>
                          )}
                          {errors.billing_address?.street_name && (
                            <li>
                              Rua: {errors.billing_address.street_name.message}
                            </li>
                          )}
                          {errors.billing_address?.number && (
                            <li>
                              Número: {errors.billing_address.number.message}
                            </li>
                          )}
                          {errors.billing_address?.district && (
                            <li>
                              Bairro: {errors.billing_address.district.message}
                            </li>
                          )}
                          {errors.billing_address?.city && (
                            <li>
                              Cidade: {errors.billing_address.city.message}
                            </li>
                          )}
                          {errors.billing_address?.state && (
                            <li>
                              Estado: {errors.billing_address.state.message}
                            </li>
                          )}
                        </ul>
                      </div>
                    </motion.div>
                  )}

                  <div className="mt-6">
                    <Separator />
                    <DialogFooter className="px-6 py-4">
                      <div className="flex gap-2 w-full sm:justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleClose}
                          className="flex-1 sm:flex-initial"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          variant="outline"
                          className={cn(
                            "bg-[#FF8F3F] text-white",
                            (isSubmitting || isLoading) &&
                              "opacity-80 pointer-events-none"
                          )}
                          disabled={isSubmitting || isLoading}
                        >
                          {isLoading || isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Cadastrando...
                            </>
                          ) : (
                            <>Cadastrar cliente</>
                          )}
                        </Button>
                      </div>
                    </DialogFooter>
                  </div>
                </form>
              </Form>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
