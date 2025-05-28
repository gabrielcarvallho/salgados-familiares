import { useState } from "react";

import { useApiBase } from "./api/useApiBase";
import {
  CreateUserRequest,
  GroupsResponse,
  InviteRequest,
  UserResponse,
  UsersResponse,
} from "@/types/User";
import { ProductionScheduleResponse } from "@/types/Logistics";
import { ReportResponse } from "@/types/Reports";
import api from "@/lib/axios";

// Hook para obter o usuário atual (usando SWR)
export function useProductionSchedule() {
  const { data, error, isLoading } = useApiBase<{
    production_schedule: ProductionScheduleResponse[];
  }>(`/logistic`);
  return {
    productionSchedule: data?.production_schedule ?? [],
    isLoading,
    isError: error ? String(error) : null,
  };
}

// Hook para obter um usuário por ID (usando SWR)
export function useReports(days: number) {
  const { data, error, isLoading } = useApiBase<{ report: ReportResponse }>(
    `/reports/?days=${days}`
  );
  return {
    reports: data?.report ?? null,
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

export function useGroupList() {
  const { data, error, isLoading } =
    useApiBase<GroupsResponse>(`/accounts/groups/`);
  return {
    groups: data?.groups ?? [], // garante um array mesmo se der erro
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
      const response = await api.post(
        `/accounts/users/invitation/accepted/?token=${token}`,

        user
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
      const response = await api.post(`/accounts/users/invitation/`, user);
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
      const response = await api.delete(`/accounts/users/?id=${id}`, {});
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
