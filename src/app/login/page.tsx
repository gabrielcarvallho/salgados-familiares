"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function LoginForm() {
  const { login, isLoading, error: errorLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const authSchema = z.object({
    email: z.string().email().min(1, "Email é obrigatório"),
    password: z.string().min(1, "Insira uma senha válida"),
  });

  type AuthSchema = z.infer<typeof authSchema>;

  const form = useForm<AuthSchema>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    formState: { errors },
  } = form;

  const handleLogin = async (data: AuthSchema) => {
    try {
      const loginSuccess = await login(data); // Verifica o retorno da função
      
      if (loginSuccess) {
        // Só mostra o toast de sucesso se o login realmente foi bem-sucedido
        toast.success("Sucesso ao iniciar sessão!", {
          description: "Estamos te conectando...",
          duration: 3000,
        });
      }
      toast.error("Falha ao iniciar sessão.", {
        description: "Erro de conexão. Tente novamente mais tarde",
        duration: 3000,
      
      });
      // Se loginSuccess for false, o bloco catch dentro da função login já tratou o erro
      // e definiu o erro no state, então não precisamos fazer nada aqui
    } catch (error) {
      toast.error("Falha ao iniciar sessão.", {
        description: errorLogin || String(error),
        duration: 3000,
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Iniciar-sessão</CardTitle>
            <CardDescription>
              Insira seu e-mail e senha para acessar o sistema.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <div className="flex flex-col gap-2">
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input
                            disabled={isLoading}
                            placeholder="Insira seu e-mail"
                            {...field}
                          />
                        </FormControl>
                        {errors.email && (
                          <p className="text-red-500 text-sm">
                            {errors.email.message}
                          </p>
                        )}
                      </FormItem>
                    </div>
                  )}
                />
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <div className="flex flex-col gap-2 ">
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                disabled={isLoading}
                                type={showPassword ? "text" : "password"}
                                placeholder="Insira sua senha"
                                {...field}
                              />
                            </FormControl>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                                    onClick={togglePasswordVisibility}
                                  >
                                    {showPassword ? (
                                      <EyeOff className="h-5 w-5" />
                                    ) : (
                                      <Eye className="h-5 w-5" />
                                    )}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Espiar senha</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          {errors.password && (
                            <p className="text-red-500 text-sm">
                              {errors.password.message}
                            </p>
                          )}
                        </FormItem>
                        <Link
                          href="/forgot-password"
                          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                        >
                          Esqueceu a senha?
                        </Link>
                      </div>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="my-4 flex flex-col space-y-4">
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full text-white cursor-pointer bg-[#FF8F3F]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
  );
}
