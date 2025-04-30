import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { useApiBase } from "./api/useApiBase";
import { Group } from "@/types/User";
import { Login } from "@/types/Auth";

// Hook para obter grupos de autorização (usando SWR)
export function useAuthGroups() {
  const { data, error, isLoading } = useApiBase<Group>(`/accounts/groups/`);
  return {
    groups: data ?? [],
    isLoading,
    isError: error ? String(error) : null,
  };
}

// Hook para operações de autenticação (login/logout)
export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (login: Login) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post("/accounts/token/", login);
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
      const response = await axiosInstance.post("/accounts/token/logout/", {});
      router.push("/dashboard");
      return response;
    } catch (error: any) {
      setError(
        error.response?.data?.detail || "Ocorreu um erro ao efetuar o logout"
      );
      throw new Error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, login, logout };
}