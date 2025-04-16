import { useState } from "react";
import axiosInstance from "@/lib/axios";
import { useApiBase } from "./api/useApiBase";
import type {
  AddressUpdate,
  Costumer,
  Costumers,
  CostumerUpdate,
} from "@/types/Costumer";

export function Costumer() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (costumer: Costumer) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post(`/costumers/`, {
        costumer,
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

  const update = async (costumer: CostumerUpdate) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.patch(`/costumers/`, {
        costumer,
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

  const updateAddress = async (address: AddressUpdate) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.patch(`/costumers/address/`, {
        address,
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

  const getById = (id: string) => {
    const { data, error, isLoading } = useApiBase<{ costumer: Costumer }>(
      `/costumers/?id=${id}`
    );
    return {
      costumer: data?.costumer ?? null,
      isLoading,
      isError: error ? String(error) : null,
    };
  };

  const getList = () => {
    const { data, error, isLoading } =
      useApiBase<Costumers>(`/costumers/?list`);
    return {
      costumers: data?.costumers ?? [], // garante um array mesmo se der erro
      isLoading,
      isError: error ? String(error) : null,
    };
  };

  const del = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.delete(`/costumers/?id=${id}`, {});
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

  const delAddress = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.delete(
        `/costumers/address/?id=${id}`,
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

  return {
    isLoading,
    error,
    getById,
    getList,
    create,
    update,
    del,
    delAddress,
    updateAddress,
  };
}
