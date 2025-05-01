import { useState } from "react";
import axiosInstance from "@/lib/axios";
import { useApiBase } from "./api/useApiBase";
import type {
  OrderRequest,
  OrderResponse,
  OrdersResponse,
  OrderStatus,
  OrderWithAddress,
} from "@/types/Order";
import { PaymentMethodsResponse } from "@/types/PaymentMethod";

// Hook para obter uma ordem por ID (usando SWR)
export function useOrderById(id: string) {
  const { data, error, isLoading } = useApiBase<OrderResponse>(
    `/Customers/?id=${id}`
  );
  return {
    customer: data ?? null,
    isLoading,
    isError: error ? String(error) : null,
  };
}

// Hook para listar todas as ordens (usando SWR)
export function useOrderList() {
  const { data, error, isLoading } =
    useApiBase<OrdersResponse>(`/orders/?list`);
  return {
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
  const { data, error, isLoading } = useApiBase<OrderStatus>(
    `/orders/status/`
  );
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
      const response = await axiosInstance.post(`/orders/`, {
        order,
      });
      return response;
    } catch (error: any) {
      setError(
        error.response?.data?.detail || "Ocorreu um erro ao criar ordem"
      );
      throw new Error(error);
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
    } catch (error: any) {
      setError(
        error.response?.data?.detail ||
          "Ocorreu um erro ao criar ordem com endereço"
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
      const response = await axiosInstance.delete(`/orders/?id=${id}`, {});
      return response;
    } catch (error: any) {
      setError(
        error.response?.data?.detail || "Ocorreu um erro ao deletar ordem"
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
    createWithAddress,
    del,
  };
}
