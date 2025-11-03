import { useState } from "react";

import { useApiBase } from "./api/useApiBase";
import type {
  OrderRequest,
  OrderResponse,
  OrderStatus,
  OrderUpdateRequest,
} from "@/types/Order";
import { PaymentMethodsResponse } from "@/types/PaymentMethod";
import { CustomerResponse } from "@/types/Customer";
import { handleApiError } from "./api/apiErrorHandler";
import api from "@/lib/axios";

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
export function useOrderStatus(deliveryMethod?: string) {
  const { data, error, isLoading } = useApiBase<OrderStatus>(
    `/orders/status/?delivery_method=${deliveryMethod}`
  );
  return {
    orderStatus: data?.status ?? [], // ✅ Mudança aqui: era order_status, agora é status
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
      const response = await api.post(`/orders/`, order);
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
      const response = await api.patch(`/orders/`, order);
      return response;
    } catch (error) {
      const formattedError = handleApiError(error);
      setError(formattedError.message);
      throw formattedError;
    } finally {
      setIsLoading(false);
    }
  };

  const createWithAddress = async (order: OrderRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post(`/orders/`, order);
      return response;
    } catch (error) {
      const formattedError = handleApiError(error);
      setError(formattedError.message);
      throw formattedError;
    } finally {
      setIsLoading(false);
    }
  };

  const finishWork = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await api.patch(`/orders/finish-work/`);
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
      const response = await api.delete(`/orders/?id=${id}`, {});
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
    finishWork,
  };
}
