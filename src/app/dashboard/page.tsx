"use client";
import { SiteHeader } from "@/components/site-header";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, DollarSign, Landmark } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useCallback, useState } from "react";
import { DialogUsuario } from "./dialog";
import { useReports } from "@/hooks/useStatistics";
import { usePendingInvitations, useUser, useUserList } from "@/hooks/useUser";
import {
  PendingInvitations,
  pendiningInvitations,
  ResendInvite,
  resendInviteSchema,
} from "../../types/User";
import { toast } from "sonner";
import { DataTable } from "@/components/datatable";
import {
  columns as columnsPending,
  drawerConfig as drawerConfigPending,
} from "./data-config";
import { columns as columnsAll, useDrawerConfigAll } from "./data-config2";
import { TabsContent } from "@radix-ui/react-tabs";
import { DashboardSkeleton } from "./skeleton";


export default function Page() {
  const [activeTab, setActiveTab] = useState("1")
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const drawerConfigAll = useDrawerConfigAll()
  const { users, isLoading: usersLoading, isError: usersError } = useUserList()
  const { resendInvite } = useUser()
  const { invitations, isLoading, isError, totalItems } = usePendingInvitations(
    pagination.pageIndex + 1,
    pagination.pageSize,
  )

  const handlePaginationChange = useCallback((newPagination: any) => {
    setPagination({
      pageIndex: newPagination.pageIndex,
      pageSize: newPagination.pageSize,
    })
  }, [])

  const handleResendInvite = async (original: any) => {
    try {
      await resendInvite(original.token)
      toast.success("Convite enviado novamente com sucesso!")
    } catch (error) {
      console.error("Erro ao re-enviar convite:", error)
      toast.error("Falha ao re-enviar convite")
      throw error
    }
  }

  const days = Number.parseInt(activeTab, 10)
  const { reports, isLoading: reportsLoading } = useReports(days)

  // Show skeleton while any data is loading
  if (isLoading || usersLoading || reportsLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div>
      <div className="flex flex-col gap-4">
        <SiteHeader title="Dashboard" button={<DialogUsuario />} />

        <div className="px-4 lg:px-6">
          <h2 className="text-xl font-semibold mb-4">Visão geral</h2>

          {/* Period filters with Tabs */}
          <Tabs
            defaultValue="1"
            value={activeTab}
            onValueChange={setActiveTab}
            className="mb-4"
          >
            <TabsList>
              <TabsTrigger value="1">Hoje</TabsTrigger>
              <TabsTrigger value="7">7 dias</TabsTrigger>
              <TabsTrigger value="30">30 dias</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
          <Card className="@container/card">
            <CardHeader>
              <CardDescription>Vendas totais</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                +{reports?.total_sales}
              </CardTitle>
              <CardAction>
                <DollarSign className="size-4" />
              </CardAction>
            </CardHeader>
          </Card>
          <Card className="@container/card">
            <CardHeader>
              <CardDescription>Usuário ativos</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                +{reports?.active_users}
              </CardTitle>
              <CardAction>
                <Users className="size-4" />
              </CardAction>
            </CardHeader>
          </Card>
          <Card className="@container/card">
            <CardHeader>
              <CardDescription>Receita</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                R${reports?.total_value}
              </CardTitle>
              <CardAction>
                <Landmark className="size-4" />
              </CardAction>
            </CardHeader>
          </Card>
        </div>
        <div>
          <Tabs defaultValue="0" className="mb-4">
            <TabsList className="ml-4 my-4">
              <TabsTrigger value="0">Todos os usuários</TabsTrigger>
              <TabsTrigger value="1">Usuários pendentes</TabsTrigger>
            </TabsList>
            <TabsContent value="0">
              {isLoading ? (
                <></>
              ) : isError ? (
                <div className="p-4 text-center text-red-500">
                  Erro ao carregar usuários: {isError}
                </div>
              ) : (
                <DataTable
                  drawerConfig={drawerConfigAll}
                  title="Todos os usuários"
                  columns={columnsAll}
                  data={users ?? []} // ← passe o array interno
                  totalCount={totalItems || 0}
                  pageSize={pagination.pageSize}
                  currentPage={pagination.pageIndex}
                  onPaginationChange={handlePaginationChange}
                />
              )}
            </TabsContent>
            <TabsContent value="1">
              {isLoading ? (
                <></>
              ) : isError ? (
                <div className="p-4 text-center text-red-500">
                  Erro ao carregar usuários: {isError}
                </div>
              ) : (
                <DataTable
                  drawerConfig={drawerConfigPending}
                  updateSchema={resendInviteSchema} // ← aqui
                  title="Usuários pendentes"
                  columns={columnsPending}
                  data={invitations || []}
                  totalCount={totalItems || 0}
                  pageSize={pagination.pageSize}
                  currentPage={pagination.pageIndex}
                  onUpdate={(orig) => handleResendInvite(orig)}
                  onPaginationChange={handlePaginationChange}
                  saveButtonText="Enviar convite novamente"
                  savingButtonText="Enviando..."
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
