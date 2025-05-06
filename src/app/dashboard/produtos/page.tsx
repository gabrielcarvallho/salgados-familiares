"use client";

import { DataTable } from "@/components/datatable";
import { SiteHeader } from "@/components/site-header";
import { DialogProdutos } from "./dialog";
import { useProduct, useProductList } from "@/hooks/useProduct";
import { ProductsSkeletonLoading } from "../../../components/skeleton";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { columns, useDrawerConfig } from "./data-config";
import { ProductResponse, productUpdateRequestSchema } from "@/types/Product";
import { PaginationType } from "@/types/User";
import { AlertDelete } from "@/components/alert-dialog";

export default function ProductsPage() {
  const [pagination, setPagination] = useState<PaginationType>({
    pageIndex: 0,
    pageSize: 10,
  });

  const drawerConfig = useDrawerConfig()

  const { update, error: updateError, del, error: delError } = useProduct();
  const { data, isLoading, isError, totalItems, mutate } = useProductList(
    pagination.pageIndex + 1,
    pagination.pageSize
  );

  // No handlePaginationChange:
  const handlePaginationChange = useCallback((newPagination: PaginationType) => {
    setPagination({
      pageIndex: newPagination.pageIndex,
      pageSize: newPagination.pageSize,
    });
  }, []);

  const handleUpdateProduct = async (original: ProductResponse, updated: Partial<ProductResponse>) => {
    const payload = {
      id: original.id,
      ...updated,
    };

    try {
      await update(payload);
      toast.success("Produto atualizado com sucesso!");
      mutate()
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      toast.error("Falha ao atualizar produto", {
        description: updateError || String(error),
        duration: 3000,
      });
      throw error;
    }
  };

  const handleDeleteProduct = async (item: any) => {
    try {
      await del(item);
      toast.success("Produto exlcuido com sucesso!");
      mutate()
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      toast.error("Falha ao excluir produto", {
        description: updateError || String(error),
        duration: 3000,
      });
      throw error;
    }  }

  return (
    <div>
      <div className="flex flex-col gap-4">
        <SiteHeader title="Produtos" button={<DialogProdutos />} />

        {isLoading ? (
          <ProductsSkeletonLoading />
        ) : isError ? (
          <div className="p-4 text-center text-red-500">
            Erro ao carregar produtos: {isError}
          </div>
        ) : (
          <DataTable
            drawerConfig={drawerConfig}
            updateSchema={productUpdateRequestSchema}    // ← aqui
            title="Produtos"
            columns={columns}
            data={data?.products || []}
            totalCount={totalItems || 0}
            pageSize={pagination.pageSize}
            currentPage={pagination.pageIndex}
            onUpdate={handleUpdateProduct}
            onPaginationChange={handlePaginationChange}
            mutate={mutate}
            onDelete={(item) => handleDeleteProduct(item)}
          />
        )}
      </div>
    </div>
  );
}