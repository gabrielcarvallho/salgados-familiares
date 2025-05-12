"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader, CardDescription, CardTitle, CardAction } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, Users, Landmark } from "lucide-react"
import { cn } from "@/lib/utils"

export function DashboardSkeleton() {
  // Function to calculate staggered delay
  const getDelay = (index: number, baseDelay = 100) => index * baseDelay

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 lg:px-6 gap-3">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Skeleton className="h-10 w-32" delay={getDelay(0)} />
      </div>

      <div className="px-4 lg:px-6">
        <h2 className="text-xl font-semibold mb-4">Visão geral</h2>

        {/* Period filters with Tabs */}
        <Tabs defaultValue="1" className="mb-4">
          <TabsList>
            <TabsTrigger value="1">Hoje</TabsTrigger>
            <TabsTrigger value="7">7 dias</TabsTrigger>
            <TabsTrigger value="30">30 dias</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: "Vendas totais", icon: <DollarSign className="size-4" /> },
          { title: "Usuário ativos", icon: <Users className="size-4" /> },
          { title: "Receita", icon: <Landmark className="size-4" /> },
        ].map((card, index) => (
          <Card key={card.title} className="@container/card">
            <CardHeader>
              <CardDescription>{card.title}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                <Skeleton className="h-8 w-24" delay={getDelay(index + 1)} />
              </CardTitle>
              <CardAction>{card.icon}</CardAction>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div>
        <Tabs defaultValue="0" className="mb-4">
          <TabsList className="ml-4 my-4 overflow-x-auto flex-nowrap">
            <TabsTrigger value="0">Todos os usuários</TabsTrigger>
            <TabsTrigger value="1">Usuários pendentes</TabsTrigger>
          </TabsList>
          <div className="px-4 lg:px-6">
            <div className="rounded-md border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
                <Skeleton className="h-8 w-48" delay={getDelay(4)} />
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <Skeleton className="h-9 w-full sm:w-[250px]" delay={getDelay(5)} />
                  <Skeleton className="h-9 w-10 hidden sm:block" delay={getDelay(6)} />
                </div>
              </div>
              <div className="border-t">
                <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 border-b p-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton
                      key={`header-${i}`}
                      className={cn(
                        "h-5",
                        i === 0 && "w-24",
                        i === 1 && "w-16",
                        i === 2 && "w-32 hidden md:block",
                        i === 3 && "w-24 hidden md:block",
                      )}
                      delay={getDelay(i + 7)}
                    />
                  ))}
                </div>
                {Array.from({ length: 5 }).map((_, rowIndex) => (
                  <div key={`row-${rowIndex}`}>
                    {/* Desktop Row */}
                    <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 border-b p-3">
                      {[...Array(4)].map((_, colIndex) => {
                        const delay = getDelay(rowIndex * 4 + colIndex + 11) // +11 to account for headers and other elements
                        return (
                          <Skeleton
                            key={`cell-${rowIndex}-${colIndex}`}
                            className={cn(
                              "h-5",
                              colIndex === 0 && "w-48",
                              colIndex === 1 && "w-12",
                              colIndex === 2 && "w-24 hidden md:block",
                              colIndex === 3 && "w-32 hidden md:block",
                            )}
                            delay={delay}
                          />
                        )
                      })}
                    </div>
                    {/* Mobile Row */}
                    <div className="sm:hidden border-b p-3 flex flex-col gap-2">
                      <Skeleton className="h-5 w-48" delay={getDelay(rowIndex * 3 + 11)} />
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-12" delay={getDelay(rowIndex * 3 + 12)} />
                        <Skeleton className="h-4 w-24" delay={getDelay(rowIndex * 3 + 13)} />
                      </div>
                      <Skeleton className="h-4 w-32" delay={getDelay(rowIndex * 3 + 14)} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3">
                <Skeleton className="h-5 w-48 hidden sm:block" delay={getDelay(31)} />
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                  <Skeleton className="h-8 w-full sm:w-32" delay={getDelay(32)} />
                  <div className="flex gap-1 mt-2 sm:mt-0">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={`pagination-${i}`} className="h-8 w-8" delay={getDelay(33 + i)} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
