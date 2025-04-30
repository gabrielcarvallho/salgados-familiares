"use client";

import { DataTable } from "@/components/datatable";
import { SiteHeader } from "@/components/site-header";
import { DialogProdutos } from "./dialog";
import { useProduct, useProductList } from "@/hooks/useProduct";
import { ProductsSkeletonLoading } from "../../../components/skeleton";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { columns, drawerConfig } from "./data-config";
import { ProductResponse, productUpdateRequestSchema } from "@/types/Product";
import { CustomerUpdateRequestSchema } from "@/types/Customer";

export default function ProductsPage() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { update } = useProduct();
  const { data, isLoading, isError, totalItems } = useProductList(
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

  const handleUpdateProduct = async (original: ProductResponse, updated: Partial<ProductResponse>) => {
    const payload = {
      id: original.id,
      ...updated,
    };

    try {
      await update(payload);
      toast.success("Produto atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      toast.error("Falha ao atualizar produto");
      throw error;
    }
  };

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
          />
        )}
      </div>
    </div>
  );
}