"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

// Hooks
import { useGroupList, useUser } from "@/hooks/useUser";

// UI Components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
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
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Icons
import {
  AtSign,
  CheckCircle2,
  Loader2,
  Shield,
  ShieldAlert,
  UserPlus,
  Users,
} from "lucide-react";

// Types and utils
import {
  type InviteRequest,
  inviteRequestSchema,
  EMPTY_USER,
} from "@/types/User";
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
    mode: "onChange", // Changed to onChange for better UX feedback
  });

  const { handleSubmit, watch, setValue, control, formState } = form;
  const { errors, isValid, isDirty } = formState;

  // Watch for is_admin
  const isAdmin = watch("is_admin");
  const email = watch("email");
  const groupId = watch("group_id");

  // Get selected group name for preview
// antes:
const selectedGroup = groups.find((g) => Number(g.id) === groupId);

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
          className="bg-[#FF8F3F] text-white"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Convidar usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center">
            <UserPlus className="mr-2 h-6 w-6 text-[#FF8F3F]" />
            Convidar Usuário
          </DialogTitle>
          <DialogDescription>
            Envie um convite para um novo usuário acessar o sistema
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center text-base">
                    <AtSign className="mr-2 h-4 w-4 text-[#FF8F3F]" />
                    E-mail*
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Insira o e-mail do usuário"
                      className="h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    O usuário receberá um e-mail com instruções para acessar o
                    sistema
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

              <FormField
                control={control}
                name="is_admin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Shield className="mr-2 h-4 w-4 text-[#FF8F3F]" />
                      Permissão*
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={String(field.value ?? false)}
                        onValueChange={(val) => {
                          const admin = val === "true";
                          field.onChange(admin);
                          // If admin, set group_id = 0
                          if (admin) {
                            setValue("group_id", 0, { shouldValidate: true });
                          }
                        }}
                      >
                        <SelectTrigger className="h-10 w-full">
                          <SelectValue placeholder="Selecione uma opção" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Nível de acesso</SelectLabel>
                            <SelectItem
                              value="true"
                              className="flex items-center"
                            >
                              <div className="flex items-center">
                                <ShieldAlert className="mr-2 h-4 w-4 text-amber-500" />
                                Administrador
                              </div>
                            </SelectItem>
                            <SelectItem value="false">
                              <div className="flex items-center">
                                <Users className="mr-2 h-4 w-4 text-blue-500" />
                                Usuário padrão
                              </div>
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="group_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Users className="mr-2 h-4 w-4 text-[#FF8F3F]" />
                      Grupo*
                    </FormLabel>
                    <FormControl>
                      {isGroupsLoading ? (
                        <div className="flex items-center justify-center h-10 border rounded-md">
                          <Loader2 className="animate-spin h-4 w-4" />
                        </div>
                      ) : isGroupsError ? (
                        <div className="text-red-500 text-sm p-2 border border-red-300 rounded bg-red-50">
                          Falha ao carregar grupos
                        </div>
                      ) : (
                        <Select
                          disabled={isAdmin === true || isGroupsLoading}
                          value={String(field.value ?? "")}
                          onValueChange={(val) => field.onChange(Number(val))}
                        >
                          <SelectTrigger className="h-10 w-full">
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
                    {isAdmin ? (
                      <FormDescription>
                        Usuários admin já possuem acesso a todos os grupos.
                      </FormDescription>
                    ) : (
                      <></>
                    )}

                    <FormMessage />
                  </FormItem>
                )}
              />

            {/* User Preview Card */}
            {email && (
              <>
                <Separator />
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Pré-visualização do convite:
                  </h3>
                  <Card className="bg-muted/40 border-muted">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{email}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {isAdmin
                              ? "Administrador com acesso total"
                              : selectedGroup
                              ? `Membro do grupo ${formatGroup(
                                  selectedGroup.name
                                )}`
                              : "Aguardando seleção de grupo"}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            isAdmin
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                          }
                        >
                          {isAdmin ? "Admin" : "Usuário"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            <DialogFooter className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="outline"
                className="bg-[#FF8F3F] text-white"
                disabled={isInviting || !isValid || !isDirty}
              >
                {isInviting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Convidando...
                  </>
                ) : (
                  <>
                    Convidar usuário
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
