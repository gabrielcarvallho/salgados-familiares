"use client";
import { useState } from "react";
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
import { Loader2, Plus, Save, Package, DollarSign, Scale, MicrowaveIcon as Oven, Calendar, Clock } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useProduct, useProductList } from "@/hooks/useProduct";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { ProductRequest, productRequestSchema } from "@/types/Product";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function DialogProdutos() {
  const [open, setOpen] = useState(false);
  const { create, isLoading, error: productError } = useProduct();
  const { mutate } = useProductList();

  const form = useForm<ProductRequest>({
    resolver: zodResolver(productRequestSchema),
    defaultValues: {
      name: "",
      price: 0,
      weight: "",
      batch_packages: 0,
      daily_batch_capacity: 0,
      batch_production_days: 1,
    },
  });

  const onSubmit = async (data: ProductRequest) => {
    try {
      await create(data);
      mutate();
      toast.success("Produto criado com sucesso!", {
        duration: 3000,
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error("Falha ao criar produto", {
        description: productError || String(error),
        duration: 3000,
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    // Pequeno delay para resetar o formulário após a animação de fechamento
    setTimeout(() => form.reset(), 300);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-[#FF8F3F] text-white"
        >
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus className="h-4 w-4" />
            Adicionar produto
          </motion.div>
        </Button>
      </DialogTrigger>
      
      <AnimatePresence>
        {open && (
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden" forceMount>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader className="px-6 pt-6 pb-2">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                    <Package className="h-5 w-5 text-[#FF8F3F]" />
                    Novo Produto
                  </DialogTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleClose}
                    className="h-8 w-8 rounded-full"
                  >
                  </Button>
                </div>
                <DialogDescription className="text-muted-foreground mt-1.5">
                  Preencha as informações do produto para cadastrá-lo no sistema
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="basic" className="w-full">
                <div className="px-6">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                    <TabsTrigger value="production">Produção</TabsTrigger>
                  </TabsList>
                </div>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="px-6">
                      <TabsContent value="basic" className="mt-0 space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-1.5">
                                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                                Nome do Produto
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ex: Pão Francês"
                                  className="focus-visible:ring-[#FF8F3F]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1.5">
                                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                                  Preço (R$)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0,00"
                                    className="focus-visible:ring-[#FF8F3F]"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="weight"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1.5">
                                  <Scale className="h-3.5 w-3.5 text-muted-foreground" />
                                  Peso (g)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Ex: 50"
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

                      <TabsContent value="production" className="mt-0 space-y-4">
                        <FormField
                          control={form.control}
                          name="batch_packages"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-1.5">
                                <Oven className="h-3.5 w-3.5 text-muted-foreground" />
                                Pacotes por Fornada
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Ex: 20"
                                  className="focus-visible:ring-[#FF8F3F]"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="daily_batch_capacity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                Fornadas por Dia
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Ex: 5"
                                  className="focus-visible:ring-[#FF8F3F]"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="batch_production_days"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                Dias para Produção
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Ex: 1"
                                  className="focus-visible:ring-[#FF8F3F]"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                    </div>

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
                              isLoading && "opacity-80 pointer-events-none"
                            )}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Cadastrando...
                              </>
                            ) : (
                              <>
                                Criar produto
                              </>
                            )}
                          </Button>
                        </div>
                      </DialogFooter>
                    </div>
                  </form>
                </Form>
              </Tabs>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
