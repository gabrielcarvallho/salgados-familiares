"use client";

import { useState, useCallback } from "react";
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
import { DrawerFormProvider } from "@/hooks/contexts/DrawerFormContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProductionSchedule } from "@/hooks/useStatistics";
import { formatOrderStatus } from "@/lib/utils";
import { SelectPortal } from "@radix-ui/react-select";
import { SalgadosList } from "./SalgadosList";

export default function OrdersPage() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Hooks called unconditionally at top
  const { productionSchedule } = useProductionSchedule();
  const { orderStatus: orderStatuses = [] } = useOrderStatus();

  const { update, error: updateError } = useOrder();
  const { orders, isLoading, isError, totalItems, mutate } = useOrderList(
    pagination.pageIndex + 1,
    pagination.pageSize
  );

  // formMethods and drawerConfig also unconditionally
  const formMethods = useForm<OrderUpdateRequest>();
  const drawerConfig = useDrawerConfig();

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
      mutate();
    } catch (error) {
      toast.error("Falha ao atualizar pedido.", {
        description: updateError || String(error),
        duration: 3000,
      });
      throw error;
    }
  };

  // Filtra os pedidos antes de passar ao DataTable
  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => String(o.order_status.id) === statusFilter);

  return (
    <div className="flex flex-col gap-4">
      <SiteHeader
        title="Logística"
        button={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44">
              <SelectValue>
                {statusFilter === "all"
                  ? "Todos os status"
                  : orderStatuses.find((s) => String(s.id) === statusFilter)
                      ?.description}
              </SelectValue>
            </SelectTrigger>
            <SelectPortal>
              <SelectContent position="popper">
                <SelectItem value="all">Todos</SelectItem>
                {orderStatuses.map((st) => (
                  <SelectItem key={st.id} value={String(st.id)}>
                    {formatOrderStatus(st.description)}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectPortal>
          </Select>
        }
      />

      <SalgadosList salgados={productionSchedule}/>

      {/* Filtro de Status */}

      {isLoading ? (
        <ProductsSkeletonLoading />
      ) : isError ? (
        <div className="p-4 text-center text-red-500">
          Erro ao carregar pedidos: {String(isError)}
        </div>
      ) : (
        <DrawerFormProvider formMethods={formMethods}>
          <DataTable<OrderResponse, OrderUpdateRequest>
            title="Pedidos"
            columns={columns}
            data={filteredOrders || []}
            totalCount={filteredOrders?.length || 0}
            pageSize={pagination.pageSize}
            currentPage={pagination.pageIndex}
            onUpdate={handleUpdateOrder}
            onPaginationChange={handlePaginationChange}
            mutate={mutate}
            drawerConfig={drawerConfig}
          />
        </DrawerFormProvider>
      )}
    </div>
  );
}
