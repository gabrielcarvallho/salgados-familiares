import { useState } from "react";
import axiosInstance from "@/lib/axios";
import { useApiBase } from "./api/useApiBase";
import type {
  AddressUpdate,
  CustomerRequest,
  CustomerResponse,
  CustomerUpdateRequest,
} from "@/types/Customer";
import { handleApiError } from "./api/apiErrorHandler";

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
  const { data, error, isLoading, mutate } = useApiBase<{
    count: number;
    customers: CustomerResponse[]; // Alterado de 'results' para 'products'
  }>(`/customers/?list&page=${page}&page_size=${page_size}`);

  
  return {
    mutate,
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
    } catch (error) {
      const formattedError = handleApiError(error);
      setError(formattedError.message);
      throw formattedError;
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
    } catch (error) {
      const formattedError = handleApiError(error);
      setError(formattedError.message);
      throw formattedError;
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
      const response = await axiosInstance.delete(`/customers/?id=${id}`, {});
      return response;
    } catch (error) {
      const formattedError = handleApiError(error);
      setError(formattedError.message);
      throw formattedError;
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
    } catch (error) {
      const formattedError = handleApiError(error);
      setError(formattedError.message);
      throw formattedError;
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
