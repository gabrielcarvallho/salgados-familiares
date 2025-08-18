"use client";
import { useEffect, useState } from "react";

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
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle,
  FileText,
  Hash,
  Home,
  Hotel,
  IdCard,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  User,
  X,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormSetError } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { type CustomerRequest, CustomerRequestSchema } from "@/types/Customer";
import { useCustomer, useCustomerList, useViaCEP } from "@/hooks/useCustomer";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  cleanCEP,
  cleanPhone,
  formatCEP,
  formatDateInput,
  formatPhone,
} from "@/lib/utils";
import { getErrorMessage } from "@/hooks/api/apiErrorHandler";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Helpers de documento (somente front)
const cleanDocument = (doc: string) => (doc ?? "").replace(/\D/g, "");
const formatDocument = (doc: string, type: "PF" | "PJ") => {
  const digits = cleanDocument(doc);
  if (type === "PF") {
    return digits
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4")
      .slice(0, 14);
  }
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5")
    .slice(0, 18);
};

// Converte "dd/MM/yyyy" -> "yyyy-MM-dd"; se já for ISO curto, retorna como está; inválido => null
const toISODateSafe = (v?: string | null): string | null => {
  if (!v) return null;
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s; // já ISO curto
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) {
    const [, dd, mm, yyyy] = m;
    return `${yyyy}-${mm}-${dd}`;
  }
  return null;
};

// Tipo do formulário (adiciona a flag local; não vai à API)
type CustomerForm = CustomerRequest & { useDefaultContact?: boolean };

// Valores iniciais
const EMPTY_FORM: CustomerForm = {
  customer_type: "PF",
  document: "",
  name: "",
  fantasy_name: "",
  phone_number: "",
  email: "",
  birth_date: null,
  billing_address: {
    cep: "",
    street_name: "",
    district: "",
    number: "",
    city: "",
    state: "",
    observation: "",
    description: "",
  },
  contact: undefined,
  useDefaultContact: false,
};

// Validação de regras PF/PJ fora do Zod
function validateBusinessRules(
  values: CustomerForm,
  setError: UseFormSetError<CustomerForm>
): boolean {
  if (values.customer_type === "PF") {
    if (!values.email) {
      setError("email", {
        type: "manual",
        message: "Email é obrigatório para Pessoa Física.",
      });
      return false;
    }
    // PF: contact é opcional; quando usar contato padrão, será montado no envio
    return true;
  }
  if (values.customer_type === "PJ") {
    if (!values.contact) {
      setError("contact", {
        type: "manual",
        message: "Contato é obrigatório para Pessoa Jurídica.",
      });
      return false;
    }
  }
  return true;
}

