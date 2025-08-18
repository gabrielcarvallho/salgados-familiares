"use client";

import { DataTable } from "@/components/datatable";
import { SiteHeader } from "@/components/site-header";
import { DialogClientes } from "./_components/dialog";
import { ProductsSkeletonLoading } from "@/components/skeleton";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { columns, useDrawerConfig } from "./_components/data-config";
import {
  CustomerResponse,
  CustomerUpdateRequest,
  CustomerUpdateRequestSchema,
} from "@/types/Customer";
import { useCustomer, useCustomerList } from "@/hooks/useCustomer";
import { OrdersSkeletonLoading } from "@/components/ui/base-skeleton";
import { cleanCEP, cleanDocument, cleanPhone } from "@/lib/utils";

type PaginationType = {
  pageIndex: number;
  pageSize: number;
  [key: string]: unknown; // Caso haja propriedades adicionais
};

export default function ClientsPage() {
  const [pagination, setPagination] = useState<PaginationType>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { update, error: updateError, del } = useCustomer();
  const { customers, isLoading, isError, totalItems, mutate } = useCustomerList(
    pagination.pageIndex + 1,
    pagination.pageSize
  );

  const drawerConfig = useDrawerConfig();

  // No handlePaginationChange:
  const handlePaginationChange = useCallback((newPagination: any) => {
    setPagination({
      pageIndex: newPagination.pageIndex,
      pageSize: newPagination.pageSize,
    });
  }, []);

  const handleUpdateCustomer = async (
    original: CustomerResponse,
    updated: CustomerUpdateRequest
  ) => {
    /* --------------------------------------- *
     * Helpers                                 *
     * --------------------------------------- */
    // "dd/MM/yyyy" ─► "yyyy-MM-dd" | undefined
    const toISODateSafe = (v?: string | null): string | undefined => {
      if (!v) return undefined;
      const s = String(v).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s; // ISO curto já ok
      const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      return m ? `${m[3]}-${m[1]}-${m[2]}` : undefined;
    };
  
    // primeiro valor não-vazio
    const pickNonEmpty = (...vals: Array<string | null | undefined>) => {
      for (const v of vals) if (typeof v === "string" && v.trim()) return v;
      return "";
    };
  
    // remove APENAS null/undefined (mantém strings vazias)
    const stripNullsDeep = <T extends object>(obj: T): Partial<T> =>
      Object.fromEntries(
        Object.entries(obj)
          .filter(([, v]) => v !== null && v !== undefined)  // ← só remove null/undefined
          .map(([k, v]) => [
            k,
            typeof v === "object" && !Array.isArray(v)
              ? stripNullsDeep(v as any)
              : v,
          ])
      ) as Partial<T>;
  
    /* --------------------------------------- *
     * Dados base                              *
     * --------------------------------------- */
    const customerType: "PF" | "PJ" =
      (updated.customer_type as any) ?? (original.customer_type as any);
  
    const state_registration =
      (updated as any).state_registration ??
      (original as any).state_registration ??
      "";
  
    const document = cleanDocument(
      (updated.document ?? original.document) as string
    );
  
    const name = pickNonEmpty(updated.name, original.name);
    const fantasy_name = pickNonEmpty(
      updated.fantasy_name,
      original.fantasy_name
    );
    const email = pickNonEmpty(updated.email, original.email);
    const phone_number = cleanPhone(
      pickNonEmpty(updated.phone_number, original.phone_number)
    );
  
    // --- nascimento cliente (PF apenas) ---
    const rawBirth =
      updated.birth_date !== undefined
        ? updated.birth_date
        : original.birth_date;
    const birth_date =
      customerType === "PF" ? toISODateSafe(rawBirth as any) : undefined;
  
    // --- Endereço ---
    const cep = cleanCEP(
      pickNonEmpty(updated.billing_address?.cep, original.billing_address?.cep)
    );
    const street_name = pickNonEmpty(
      updated.billing_address?.street_name,
      original.billing_address?.street_name
    );
    const district = pickNonEmpty(
      updated.billing_address?.district,
      original.billing_address?.district
    );
    const number = pickNonEmpty(
      updated.billing_address?.number,
      original.billing_address?.number
    );
    const rawCity = pickNonEmpty(
      updated.billing_address?.city,
      original.billing_address?.city
    );
    const city = rawCity.split("-")[0].trim();
    const state = pickNonEmpty(
      updated.billing_address?.state,
      original.billing_address?.state
    );
  
    // --- Fallbacks PF ---
    const fallbackPFName = name;
    const fallbackPFEmail = email;
    const fallbackPFPhone = phone_number;
    const fallbackPFDoB = birth_date; // ISO | undefined
  
    // --- Contato ---
    const contact_name = pickNonEmpty(
      updated.contact?.name,
      original.contact?.name,
      customerType === "PF" ? fallbackPFName : ""
    );
  
    const contact_email = pickNonEmpty(
      updated.contact?.contact_email,
      original.contact?.contact_email,
      customerType === "PF" ? fallbackPFEmail : ""
    );
  
    const contact_phone = cleanPhone(
      pickNonEmpty(
        updated.contact?.contact_phone,
        original.contact?.contact_phone,
        customerType === "PF" ? fallbackPFPhone : ""
      )
    );
  
    const contact_date_of_birth = toISODateSafe(
      pickNonEmpty(
        updated.contact?.date_of_birth,
        original.contact?.date_of_birth,
        customerType === "PF" ? (fallbackPFDoB as any) : undefined
      ) || undefined
    );
  
    /* --------------------------------------- *
     * Montagem final                          *
     * --------------------------------------- */
    const contact = {
      name: contact_name,
      contact_email,
      contact_phone,
      // sempre inclui, mesmo se undefined (será removido pelo stripNullsDeep se for)
      date_of_birth: contact_date_of_birth,
    };
  
    const billing_address = {
      cep,
      street_name,
      district,
      number,
      city,
      state,
    };
  
    const basePayload = {
      id: original.id,
      customer_type: customerType,
      document,
      name,
      fantasy_name,        // ← sempre presente (mesmo se "")
      phone_number,
      email,
      state_registration,  // ← sempre presente (mesmo se "")
      contact,
      billing_address,
      // PF: sempre inclui birth_date (mesmo se undefined, será removido depois)
      ...(customerType === "PF" && { birth_date }),
    };
  
    // remove apenas null/undefined, mantém strings vazias
    const payload = stripNullsDeep(basePayload) as CustomerUpdateRequest;
  
    /* --------------------------------------- *
     * Chamada à API                           *
     * --------------------------------------- */
    try {
      await update(payload);
      toast.success("Cliente atualizado com sucesso!");
      mutate();
    } catch (error) {
      toast.error("Falha, tente novamente mais tarde!", {
        description: String(error),
        duration: 3000,
      });
      throw error;
    }
  };
  
  
  const handleDeleteCustomer = async (item: string) => {
    try {
      await del(item);
      toast.success("Cliente exlcuido com sucesso!");
      mutate();
    } catch (error) {
      toast.error("Falha ao excluir cliente", {
        description: updateError || String(error),
        duration: 3000,
      });
      throw error;
    }
  };

  if (isLoading) {
    return <OrdersSkeletonLoading />;
  }

  return (
    <div>
      <div className="flex flex-col gap-4">
        <SiteHeader title="Clientes" button={<DialogClientes />} />

        {isLoading ? (
          <ProductsSkeletonLoading />
        ) : isError ? (
          <div className="p-4 text-center text-red-500">
            Erro ao carregar clientes: {isError}
          </div>
        ) : (
          <DataTable
            updateSchema={CustomerUpdateRequestSchema}
            drawerConfig={drawerConfig}
            title="Clientes"
            columns={columns}
            data={customers || []}
            totalCount={totalItems || 0}
            pageSize={pagination.pageSize}
            currentPage={pagination.pageIndex}
            onUpdate={handleUpdateCustomer}
            onPaginationChange={handlePaginationChange}
            mutate={mutate}
            onDelete={(item) => handleDeleteCustomer(item.id)}
          />
        )}
      </div>
    </div>
  );
}
