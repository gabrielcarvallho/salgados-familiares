"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { CreateUserRequest, createUserRequestSchema } from "@/types/User";
import { useUser } from "@/hooks/useUser";

interface RegisterFormProps {
    token: string
}

export default function RegisterFormClient({ token }: RegisterFormProps) {
  const router = useRouter();
  const { create, isLoading, error: registerError } = useUser();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<CreateUserRequest>({
    resolver: zodResolver(createUserRequestSchema),
    defaultValues: {
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  const {
    formState: { errors },
  } = form;

  const handleRegister = async (data: CreateUserRequest) => {
    try {
      await create(data, token || "");
      toast.success("Sucesso ao registrar!", {
        description: "Você está sendo redirecionado para página de login.",
        duration: 3000,
      });
      router.push("/login");
    } catch (error) {
      toast.error("Falha ao registrar usuário.", {
        description: registerError || String(error),
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
          <CardTitle className="text-2xl font-bold">Registrar</CardTitle>
          <CardDescription>
            Insira seu e-mail e senha para fazer seu registro no sistema.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleRegister)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
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
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
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
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm">
                        {errors.password.message}
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar senha</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          type={showPassword ? "text" : "password"}
                          placeholder="Repita sua senha"
                          {...field}
                        />
                      </FormControl>
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
                    </div>
                    {errors.confirm_password && (
                      <p className="text-red-500 text-sm">
                        {errors.confirm_password.message}
                      </p>
                    )}
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="my-4 flex flex-col space-y-4">
              <Button
                type="submit"
                variant="outline"
                className="w-full text-white bg-[#FF8F3F]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar conta"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
