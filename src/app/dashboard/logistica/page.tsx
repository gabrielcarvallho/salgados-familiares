"use client";

import { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DataTable } from "@/components/datatable";
import { SiteHeader } from "@/components/site-header";
import { SalgadosSkeletonLoading } from "./_components/skeleton";
import { ProductsSkeletonLoading } from "@/components/ui/products-skeleton";
import { columns, useDrawerConfig } from "./_components/data-config";
import { useOrder, useOrderList, useOrderStatus } from "@/hooks/useOrder";
import {
  OrderRequest,
  type OrderResponse,
  type OrderUpdateRequest,
  orderUpdateRequestSchema,
} from "@/types/Order";
import { DrawerFormProvider } from "@/contexts/DrawerFormContext";
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
import { SalgadosList } from "./_components/SalgadosList";

export default function OrdersPage() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Hooks called unconditionally at top
  const { productionSchedule, isLoading: isLoadingSchedule } =
    useProductionSchedule();
  const { orderStatus: orderStatuses = [] } = useOrderStatus();

  const { update, error: updateError, del } = useOrder();
  const {
    orders,
    isLoading: isLoadingOrders,
    isError,
    totalItems,
    mutate,
  } = useOrderList(pagination.pageIndex + 1, pagination.pageSize);

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

  const handleDeleteOrder = async (item: string) => {
    try {
      await del(item);
      toast.success("Pedido exlcuido com sucesso!");
      mutate();
    } catch (error) {
      toast.error("Falha ao excluir pedido", {
        description: updateError || String(error),
        duration: 3000,
      });
      throw error;
    }
  };

  // Filtra os pedidos antes de passar ao DataTable
  const filteredOrders = (orders || []).filter(
    (o: { order_status: { identifier: number; id: any } }) => {
      // exclui identifier 0
      if (o.order_status.identifier === 0) return false;

      // aplica o filtro de dropdown (se for "all", não filtra por id)
      return (
        statusFilter === "all" || String(o.order_status.id) === statusFilter
      );
    }
  );

  const ascendingOrders = useMemo(() => {
    if (!filteredOrders || !Array.isArray(filteredOrders)) return [];
    
    return [...filteredOrders].sort((a, b) => {
      // Conversão segura para números
      const orderA = Number(a.order_number) || 0;
      const orderB = Number(b.order_number) || 0;
      
      // Ordenação ascendente (1, 2, 3, 4...)
      return orderA - orderB;
    });
  }, [filteredOrders]);
  

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
                {orderStatuses
                  .filter((st) => st.identifier !== 0) // remove identifier 0
                  .map((st) => (
                    <SelectItem key={st.id} value={String(st.id)}>
                      {formatOrderStatus(st.description)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </SelectPortal>
          </Select>
        }
      />

      {isLoadingSchedule ? (
        <SalgadosSkeletonLoading />
      ) : (
        <SalgadosList salgados={productionSchedule || []} />
      )}

      {isLoadingOrders ? (
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
            data={ascendingOrders || []}
            totalCount={filteredOrders?.length || 0}
            pageSize={pagination.pageSize}
            currentPage={pagination.pageIndex}
            onUpdate={handleUpdateOrder}
            onPaginationChange={handlePaginationChange}
            mutate={mutate}
            drawerConfig={drawerConfig}
            updateSchema={orderUpdateRequestSchema}
            onDelete={(item) => handleDeleteOrder(item.id)}
          />
        </DrawerFormProvider>
      )}
    </div>
  );
}
