"use client";

import { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DataTable } from "@/components/datatable";
import { SiteHeader } from "@/components/site-header";
import { ProductsSkeletonLoading } from "@/components/skeleton";
import { columns, useDrawerConfig } from "./data-config";

import { useOrder, useOrderList, useOrderStatus } from "@/hooks/useOrder";
import {
  OrderResponse,
  OrderUpdateRequest,
  orderUpdateRequestSchema,
} from "@/types/Order";

export default function OrdersPage() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const { update, error: updateError } = useOrder();
  const { orderStatus } = useOrderStatus();
  const {
    orders = [],
    isLoading,
    isError,
    totalItems,
    mutate,
  } = useOrderList(pagination.pageIndex + 1, pagination.pageSize);

  const drawerConfig = useDrawerConfig();
  const handlePaginationChange = useCallback((newPagination: any) => {
    setPagination({
      pageIndex: newPagination.pageIndex,
      pageSize: newPagination.pageSize,
    });
  }, []);

  const entregue = orderStatus.find((o) => o.sequence_order === 3)?.id;

  // 1) filtra apenas status 2
  // Apenas pedidos com status "Pronto para entrega": sequence_order=2 e delivery_method="ENTREGA"
  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (o) =>
          o?.order_status?.sequence_order === 2 &&
          (o?.order_status?.delivery_method || "").toUpperCase() === "ENTREGA"
      ),
    [orders]
  );

  // 2) clone + sort ascending pelo table_order (tratando undefined/string)
  const ascendingOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      const ta = Number(a.table_order) || 0;
      const tb = Number(b.table_order) || 0;
      return ta - tb;
    });
  }, [filteredOrders]);

  const handleUpdateOrder = async (
    original: OrderResponse,
    updated: OrderUpdateRequest
  ) => {
    const payload = {
      id: original.id,
      is_delivered: true,
      order_status_id: entregue,
    };

    try {
      await update(payload);
      toast.success("Pedido entregue com sucesso!");
      mutate();
    } catch (error) {
      toast.error("Falha ao atualizar pedido.", {
        description: updateError || String(error),
        duration: 3000,
      });
      throw error;
    }
  };

  const handleSaveOrder = async (tableOrder?: OrderResponse[]) => {
    // Verificar se tableOrder foi fornecido
    if (!tableOrder || tableOrder.length === 0) {
      console.log("Nenhuma ordem para salvar");
      return;
    }

    try {
      const updatePromises = tableOrder.map(async (order, index) => {
        const payload = {
          id: order.id,
          table_order: index + 1, // Usando o campo table_order que já existe
          // ... outros campos necessários se precisar
        };

        return await update(payload);
      });

      await Promise.all(updatePromises);

      // Opção 3: Se você só precisa salvar a ordem localmente
      // e não tem um campo específico no backend
      console.log(
        "Nova ordem dos pedidos:",
        tableOrder.map((order, index) => ({
          id: order.id,
          table_order: index + 1,
          delivery_date: order.delivery_date,
        }))
      );

      toast.success("Ordem dos pedidos salva com sucesso!");
      mutate(); // Recarrega os dados
    } catch (error) {
      console.error("Erro ao salvar ordem:", error);
      toast.error("Falha ao salvar ordem dos pedidos.", {
        description: String(error),
        duration: 3000,
      });
      throw error; // Re-throw para que a DataTable possa lidar com o erro
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <SiteHeader title="Entregas" />

      {isLoading ? (
        <ProductsSkeletonLoading />
      ) : isError ? (
        <div className="p-4 text-center text-red-500">
          Erro ao carregar pedidos: {String(isError)}
        </div>
      ) : (
        <DataTable<OrderResponse, OrderUpdateRequest>
          updateSchema={orderUpdateRequestSchema}
          drawerConfig={drawerConfig}
          title="Pedidos esperando por entrega"
          columns={columns}
          /** passe *sempre* o ascendingOrders memoizado */
          data={ascendingOrders}
          totalCount={totalItems}
          pageSize={pagination.pageSize}
          currentPage={pagination.pageIndex}
          onUpdate={handleUpdateOrder}
          onSaveOrder={handleSaveOrder}
          onPaginationChange={handlePaginationChange}
          mutate={mutate}
          saveButtonText="Finalizar entrega"
          savingButtonText="Finalizando..."
          enableDragAndDrop
          dragHandle
        />
      )}
    </div>
  );
}
