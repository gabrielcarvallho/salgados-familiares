"use client";

import { DataTable } from "@/components/datatable";
import { SiteHeader } from "@/components/site-header";
import { DialogPedidos } from "./dialog";
import { ProductsSkeletonLoading } from "@/components/skeleton";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { columns, getOrderDrawerConfig } from "./data-config";
import { useOrder, useOrderList } from "@/hooks/useOrder";
import { OrderResponse, OrderUpdateRequest, orderUpdateRequestSchema } from "@/types/Order";

export default function OrdersPage() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { update, error: updateError } = useOrder();
  const { orders, isLoading, isError, totalItems, mutate } = useOrderList(
    pagination.pageIndex + 1,
    pagination.pageSize
  );

  // No handlePaginationChange:
  const handlePaginationChange = useCallback((newPagination: any) => {
    setPagination({
      pageIndex: newPagination.pageIndex,
      pageSize: newPagination.pageSize,
    });
  }, []);

  const handleUpdateOrder = async (
    original: OrderResponse,
    updated: OrderUpdateRequest
  ) => {
    const payload = {
      id: original.id,
      ...updated,
    };

    try {
      await update(payload);
      toast.success("Pedido atualizado com sucesso!");
      mutate()
    } catch (error) {
      toast.error("Falha, tente novamente mais tarde!", {
        description: updateError || String(error),
        duration: 3000,
      });      
      throw error;
    }
  };

  const drawerConfig = getOrderDrawerConfig();


  return (
    <div>
      <div className="flex flex-col gap-4">
        <SiteHeader title="Pedidos" button={<DialogPedidos />} />

        {isLoading ? (
          <ProductsSkeletonLoading />
        ) : isError ? (
          <div className="p-4 text-center text-red-500">
            Erro ao carregar pedidos: {isError}
          </div>
        ) : (
          <DataTable<OrderResponse, OrderUpdateRequest>
            updateSchema={orderUpdateRequestSchema}
            drawerConfig={drawerConfig}
            title="Pedidos"
            columns={columns}
            data={orders || []}
            totalCount={totalItems || 0}
            pageSize={pagination.pageSize}
            currentPage={pagination.pageIndex}
            onUpdate={handleUpdateOrder}
            onPaginationChange={handlePaginationChange}
          />
        )}
      </div>
    </div>
  );
}