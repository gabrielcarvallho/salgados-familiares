"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useApiBase } from "./api/useApiBase";
import { Login, User } from "@/types/Auth";
import { handleApiError } from "./api/apiErrorHandler";
import { Group } from "@/types/User";
// import api from "@/lib/axios";
import api from "@/lib/axios";

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

  const login = async (loginData: Login) => {
    setIsLoading(true);
    setError(null);
  
    try {
      // 1) Faz o login
      const response = await api.post("/accounts/token/", loginData);

      const { user } = response.data;

      const getHomePage = (groupId: number | null | undefined) => {
        switch (groupId) {
          case 5:
            return "/dashboard/pedidos";
          case 7:
            return "/dashboard/entrega";
          default:
            return "/dashboard/";
        }
      };

      const homePage = getHomePage(user.group_id);

      router.push(homePage);
      return true;
    } catch (err) {
      const formattedError = handleApiError(err);
      setError(
        formattedError.message || "Falha no login. Verifique suas credenciais."
      );
      throw new Error(formattedError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await api.post("/accounts/token/logout/");
      router.push("/login");
      return true;
    } catch (error) {
      const formattedError = handleApiError(error);
      setError(formattedError.message);
      throw formattedError;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, login, logout };
}
