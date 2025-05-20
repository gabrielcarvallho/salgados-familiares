"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { useApiBase } from "./api/useApiBase";
import { Login, User } from "@/types/Auth";
import { handleApiError } from "./api/apiErrorHandler";
import { Group } from "@/types/User";

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
      const response = await axiosInstance.post("/accounts/token/", loginData);
  
      const {user} = response.data
  
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
      
      const homePage = getHomePage(user.group_id)
  
      console.log(homePage)
  
      router.push(homePage);
  
      return true;
    } catch (err) {
      const formattedError = handleApiError(err);
      setError(
        formattedError.message || "Falha no login. Verifique suas credenciais."
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await axiosInstance.post("/accounts/token/logout/");
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
