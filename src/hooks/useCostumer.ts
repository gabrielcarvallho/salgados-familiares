import { useState } from "react";
import axiosInstance from "@/lib/axios";
import { useApiBase } from "./api/useApiBase";
import type {
  AddressUpdate,
  CustomerRequest,
  CustomerResponse,
  CustomerUpdateRequest,
} from "@/types/Customer";

// Hook para obter um cliente por ID (usando SWR)
export function useCustomerById(id: string) {
  const { data, error, isLoading } = useApiBase<{ Customer: CustomerRequest }>(
    `/Customers/?id=${id}`
  );
  return {
    Customer: data?.Customer ?? null,
    isLoading,
    isError: error ? String(error) : null,
  };
}


export function useCustomerList(page = 1, page_size = 10) {
  const { data, error, isLoading } = useApiBase<{
    count: number;
    customers: CustomerResponse[]; // Alterado de 'results' para 'products'
  }>(`/customers/?list&page=${page}&page_size=${page_size}`);

  
  return {
    data,
    customers: data?.customers ?? [], // Acessa a propriedade correta
    totalItems: data?.count ?? 0,
    isLoading,
    isError: error ? String(error) : null,
  };
}

export function useCustomer() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (Customer: CustomerRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post(`/customers/`, 
        Customer,
      );
      return response;
    } catch (error: any) {
      setError(
        error.response?.data?.detail || "Ocorreu um erro ao criar cliente"
      );
      throw new Error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const update = async (Customer: CustomerUpdateRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.patch(`/customers/`,
        Customer,
      );
      return response;
    } catch (error: any) {
      setError(
        error.response?.data?.detail || "Ocorreu um erro ao atualizar cliente"
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
      const response = await axiosInstance.patch(`/customers/address/`, {
        address,
      });
      return response;
    } catch (error: any) {
      setError(
        error.response?.data?.detail || "Ocorreu um erro ao atualizar endereço"
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
      const response = await axiosInstance.delete(`/customers/?id=${id}`, {});
      return response;
    } catch (error: any) {
      setError(
        error.response?.data?.detail || "Ocorreu um erro ao deletar cliente"
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
        `/customers/address/?id=${id}`,
        {}
      );
      return response;
    } catch (error: any) {
      setError(
        error.response?.data?.detail || "Ocorreu um erro ao deletar endereço"
      );
      throw new Error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    create,
    update,
    updateAddress,
    del,
    delAddress,
  };
}
