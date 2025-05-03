import { useState } from "react";
import axiosInstance from "@/lib/axios";
import { useApiBase } from "./api/useApiBase";
import type {
  OrderRequest,
  OrderResponse,
  OrdersResponse,
  OrderStatus,
  OrderUpdateRequest,
  OrderWithAddress,
} from "@/types/Order";
import { PaymentMethodsResponse } from "@/types/PaymentMethod";
import { CustomerResponse } from "@/types/Customer";
import { count } from "console";
import { handleApiError } from "./api/apiErrorHandler";

// Hook para obter uma ordem por ID (usando SWR)
export function useOrderById(id: string) {
  const { data, error, isLoading } = useApiBase<CustomerResponse>(
    `/Customers/?id=${id}`
  );
  return {
    customer: data ?? null,
    isLoading,
    isError: error ? String(error) : null,
  };
}



// Hook para listar todas as ordenqs (usando SWR)
export function useOrderList(page = 1, page_size = 10) {
  const { data, error, isLoading, mutate } = useApiBase<{
    count: number;
    orders: OrderResponse[];
  }>(`/orders/?list&page=${page}&page_size=${page_size}`);
  return {
    mutate,
    totalItems: data?.count ?? 0,
    orders: data?.orders ?? [], // garante um array mesmo se der erro
    isLoading,
    isError: error ? String(error) : null,
  };
}

// Hook para obter métodos de pagamento (usando SWR)
export function usePaymentMethods() {
  const { data, error, isLoading } = useApiBase<PaymentMethodsResponse>(
    `/orders/payment-methods/`
  );
  return {
    paymentMethods: data?.payment_methods ?? [],
    isLoading,
    isError: error ? String(error) : null,
  };
}

// Hook para obter status de ordens (usando SWR)
export function useOrderStatus() {
  const { data, error, isLoading } = useApiBase<OrderStatus>(`/orders/status/`);
  return {
    orderStatus: data?.order_status ?? [],
    isLoading,
    isError: error ? String(error) : null,
  };
}

// Hook para operações de mutação (POST, DELETE)
export function useOrder() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (order: OrderRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post(`/orders/`, order);
      return response;
    } catch (error) {
      const formattedError = handleApiError(error);
      setError(formattedError.message);
      throw formattedError;
    } finally {
      setIsLoading(false);
    }
  };

  const update = async (order: OrderUpdateRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.patch(`/orders/`, 
        order,
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

  const createWithAddress = async (order: OrderWithAddress) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post(`/orders/`, {
        order,
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
      const response = await axiosInstance.delete(`/orders/?id=${id}`, {});
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
    update,
    isLoading,
    error,
    create,
    createWithAddress,
    del,
  };
}
