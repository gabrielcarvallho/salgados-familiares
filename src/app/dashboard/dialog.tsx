"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGroupList, useUser } from "@/hooks/useUser";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { InviteRequest, inviteRequestSchema, EMPTY_USER } from "@/types/User";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { formatGroup } from "@/lib/utils";

export function DialogUsuario() {
  const {
    groups,
    isLoading: isGroupsLoading,
    isError: isGroupsError,
  } = useGroupList();
  const { invite, isLoading: isInviting, error: inviteError } = useUser();
  const [open, setOpen] = useState(false);

  const form = useForm<InviteRequest>({
    resolver: zodResolver(inviteRequestSchema),
    defaultValues: EMPTY_USER,
    mode: "onSubmit",
  });

  const {
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = form;

  // 1. "watch" para is_admin
  const isAdmin = watch("is_admin");

  const onSubmit = async (data: InviteRequest) => {
    try {
      await invite(data);
      toast.success("Usuário convidado com sucesso!", { duration: 3000 });
      form.reset(EMPTY_USER);
      setOpen(false);
    } catch (err: any) {
      toast.error("Falha ao convidar usuário!", {
        description: inviteError || String(err),
        duration: 3000,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-[#FF8F3F] text-primary-foreground"
        >
          <Plus />
          Convidar usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Convidar Usuário</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Insira o e-mail do usuário"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="is_admin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>É admin?*</FormLabel>
                  <FormControl>
                    <Select
                      value={String(field.value ?? false)}
                      onValueChange={(val) => {
                        const admin = val === "true";
                        field.onChange(admin);
                        // 2. se for admin, define group_id = 0
                        if (admin) {
                          setValue("group_id", 0, { shouldValidate: true });
                        }
                      }}
                    >
                      <SelectTrigger className="w-full rounded border px-3 py-2">
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Administrador?</SelectLabel>
                          <SelectItem value="true">Sim</SelectItem>
                          <SelectItem value="false">Não</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* === group_id === */}
            <FormField
              control={control}
              name="group_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grupo*</FormLabel>
                  <FormControl>
                    {isGroupsLoading ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : isGroupsError ? (
                      <p className="text-red-500">Falha ao carregar grupos</p>
                    ) : (
                      <Select
                        // 3. desabilita se isAdmin === true
                        disabled={isAdmin === true || isGroupsLoading}
                        value={String(field.value ?? "")}
                        onValueChange={(val) => field.onChange(Number(val))}
                      >
                        <SelectTrigger className="w-full rounded border px-3 py-2">
                          <SelectValue
                            placeholder={
                              isAdmin
                                ? "Grupo fixo para admin"
                                : "Selecione um grupo"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Grupos disponíveis</SelectLabel>
                            {groups.map((g) => (
                              <SelectItem key={g.id} value={String(g.id)}>
                                {formatGroup(g.name)}
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

            <DialogFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="outline"
                className="bg-[#FF8F3F] text-primary-foreground"
                disabled={isInviting}
              >
                {isInviting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Convidando...
                  </>
                ) : (
                  "Convidar usuário"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
