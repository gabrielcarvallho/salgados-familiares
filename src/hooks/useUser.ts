import { useState } from "react";
import axiosInstance from "@/lib/axios";
import { useApiBase } from "./api/useApiBase";
import {
  CreateUserRequest,
  GroupsResponse,
  InviteRequest,
  PendingInvitations,
  PendingInvitationsResponse,
  UserResponse,
  UsersResponse,
} from "@/types/User";
import { handleApiError } from "./api/apiErrorHandler";

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


export function useUserList(page = 1, page_size = 10) {
  const { data, error, isLoading, mutate } = useApiBase<{
    count: number;
    users: UserResponse[];
  }>(`/accounts/users/?list&page=${page}&page_size=${page_size}`);

  return {
    mutate,
    users: data?.users ?? [],  // <<< campo correto
    totalItems: data?.count ?? 0,
    isLoading,
    isError: error ? String(error) : null,
  };
}

export function useGroupList() {
  const { data, error, isLoading } =
    useApiBase<GroupsResponse>(`/accounts/groups/`);
  return {
    groups: data?.groups ?? [], // garante um array mesmo se der erro
    isLoading,
    isError: error ? String(error) : null,
  };
}


export function usePendingInvitations(page = 1, page_size = 10) {
  const { data, error, isLoading, mutate } = useApiBase<{
    count: number;
    pending_invitations: PendingInvitations[];
  }>(`/accounts/users/invitation/?list&page=${page}&page_size=${page_size}`);

  return {
    mutate,
    invitations: data?.pending_invitations ?? [],  // <<< campo correto
    totalItems: data?.count ?? 0,
    isLoading,
    isError: error ? String(error) : null,
  };
}


export function useUser() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (user: CreateUserRequest, token: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post(
        `/accounts/users/invitation/accepted/?token=${token}`,

        user
      );
      return response;
    } catch (error) {
      const formattedError = handleApiError(error);
      setError(formattedError.message);
      throw formattedError;
    } finally {
      setIsLoading(false);
    }
  };
  const resendInvite = async (token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.put(
        `/accounts/users/invitation/?token=${token}`,
      );
      return response;
    } catch (error: any) {
      setError(
        error.response?.data?.detail || "Ocorreu um erro ao re-enviar convite para o usuário"
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
      const response = await axiosInstance.post(
        `/accounts/users/invitation/`,
        user
      );
      return response;
    } catch (error) {
      const formattedError = handleApiError(error);
      setError(formattedError.message);
      throw formattedError;
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
    } catch (error) {
      const formattedError = handleApiError(error);
      setError(formattedError.message);
      throw formattedError;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, create, invite, del, resendInvite };
}
