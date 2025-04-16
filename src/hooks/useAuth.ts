import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { useApiBase } from "./api/useApiBase";
import { Groups } from "@/types/User";
import { Login } from "@/types/Auth";

export function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (login: Login) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post("/accounts/token/", {
        login,
      });
      router.push("/dashboard");
      return true;
    } catch (error: any) {
      setError(
        error.response?.data?.detail || "Ocorreu um erro ao efetuar o login"
      );
      throw new Error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post("/accounts/token/logout", {});
      router.push("/dashboard");
      return response;
    } catch (error: any) {
      setError(
        error.response?.data?.detail || "Ocorreu um erro ao efetuar o login"
      );
      throw new Error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAuthGroups = (id: string) => {
    const { data, error, isLoading } = useApiBase<Groups>(`/accounts/groups/`);
    return {
      group: data?.groups ?? [],
      isLoading,
      isError: error ? String(error) : null,
    };
  };

  return { isLoading, error, login, logout, getAuthGroups };
}
