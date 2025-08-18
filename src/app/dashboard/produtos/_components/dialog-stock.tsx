"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Boxes } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import api from "@/lib/axios";
import { handleApiError } from "@/hooks/api/apiErrorHandler";
import { useProductList } from "@/hooks/useProduct";
import { useStock } from "@/hooks/useStock";
import {
  stockConfigCreateSchema,
  stockConfigUpdateSchema,
  type StockConfigCreate,
  type StockConfigUpdate,
  type StockListItem,
} from "@/types/Stock";
import { ProductResponse } from "@/types/Product";

type StockConfigForm = {
  id?: string; // para update
  product_id?: string; // para create
  current_stock: number;
  min_stock_threshold: number;
  max_stock_capacity: number;
};

type Props = {
  onSaved?: () => void; // chame mutate() de estoque/página depois de salvar
};

export function DialogStockManager({ onSaved }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [existingConfig, setExistingConfig] = useState<StockListItem | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(false);

  // Produtos ativos para o select (traga o suficiente para o dropdown)
  const { products, isLoading: loadingProducts } = useProductList("active", 1, 1000);

  const selectedProduct = useMemo<ProductResponse | undefined>(
    () => products.find((p) => p.id === selectedProductId),
    [products, selectedProductId]
  );

  const isEditing = !!existingConfig;
  const resolverSchema = isEditing ? stockConfigUpdateSchema : stockConfigCreateSchema;

  // Um único tipo de form para evitar unions no react-hook-form
  const form = useForm<StockConfigForm>({
    resolver: zodResolver(resolverSchema as any),
    defaultValues: {
      product_id: "",
      current_stock: 0,
      min_stock_threshold: 0,
      max_stock_capacity: 0,
    },
    mode: "onSubmit",
  });

  const { create, update, isLoading: saving } = useStock();

  // Reset geral quando fecha
  useEffect(() => {
    if (!open) {
      setSelectedProductId("");
      setExistingConfig(null);
      form.reset({
        product_id: "",
        current_stock: 0,
        min_stock_threshold: 0,
        max_stock_capacity: 0,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Buscar configuração existente ao selecionar um produto
  useEffect(() => {
    const fetchConfig = async () => {
      if (!selectedProductId) return;
      setLoadingConfig(true);
      try {
        // Esperado: GET /stock/?product_id=<id> retorne { stock_configurations: [ ... ] } ou 404/array vazio
        const { data } = await api.get(`/stock/?product_id=${selectedProductId}&page=1&page_size=1`);
        const list: StockListItem[] = (data?.stock_configurations ?? []) as any;
        const first = list[0];

        if (first?.id) {
          setExistingConfig(first);
          form.reset({
            id: first.id,
            current_stock: first.current_stock,
            min_stock_threshold: first.min_stock_threshold,
            max_stock_capacity: first.max_stock_capacity,
          });
        } else {
          setExistingConfig(null);
          form.reset({
            product_id: selectedProductId,
            current_stock: 0,
            min_stock_threshold: 0,
            max_stock_capacity: 0,
          });
        }
      } catch (_err) {
        // Se der 404/erro, entra em modo create
        setExistingConfig(null);
        form.reset({
          product_id: selectedProductId,
          current_stock: 0,
          min_stock_threshold: 0,
          max_stock_capacity: 0,
        });
      } finally {
        setLoadingConfig(false);
      }
    };

    fetchConfig();
  }, [selectedProductId]);

  const onSubmit = async (values: StockConfigForm) => {
    try {
      if (isEditing) {
        const payload: StockConfigUpdate = {
          id: values.id!,
          current_stock: Number(values.current_stock) || 0,
          min_stock_threshold: Number(values.min_stock_threshold) || 0,
          max_stock_capacity: Number(values.max_stock_capacity) || 0,
          product_id: values.product_id || "",
        };
        await update(payload);
        toast.success("Estoque atualizado!");
      } else {
        const payload: StockConfigCreate = {
          product_id: selectedProductId,
          current_stock: Number(values.current_stock) || 0,
          min_stock_threshold: Number(values.min_stock_threshold) || 0,
          max_stock_capacity: Number(values.max_stock_capacity) || 0,
        };
        await create(payload);
        toast.success("Estoque configurado!");
      }
      onSaved?.();
      setOpen(false);
    } catch (error) {
      const err = handleApiError(error);
      toast.error("Falha ao salvar estoque", { description: err.message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Boxes className="h-4 w-4" />
          Configurar estoque
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Configurar estoque</DialogTitle>
          <DialogDescription>
            Selecione um produto e ajuste sua configuração de estoque.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Seleção de produto */}
            <div className="space-y-2">
              <FormLabel>Produto</FormLabel>
              <Select
                value={selectedProductId}
                onValueChange={(v) => setSelectedProductId(v)}
                disabled={loadingProducts}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingProducts ? "Carregando..." : "Selecione um produto"} />
                </SelectTrigger>
                <SelectContent>
                  {(products || []).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Formulário somente após seleção de produto */}
            {selectedProductId && (
              <>
                <div className="text-sm text-muted-foreground">
                  {loadingConfig
                    ? "Carregando configuração..."
                    : isEditing
                    ? `Editando estoque de: ${selectedProduct?.name ?? ""}`
                    : `Criando estoque para: ${selectedProduct?.name ?? ""}`}
                </div>

                {/* Campo ID aparece apenas no modo edição */}
                {isEditing && (
                  <FormField
                    control={form.control}
                    name="id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID</FormLabel>
                        <FormControl>
                          <Input value={field.value ?? existingConfig?.id ?? ""} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="current_stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estoque atual</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="numeric"
                          value={field.value as any}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          min={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="min_stock_threshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estoque mínimo</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            inputMode="numeric"
                            value={field.value as any}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            min={0}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="max_stock_capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacidade máxima</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            inputMode="numeric"
                            value={field.value as any}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            min={0}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {isEditing ? "Salvar alterações" : "Criar configuração"}
                  </Button>
                </div>
              </>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