export function DialogClientes() {
  const { mutate } = useCustomerList();
  const { create, isLoading } = useCustomer();

  const [open, setOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("cliente");
  const [cepValue, setCepValue] = useState("");

  // Busca ViaCEP quando no formato XXXXX-XXX
  const shouldFetch = (cep: string) => (cep.length === 9 ? cep : "");
  const cep = shouldFetch(cepValue);

  const {
    address,
    isLoading: loadingAddress,
    isError: errorAddress,
  } = useViaCEP(cleanCEP(cep));

  // Form (schema sem effects)
  const form = useForm<CustomerForm>({
    resolver: zodResolver(CustomerRequestSchema),
    defaultValues: EMPTY_FORM,
    mode: "onSubmit",
  });

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    trigger,
    reset,
    setValue,
    watch,
    getValues,
    setError,
  } = form;

  // Watchers
  const watchedCep = watch("billing_address.cep");
  const customerType = watch("customer_type") || "PF";
  const useDefaultContact = watch("useDefaultContact") || false;

  const watchedBirthDate = watch("birth_date");
  const watchedName = watch("name");
  const watchedEmail = watch("email");
  const watchedPhone = watch("phone_number");

  // Sync CEP local
  useEffect(() => {
    setCepValue(watchedCep || "");
  }, [watchedCep]);

  // Preenche endereço via ViaCEP
  useEffect(() => {
    if (address && typeof address === "object") {
      setValue(
        "billing_address.street_name",
        (address as any).logradouro || "",
        { shouldValidate: true }
      );
      setValue("billing_address.district", (address as any).bairro || "", {
        shouldValidate: true,
      });
      setValue("billing_address.city", (address as any).localidade || "", {
        shouldValidate: true,
      });
      setValue("billing_address.state", (address as any).uf || "", {
        shouldValidate: true,
      });
      if ((address as any).logradouro) {
        toast.success("Endereço preenchido automaticamente!", {
          duration: 2000,
        });
      }
    }
  }, [address, setValue]);

  // Força birth_date=null no form quando PJ (UI)
  useEffect(() => {
    if (customerType === "PJ" && watchedBirthDate !== null) {
      setValue("birth_date", null, { shouldValidate: true });
    }
  }, [customerType, watchedBirthDate, setValue]);

  // Ao trocar para PJ, desmarca contato padrão
  useEffect(() => {
    if (customerType === "PJ" && useDefaultContact) {
      setValue("useDefaultContact", false, { shouldValidate: true });
    }
  }, [customerType, useDefaultContact, setValue]);

  const contactDisabled = customerType === "PF" && useDefaultContact;

  // Submit
  const onSubmit = async (rawValues: CustomerForm) => {
    try {
      // clona para normalizar sem mutar RHF
      const values: CustomerForm = JSON.parse(JSON.stringify(rawValues));

      const birthISO =
      values.customer_type === "PF"
        ? toISODateSafe(values.birth_date)   // string | null
        : null;

      // Monta contact quando PF + usar contato padrão
      const usingDefault =
        values.customer_type === "PF" && !!values.useDefaultContact;

      const contactFromClient = usingDefault
        ? {
            name: values.name,
            contact_email: values.email || "",
            contact_phone: cleanPhone(values.phone_number),
            date_of_birth: birthISO, // ISO correto
          }
        : undefined;

      const contactManual = values.contact
        ? {
            name: values.contact.name ?? "",
            contact_email: values.contact.contact_email ?? "",
            contact_phone: cleanPhone(values.contact.contact_phone ?? ""),
            date_of_birth: toISODateSafe(values.contact.date_of_birth ?? null),
          }
        : undefined;

      const normalizedContact = contactFromClient ?? contactManual;

      // Remove contact se todos os campos estiverem vazios
      const contact =
        normalizedContact &&
        (normalizedContact.name ||
          normalizedContact.contact_email ||
          normalizedContact.contact_phone ||
          normalizedContact.date_of_birth)
          ? normalizedContact
          : undefined;

      // Regras de negócio (fora do Zod)
      const ok = validateBusinessRules({ ...values, contact }, setError);
      if (!ok) {
        if (values.customer_type === "PJ" && !contact) setActiveTab("contato");
        if (values.customer_type === "PF" && !values.email)
          setActiveTab("cliente");
        return;
      }

      // Normaliza city (se vier "Joinville - SC")
      const cityNormalized =
        typeof values.billing_address.city === "string"
          ? values.billing_address.city.split("-")[0].trim()
          : values.billing_address.city;

      // Payload base
      const base = {
        customer_type: values.customer_type,
        document: cleanDocument(values.document),
        name: values.name,
        fantasy_name: values.fantasy_name,
        phone_number: cleanPhone(values.phone_number),
        email: values.email,
        billing_address: {
          ...values.billing_address,
          cep: cleanCEP(values.billing_address.cep),
          city: cityNormalized,
        },
        contact,
      };

      // Para PF: incluir birth_date ISO; Para PJ: omitir a chave
      const payload: CustomerRequest = {
        ...base,
        ...(values.customer_type === "PF" && birthISO
          ? { birth_date: birthISO }          // só envia se existir
          : {}),                              // não inclui a chave
      };
      
      await create(payload);
      mutate();
      toast.success("Cliente cadastrado com sucesso!", { duration: 3000 });
      reset(EMPTY_FORM);
      setOpen(false);
      setFormSubmitted(false);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error("Falha ao cadastrar cliente!", {
        description: errorMessage,
        duration: 3000,
      });
    }
  };

  // Submit com trigger de validação base
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    const formValid = await trigger();
    if (formValid) {
      handleSubmit(onSubmit)();
    } else {
      toast.error("Por favor, corrija os erros no formulário", {
        duration: 5000,
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      reset(EMPTY_FORM);
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
            className="sm:max-w-[640px] p-0 overflow-hidden"
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
                          Cliente
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

                      <div className="mt-4 relative min-h-[320px]">
                        {/* Aba Cliente */}
                        <TabsContent value="cliente" className="space-y-4 mt-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="customer_type"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-1.5">
                                    <IdCard className="h-3.5 w-3.5 text-muted-foreground" />
                                    Tipo de cliente*
                                  </FormLabel>
                                  <FormControl>
                                    <Select
                                      onValueChange={(v: "PF" | "PJ") => {
                                        field.onChange(v);
                                        const currentDoc =
                                          getValues("document") || "";
                                        setValue(
                                          "document",
                                          formatDocument(currentDoc, v)
                                        );
                                        if (v === "PJ") {
                                          setValue("birth_date", null, {
                                            shouldValidate: true,
                                          });
                                          setValue("useDefaultContact", false, {
                                            shouldValidate: true,
                                          });
                                        }
                                      }}
                                      value={field.value}
                                    >
                                      <SelectTrigger className="focus-visible:ring-[#FF8F3F]">
                                        <SelectValue placeholder="Selecione PF ou PJ" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="PF">
                                          Pessoa Física
                                        </SelectItem>
                                        <SelectItem value="PJ">
                                          Pessoa Jurídica
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="document"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-1.5">
                                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                                    {customerType === "PF" ? "CPF*" : "CNPJ*"}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder={
                                        customerType === "PF"
                                          ? "000.000.000-00"
                                          : "00.000.000/0000-00"
                                      }
                                      className="focus-visible:ring-[#FF8F3F]"
                                      value={formatDocument(
                                        field.value || "",
                                        customerType as "PF" | "PJ"
                                      )}
                                      onChange={(e) =>
                                        field.onChange(e.target.value)
                                      }
                                      onBlur={field.onBlur}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-1.5">
                                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                    Nome*
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder={
                                        customerType === "PF"
                                          ? "Nome completo"
                                          : "Razão social"
                                      }
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
                              name="fantasy_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-1.5">
                                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                    Nome fantasia
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Opcional"
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
                              name="phone_number"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-1.5">
                                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                    Telefone*
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      maxLength={15}
                                      placeholder="(47) 99999-9999"
                                      className="focus-visible:ring-[#FF8F3F]"
                                      value={formatPhone(field.value || "")}
                                      onChange={(e) =>
                                        field.onChange(e.target.value)
                                      }
                                      onBlur={field.onBlur}
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
                                    E-mail
                                    {customerType === "PF"
                                      ? "*"
                                      : " (opcional)"}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="contato@exemplo.com"
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
                              name="birth_date"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                    Data de nascimento{" "}
                                    {customerType === "PF"
                                      ? "(opcional)"
                                      : "(não enviado para PJ)"}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="01/01/2001"
                                      className="focus-visible:ring-[#FF8F3F]"
                                      disabled={customerType === "PJ"}
                                      value={
                                        field.value === null
                                          ? ""
                                          : formatDateInput(
                                              (field.value as string) || ""
                                            )
                                      }
                                      onChange={(e) => {
                                        if (customerType === "PJ") return;
                                        const v = e.target.value;
                                        field.onChange(
                                          v.trim() === "" ? null : v
                                        );
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

                        {/* Aba Contato */}
                        <TabsContent value="contato" className="space-y-4 mt-0">
                          {customerType === "PF" && (
                            <div className="mb-2 flex items-center gap-2">
                              <Checkbox
                                id="useDefaultContact"
                                checked={!!useDefaultContact}
                                onCheckedChange={(checked) =>
                                  setValue("useDefaultContact", !!checked, {
                                    shouldValidate: true,
                                  })
                                }
                              />
                              <label
                                htmlFor="useDefaultContact"
                                className="text-sm text-muted-foreground cursor-pointer"
                              >
                                Utilizar contato padrão (usar dados do cliente)
                              </label>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="contact.name"
                              render={({ field }) => {
                                const value =
                                  customerType === "PF" && useDefaultContact
                                    ? watchedName ?? ""
                                    : (field.value as string) ?? "";
                                return (
                                  <FormItem>
                                    <FormLabel className="flex items-center gap-1.5">
                                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                                      Nome para contato
                                      {customerType === "PJ" ? "*" : ""}
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Ex.: Fernando"
                                        className="focus-visible:ring-[#FF8F3F]"
                                        value={value}
                                        onChange={(e) =>
                                          field.onChange(e.target.value)
                                        }
                                        disabled={
                                          customerType === "PF" &&
                                          useDefaultContact
                                        }
                                      />
                                    </FormControl>
                                    {!(
                                      customerType === "PF" && useDefaultContact
                                    ) && <FormMessage />}
                                  </FormItem>
                                );
                              }}
                            />

                            <FormField
                              control={form.control}
                              name="contact.date_of_birth"
                              render={({ field }) => {
                                const value =
                                  customerType === "PF" && useDefaultContact
                                    ? watchedBirthDate === null
                                      ? ""
                                      : formatDateInput(
                                          (watchedBirthDate as string) || ""
                                        )
                                    : formatDateInput(
                                        (field.value as string) ?? ""
                                      );
                                return (
                                  <FormItem>
                                    <FormLabel className="flex items-center gap-1.5">
                                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                      Data de nascimento (contato)
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="01/01/2001"
                                        className="focus-visible:ring-[#FF8F3F]"
                                        value={value}
                                        onChange={(e) =>
                                          field.onChange(e.target.value)
                                        }
                                        disabled={
                                          customerType === "PF" &&
                                          useDefaultContact
                                        }
                                      />
                                    </FormControl>
                                    {!(
                                      customerType === "PF" && useDefaultContact
                                    ) && <FormMessage />}
                                  </FormItem>
                                );
                              }}
                            />

                            <FormField
                              control={form.control}
                              name="contact.contact_email"
                              render={({ field }) => {
                                const value =
                                  customerType === "PF" && useDefaultContact
                                    ? watchedEmail ?? ""
                                    : (field.value as string) ?? "";
                                return (
                                  <FormItem>
                                    <FormLabel className="flex items-center gap-1.5">
                                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                      E-mail para contato
                                      {customerType === "PJ" ? "*" : ""}
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="contato@exemplo.com"
                                        className="focus-visible:ring-[#FF8F3F]"
                                        value={value}
                                        onChange={(e) =>
                                          field.onChange(e.target.value)
                                        }
                                        disabled={
                                          customerType === "PF" &&
                                          useDefaultContact
                                        }
                                        type="email"
                                      />
                                    </FormControl>
                                    {!(
                                      customerType === "PF" && useDefaultContact
                                    ) && <FormMessage />}
                                  </FormItem>
                                );
                              }}
                            />

                            <FormField
                              control={form.control}
                              name="contact.contact_phone"
                              render={({ field }) => {
                                const value =
                                  customerType === "PF" && useDefaultContact
                                    ? formatPhone(watchedPhone ?? "")
                                    : formatPhone(
                                        (field.value as string) ?? ""
                                      );
                                return (
                                  <FormItem>
                                    <FormLabel className="flex items-center gap-1.5">
                                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                      Telefone para contato
                                      {customerType === "PJ" ? "*" : ""}
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        maxLength={15}
                                        placeholder="(47) 99999-9999"
                                        className="focus-visible:ring-[#FF8F3F]"
                                        value={value}
                                        onChange={(e) =>
                                          field.onChange(e.target.value)
                                        }
                                        disabled={
                                          customerType === "PF" &&
                                          useDefaultContact
                                        }
                                      />
                                    </FormControl>
                                    {!(
                                      customerType === "PF" && useDefaultContact
                                    ) && <FormMessage />}
                                  </FormItem>
                                );
                              }}
                            />
                          </div>
                        </TabsContent>

                        {/* Aba Endereço */}
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
                                        value={formatCEP(field.value || "")}
                                        onChange={(e) =>
                                          field.onChange(e.target.value)
                                        }
                                        onBlur={field.onBlur}
                                      />
                                    </FormControl>
                                    {loadingAddress && (
                                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                      </div>
                                    )}
                                    {!loadingAddress &&
                                      address &&
                                      !errorAddress &&
                                      cleanCEP(field.value).length === 8 && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                          <CheckCircle className="h-4 w-4 text-green-500" />
                                        </div>
                                      )}
                                    {!loadingAddress &&
                                      errorAddress &&
                                      cleanCEP(field.value).length === 8 && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
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
                                      maxLength={2}
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
                                        placeholder="Apartamento 101"
                                        className="focus-visible:ring-[#FF8F3F]"
                                        {...field}
                                        value={(field.value as string) ?? ""}
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
                                        value={(field.value as string) ?? ""}
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
                          {errors.customer_type && (
                            <li>{errors.customer_type.message}</li>
                          )}
                          {errors.document && (
                            <li>{errors.document.message}</li>
                          )}
                          {errors.name && <li>{errors.name.message}</li>}
                          {errors.fantasy_name && (
                            <li>{errors.fantasy_name.message}</li>
                          )}
                          {errors.phone_number && (
                            <li>{errors.phone_number.message}</li>
                          )}
                          {errors.email && <li>{errors.email.message}</li>}
                          {errors.birth_date && (
                            <li>{errors.birth_date.message}</li>
                          )}

                          {errors.contact &&
                            typeof errors.contact === "object" && (
                              <>
                                {"name" in errors.contact &&
                                  (errors.contact as any).name && (
                                    <li>
                                      Nome para contato:{" "}
                                      {(errors.contact as any).name.message}
                                    </li>
                                  )}
                                {"date_of_birth" in errors.contact &&
                                  (errors.contact as any).date_of_birth && (
                                    <li>
                                      Data de nascimento (contato):{" "}
                                      {
                                        (errors.contact as any).date_of_birth
                                          .message
                                      }
                                    </li>
                                  )}
                                {"contact_email" in errors.contact &&
                                  (errors.contact as any).contact_email && (
                                    <li>
                                      Email de contato:{" "}
                                      {
                                        (errors.contact as any).contact_email
                                          .message
                                      }
                                    </li>
                                  )}
                                {"contact_phone" in errors.contact &&
                                  (errors.contact as any).contact_phone && (
                                    <li>
                                      Telefone de contato:{" "}
                                      {
                                        (errors.contact as any).contact_phone
                                          .message
                                      }
                                    </li>
                                  )}
                              </>
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
