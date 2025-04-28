import { useState } from "react";
import axiosInstance from "@/lib/axios";
import { useApiBase } from "./api/useApiBase";
import { InviteRequest, UserResponse, UsersResponse } from "@/types/User";

// Hook para obter o usuário atual (usando SWR)
export function useCurrentUser() {
  const { data, error, isLoading } = useApiBase<{ user: UserResponse }>(
    `/accounts/users`
  );
  return {
    user: data?.user ?? null,
    isLoading,
    isError: error ? String(error) : null,
  };
}

// Hook para obter um usuário por ID (usando SWR)
export function useUserById(id: string) {
  const { data, error, isLoading } = useApiBase<{ user: UserResponse }>(
    `/accounts/users/?id=${id}`
  );
  return {
    user: data?.user ?? null,
    isLoading,
    isError: error ? String(error) : null,
  };
}

// Hook para listar todos os usuários (usando SWR)
export function useUserList() {
  const { data, error, isLoading } = useApiBase<UsersResponse>(
    `/accounts/users/?list`
  );
  return {
    users: data?.users ?? [], // garante um array mesmo se der erro
    isLoading,
    isError: error ? String(error) : null,
  };
}

export function useUser() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (user: UserResponse, token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post(
        `/accounts/users/?token=${token}`,
        {
          user,
        }
      );
      return response;
    } catch (error: any) {
      setError(
        error.response?.data?.detail || "Ocorreu um erro ao criar usuário"
      );
      throw new Error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const invite = async (user: InviteRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post(`/accounts/users/invite`, {
        user,
      });
      return response;
    } catch (error: any) {
      setError(
        error.response?.data?.detail || "Ocorreu um erro ao convidar usuário"
      );
      throw new Error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const del = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.delete(
        `/accounts/users/?id=${id}`,
        {}
      );
      return response;
    } catch (error: any) {
      setError(
        error.response?.data?.detail || "Ocorreu um erro ao deletar usuário"
      );
      throw new Error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, create, invite, del };
}