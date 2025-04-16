import { useState } from "react";
import axiosInstance from "@/lib/axios";
import { useApiBase } from "./api/useApiBase";
import type { Invite, User, Users } from "@/types/User";

export function User() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (user: User, token: string) => {
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

  const getUser = () => {
    const { data, error, isLoading } = useApiBase<{ user: User }>(
      `/accounts/users`
    );
    return {
      user: data?.user ?? null,
      isLoading,
      isError: error ? String(error) : null,
    };
  };

  const getById = (id: string) => {
    const { data, error, isLoading } = useApiBase<{ user: User }>(
      `/accounts/users/?id=${id}`
    );
    return {
      user: data?.user ?? null,
      isLoading,
      isError: error ? String(error) : null,
    };
  };

  const getList = () => {
    const { data, error, isLoading } = useApiBase<Users>(
      `/accounts/users/?list`
    );
    return {
      users: data?.users ?? [], // garante um array mesmo se der erro
      isLoading,
      isError: error ? String(error) : null,
    };
  };

  const invite = async (user: Invite) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post(`/accounts/users/invite`, {
        user,
      });
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
        error.response?.data?.detail || "Ocorreu um erro ao criar usuário"
      );
      throw new Error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, getById, getList, create, invite, del, getUser };
}
