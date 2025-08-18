"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site-header";
import { DataTable } from "@/components/datatable";
import { OrdersSkeletonLoading } from "@/components/ui/base-skeleton";
import { ProductsSkeletonLoading } from "@/components/ui/products-skeleton";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectPortal } from "@radix-ui/react-select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Logística (Pedidos)
import {
  columns as orderColumns,
  useDrawerConfig as useOrderDrawerConfig,
} from "./_components/data-config";
import { SalgadosSkeletonLoading } from "./_components/skeleton";
import { useOrder, useOrderList, useOrderStatus } from "@/hooks/useOrder";
import {
  type OrderResponse,
  type OrderUpdateRequest,
  orderUpdateRequestSchema,
} from "@/types/Order";
import { DrawerFormProvider } from "@/contexts/DrawerFormContext";
import { useProductionSchedule } from "@/hooks/useStatistics";
import { formatOrderStatus } from "@/lib/utils";

// Produção
import { DialogProduction } from "./_components/DialogProduction";
import {
  productionColumns,
  useProductionDrawerConfig,
} from "./_components/production-data";
import {
  type ProductionRecord,
  type ProductionUpdate,
  productionUpdateSchema,
} from "@/types/Production";
import { useProduction, useProductionList } from "@/hooks/useProduction";
import DatePicker from "@/components/ui/date-picker"; // string yyyy-mm-dd

