"use client";

import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/datatable";
import { SiteHeader } from "@/components/site-header";
import { OrdersSkeletonLoading } from "@/components/ui/base-skeleton";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { DialogProdutos } from "./_components/dialog";
import { DialogStockManager } from "./_components/dialog-stock";

import { useProduct, useProductList } from "@/hooks/useProduct";
import { useStock, useStockList } from "@/hooks/useStock";

import { ProductResponse, productUpdateRequestSchema } from "@/types/Product";

import {
  columns as productColumns,
  useDrawerConfig as useProductDrawerConfig,
} from "./_components/data-config";

import { stockColumns, useStockDrawerConfig } from "./_components/stock-data";

import type { PaginationType } from "@/types/User";
import { stockConfigUpdateSchema, StockListItem } from "@/types/Stock";

// UI para filtro
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type ProductStatusFilter = "active" | "inactive" | "all";

export default function ProductsPage() {
  // ---------------------------
  // Produtos: paginação e hooks
  // ---------------------------
  const [pagination, setPagination] = useState<PaginationType>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Filtro de status (default: active)
  const [statusFilter, setStatusFilter] =
    useState<ProductStatusFilter>("active");

  const productDrawerConfig = useProductDrawerConfig();
  const {
    update: productUpdate,
    error: productUpdateError,
    del: productDelete,
    error: productDeleteError,
  } = useProduct();

  // Hook de produtos com filtro de status
  const {
    data: productData,
    isLoading: loadingProducts,
    isError: productListError,
    totalItems: productTotalItems,
    mutate: productMutate,
  } = useProductList(
    statusFilter,
    pagination.pageIndex + 1,
    pagination.pageSize
  );

  const handlePaginationChange = useCallback(
    (newPagination: PaginationType) => {
      setPagination({
        pageIndex: newPagination.pageIndex,
        pageSize: newPagination.pageSize,
      });
    },
    []
  );

  // Mudar status: reseta paginação e refetch
  const handleChangeStatus = (val: string) => {
    const mapped = (val as ProductStatusFilter) ?? "active";
    setStatusFilter(mapped);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    // productMutate será chamado automaticamente pelo hook se ele observar os args
    // Se necessário forçar, descomente:
    // productMutate();
  };

  // PUT completo: id, name, price, weight
  const handleUpdateProduct = async (
    original: ProductResponse,
    updated: Partial<ProductResponse>
  ) => {
    const payload = {
      id: original.id,
      name: updated.name ?? original.name,
      price: updated.price ?? original.price,
      weight: updated.weight ?? original.weight,
    };
    try {
      await productUpdate(payload);
      toast.success("Produto atualizado com sucesso!");
      productMutate();
    } catch (error) {
      toast.error("Falha ao atualizar produto", {
        description: productUpdateError || String(error),
        duration: 3000,
      });
      throw error;
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await productDelete(id); // <-- envie só a string id
      toast.success("Produto inativado com sucesso!");
      productMutate();
    } catch (error) {
      toast.error("Falha ao inativar produto", {
        description: productDeleteError || String(error),
        duration: 3_000,
      });
      throw error;
    }
  };

  // ---------------------------
  // Estoque: listagem e update
  // ---------------------------
  const stockDrawerConfig = useStockDrawerConfig();
  const { update: stockUpdate } = useStock();
  const {
    items: stockItems,
    isLoading: loadingStock,
    isError: stockListError,
    totalItems: stockTotalItems,
    mutate: stockMutate,
  } = useStockList(1, 50);

  // PUT completo: id, current_stock, min_stock_threshold, max_stock_capacity
  const handleUpdateStock = async (
    original: StockListItem,
    updated: Partial<
      Pick<
        StockListItem,
        "current_stock" | "min_stock_threshold" | "max_stock_capacity"
      >
    >
  ) => {
    const payload = {
      id: original.id,
      product_id: original.product_id,
      current_stock: updated.current_stock ?? original.current_stock,
      min_stock_threshold:
        updated.min_stock_threshold ?? original.min_stock_threshold,
      max_stock_capacity:
        updated.max_stock_capacity ?? original.max_stock_capacity,
    };
    try {
      await stockUpdate(payload);
      toast.success("Estoque atualizado!");
      stockMutate();
    } catch (error) {
      toast.error("Falha ao atualizar estoque", {
        description: String(error),
        duration: 3000,
      });
      throw error;
    }
  };

  // ---------------------------
  // Loading inicial
  // ---------------------------
  if (loadingProducts) {
    return <OrdersSkeletonLoading />;
  }

  // UI de filtro de status (Produtos)
  const statusSelector = (
    <div className="flex items-center gap-2">
      <Label className="text-sm">Status:</Label>
      <Select value={statusFilter} onValueChange={handleChangeStatus}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Ativos</SelectItem>
          <SelectItem value="inactive">Inativos</SelectItem>
          <SelectItem value="all">Todos</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <SiteHeader
        title="Produtos"
        button={
          <div className="flex gap-2">
            {statusSelector}
            <DialogProdutos />
            <DialogStockManager onSaved={() => stockMutate()} />
          </div>
        }
      />

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="stock">Estoque</TabsTrigger>
        </TabsList>

        {/* Aba Produtos */}
        <TabsContent value="products" className="mt-0">
          {productListError ? (
            <div className="p-4 text-center text-red-500">
              Erro ao carregar produtos: {productListError}
            </div>
          ) : (
            <DataTable
              title="Produtos"
              columns={productColumns}
              drawerConfig={productDrawerConfig}
              updateSchema={productUpdateRequestSchema}
              data={productData?.products || []}
              totalCount={productTotalItems || 0}
              pageSize={pagination.pageSize}
              currentPage={pagination.pageIndex}
              onUpdate={handleUpdateProduct}
              onPaginationChange={handlePaginationChange}
              mutate={productMutate}
              onDelete={(item) => handleDeleteProduct(item.id)}
            />
          )}
        </TabsContent>

        {/* Aba Estoque */}
        <TabsContent value="stock" className="mt-0">
          {loadingStock ? (
            <OrdersSkeletonLoading />
          ) : stockListError ? (
            <div className="p-4 text-center text-red-500">
              Erro ao carregar estoque: {stockListError}
            </div>
          ) : (
            <DataTable
              title="Estoque"
              columns={stockColumns}
              drawerConfig={stockDrawerConfig}
              updateSchema={stockConfigUpdateSchema}
              data={stockItems || []}
              totalCount={stockTotalItems || 0}
              pageSize={50}
              currentPage={0}
              onUpdate={handleUpdateStock}
              onPaginationChange={() => {}}
              mutate={stockMutate}
              onDelete={undefined}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
