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
import { useProduct, useProductList } from "@/hooks/useProduct";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { toast } from "sonner";
import { ProductRequest, productRequestSchema } from "@/types/Product";

export function DialogProdutos() {
  const { create, isLoading, error: productError } = useProduct();
  const { mutate } = useProductList()

  const form = useForm<ProductRequest>({
    resolver: zodResolver(productRequestSchema),
    defaultValues: {
      name: "",
      price: 0,
      weight: "",
      batch_packages: 0,
    },
  });

  const {
    formState: { errors },
  } = form;

  const onSubmit = async (data: ProductRequest) => {
    try {
      await create(data);
      mutate()
      toast.success("Seu produto foi criado!", {
        duration: 3000,
      });
    } catch (error) {
      toast.error("Falha ao criar seu produto.", {
        description: productError || String(error),
        duration: 3000,
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-[#FF8F3F] text-primary-foreground"
        >
          <Plus />
          Adicionar produto
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar produto</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para adicionar seu produto
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <div className="flex flex-col gap-2">
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Insira o nome do produto"
                        {...field}
                      />
                    </FormControl>
                    {errors.name && (
                      <p className="text-red-500 text-sm">
                        {errors.name.message}
                      </p>
                    )}
                  </FormItem>
                </div>
              )}
            />

            <FormField
              control={form.control}
              name="batch_packages"
              render={({ field }) => (
                <div className="flex flex-col gap-2">
                  <FormItem>
                    <FormLabel>Pacotes/Fornada</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Insira quantos pacotes saem por fornada"
                        {...field}
                      />
                    </FormControl>
                    {errors.batch_packages && (
                      <p className="text-red-500 text-sm">
                        {errors.batch_packages.message}
                      </p>
                    )}
                  </FormItem>
                </div>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <div className="flex flex-col gap-2">
                  <FormItem>
                    <FormLabel>Preço</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Insira o preço do produto"
                        {...field}
                      />
                    </FormControl>
                    {errors.price && (
                      <p className="text-red-500 text-sm">
                        {errors.price.message}
                      </p>
                    )}
                  </FormItem>
                </div>
              )}
            />
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <div className="flex flex-col gap-2">
                  <FormItem>
                    <FormLabel>Peso/unidade (g)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Insira o peso do produto"
                        {...field}
                      />
                    </FormControl>
                    {errors.weight && (
                      <p className="text-red-500 text-sm">
                        {errors.weight.message}
                      </p>
                    )}
                  </FormItem>
                </div>
              )}
            />
            <DialogFooter>
              <Button variant="outline">Cancelar</Button>
              <Button
                type="submit"
                variant={"outline"}
                className="bg-[#FF8F3F] text-primary-foreground"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  "Criar produto"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