export default function LogisticsPage() {
  // ---------------------------
  // Hooks NO TOPO (ordem estável)
  // ---------------------------
  // Logística (Pedidos)
  const [orderPagination, setOrderPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const orderFormMethods = useForm<OrderUpdateRequest>();
  const orderDrawerConfig = useOrderDrawerConfig();

  const { orderStatus: orderStatuses = [] } = useOrderStatus();
  const {
    update: updateOrder,
    error: updateOrderError,
    del: deleteOrder,
  } = useOrder();
  const {
    orders,
    isLoading: isLoadingOrders,
    isError: orderListError,
    mutate: orderMutate,
  } = useOrderList(orderPagination.pageIndex + 1, orderPagination.pageSize);

  // Produção
  const [prodPageIndex, setProdPageIndex] = useState(0);
  const prodPageSize = 10;

  const [prodStart, setProdStart] = useState<string>("");
  const [prodEnd, setProdEnd] = useState<string>("");

  const productionDrawerConfig = useProductionDrawerConfig();
  const { update: updateProduction, del: deleteProduction } = useProduction();
  const {
    records: productionRecords,
    totalItems: productionTotalItems,
    isLoading: isLoadingProduction,
    isError: productionListError,
    mutate: productionMutate,
  } = useProductionList(
    prodStart || undefined,
    prodEnd || undefined,
    prodPageIndex + 1,
    prodPageSize
  );

  // ---------------------------
  // Callbacks estáveis
  // ---------------------------
  const handleOrderPaginationChange = useCallback((newPagination: any) => {
    setOrderPagination({
      pageIndex: newPagination.pageIndex,
      pageSize: newPagination.pageSize,
    });
  }, []);

  const handleUpdateOrder = useCallback(
    async (original: OrderResponse, updated: OrderUpdateRequest) => {
      const payload = { id: original.id, ...updated };
      try {
        await updateOrder(payload);
        toast.success("Pedido atualizado com sucesso!");
        orderMutate();
      } catch (error) {
        toast.error("Falha ao atualizar pedido.", {
          description: updateOrderError || String(error),
          duration: 3000,
        });
        throw error;
      }
    },
    [updateOrder, orderMutate, updateOrderError]
  );

  const handleDeleteOrder = useCallback(
    async (itemId: string) => {
      try {
        await deleteOrder(itemId);
        toast.success("Pedido excluído com sucesso!");
        orderMutate();
      } catch (error) {
        toast.error("Falha ao excluir pedido", {
          description: updateOrderError || String(error),
          duration: 3000,
        });
        throw error;
      }
    },
    [deleteOrder, orderMutate, updateOrderError]
  );

  // CORREÇÃO: comparação correta (===) em vez de atribuição (=)
  const filteredOrders = (orders || []).filter(
    (o: { order_status: { sequence_order: number; id: any } }) => {
      if (o.order_status.sequence_order === 0) return false;
      return (
        statusFilter === "all" || String(o.order_status.id) === statusFilter
      );
    }
  );

  const handleProductionPaginationChange = useCallback((p: any) => {
    setProdPageIndex(p.pageIndex);
  }, []);

  const handleUpdateProduction = useCallback(
    async (original: ProductionRecord, updated: ProductionUpdate) => {
      // Garante consistência de chaves com seus tipos (start_date/end_date/production_items)
      const payload: ProductionUpdate = {
        id: original.id,
        start_date: (updated as any).start_date ?? original.start_date,
        end_date: (updated as any).end_date ?? original.end_date,
        status: (updated as any).status ?? original.status,
        notes: (updated as any).notes ?? original.notes ?? "",
        production_items:
          (updated as any).production_items ?? original.production_items ?? [],
      };
      try {
        await updateProduction(payload);
        toast.success("Registro de produção atualizado!");
        productionMutate();
      } catch (e) {
        toast.error("Falha ao atualizar registro", { description: String(e) });
        throw e;
      }
    },
    [updateProduction, productionMutate]
  );

  const handleDeleteProduction = useCallback(
    async (itemId: string) => {
      try {
        await deleteProduction(itemId);
        toast.success("Registro de produção excluído com sucesso!");
        productionMutate();
      } catch (error) {
        toast.error("Falha ao excluir registro de produção", {
          description: String(error),
          duration: 3000,
        });
        throw error;
      }
    },
    [deleteProduction, productionMutate]
  );

  const applyFilters = useCallback(() => {
    productionMutate();
  }, [productionMutate]);

  const clearFilters = useCallback(() => {
    setProdStart("");
    setProdEnd("");
    setTimeout(() => productionMutate(), 0);
  }, [productionMutate]);

  // ---------------------------
  // Render
  // ---------------------------
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
                  .filter((st) => st.sequence_order !== 0)
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

      <Tabs defaultValue="logistica" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="logistica">Logística</TabsTrigger>
          <TabsTrigger value="producao">Produção</TabsTrigger>
        </TabsList>

        {/* Aba Logística */}
        <TabsContent value="logistica" className="mt-0 space-y-4">
          {isLoadingOrders ? (
            <ProductsSkeletonLoading />
          ) : orderListError ? (
            <div className="p-4 text-center text-red-500">
              Erro ao carregar pedidos: {String(orderListError)}
            </div>
          ) : (
            <DrawerFormProvider formMethods={orderFormMethods}>
              <DataTable<OrderResponse, OrderUpdateRequest>
                title="Pedidos"
                columns={orderColumns}
                data={filteredOrders || []}
                totalCount={filteredOrders?.length || 0}
                pageSize={orderPagination.pageSize}
                currentPage={orderPagination.pageIndex}
                onUpdate={handleUpdateOrder}
                onPaginationChange={handleOrderPaginationChange}
                mutate={orderMutate}
                drawerConfig={orderDrawerConfig}
                updateSchema={orderUpdateRequestSchema}
                onDelete={(item) => handleDeleteOrder(item.id)}
              />
            </DrawerFormProvider>
          )}
        </TabsContent>

        {/* Aba Produção */}
        <TabsContent value="producao" className="mt-0 space-y-4">
          {/* Card de filtros */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 inline-block">
                    Início
                  </label>
                  <DatePicker
                    value={prodStart}
                    onChange={(s) => setProdStart((s || "").slice(0, 10))}
                    placeholder="YYYY-MM-DD"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 inline-block">
                    Fim
                  </label>
                  <DatePicker
                    value={prodEnd}
                    onChange={(s) => setProdEnd((s || "").slice(0, 10))}
                    placeholder="YYYY-MM-DD"
                  />
                </div>
                <div className="flex gap-2 items-end">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full md:w-auto"
                  >
                    Limpar
                  </Button>
                  <Button
                    className="bg-[#FF8F3F] text-white w-full md:w-auto"
                    onClick={applyFilters}
                  >
                    Aplicar filtros
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <DialogProduction />
              </div>
            </div>
          </div>

          {/* Tabela */}
          {isLoadingProduction ? (
            <OrdersSkeletonLoading />
          ) : productionListError ? (
            <div className="p-4 text-center text-red-500">
              Erro ao carregar produção: {productionListError}
            </div>
          ) : (
            <DataTable<ProductionRecord, ProductionUpdate>
              title="Registros de Produção"
              columns={productionColumns}
              data={productionRecords}
              totalCount={productionTotalItems}
              pageSize={prodPageSize}
              currentPage={prodPageIndex}
              onUpdate={handleUpdateProduction}
              onPaginationChange={handleProductionPaginationChange}
              mutate={productionMutate}
              drawerConfig={productionDrawerConfig}
              updateSchema={productionUpdateSchema}
              onDelete={(item) => handleDeleteProduction(item.id)}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
