"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function OrdersSkeletonLoading() {
  // Function to calculate staggered delay
  const getDelay = (index: number, baseDelay = 100) => index * baseDelay

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 lg:px-6 gap-3">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <div className="space-x-2 flex flex-wrap gap-2">
          <Skeleton className="h-10 w-40" delay={getDelay(0)} />
          <Skeleton className="h-10 w-40" delay={getDelay(1)} />
        </div>
      </div>

      {/* Table */}
      <div className="px-4 lg:px-6">
        <div className="rounded-md border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
            <Skeleton className="h-8 w-24 sm:w-32" delay={getDelay(2)} />
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <Skeleton className="h-9 w-full sm:w-[250px]" delay={getDelay(3)} />
              <Skeleton className="h-9 w-10 hidden sm:block" delay={getDelay(4)} />
            </div>
          </div>
          <div className="border-t">
            {/* Table Headers */}
            <div className="hidden sm:grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 border-b p-3">
              {[...Array(7)].map((_, i) => (
                <Skeleton
                  key={`header-${i}`}
                  className={cn(
                    "h-5",
                    i === 0 && "w-16",
                    i === 1 && "w-24",
                    i === 2 && "w-40 hidden md:block",
                    i === 3 && "w-32 hidden md:block",
                    i === 4 && "w-32 hidden lg:block",
                    i === 5 && "w-24",
                    i === 6 && "w-20 hidden lg:block",
                  )}
                  delay={getDelay(i + 5)}
                />
              ))}
            </div>

            {/* Mobile Header (only visible on small screens) */}
            <div className="sm:hidden border-b p-3">
              <Skeleton className="h-5 w-32 mb-2" delay={getDelay(5)} />
              <Skeleton className="h-4 w-24" delay={getDelay(6)} />
            </div>

            {/* Table Rows */}
            {Array.from({ length: 10 }).map((_, rowIndex) => (
              <div key={`row-${rowIndex}`} className="border-b">
                {/* Desktop Row */}
                <div className="hidden sm:grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 p-3">
                  {[...Array(7)].map((_, colIndex) => {
                    const delay = getDelay(rowIndex * 7 + colIndex + 12) // +12 to account for headers and other elements
                    return (
                      <Skeleton
                        key={`cell-${rowIndex}-${colIndex}`}
                        className={cn(
                          "h-5",
                          colIndex === 0 && "w-8",
                          colIndex === 1 && "w-32",
                          colIndex === 2 && "w-28 hidden md:block",
                          colIndex === 3 && "w-24 hidden md:block",
                          colIndex === 4 && "w-24 hidden lg:block",
                          colIndex === 5 && "w-28 rounded-full",
                          colIndex === 6 && "w-16 hidden lg:block",
                        )}
                        delay={delay}
                      />
                    )
                  })}
                </div>

                {/* Mobile Row (only visible on small screens) */}
                <div className="sm:hidden p-3 flex flex-col gap-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-24" delay={getDelay(rowIndex * 4 + 7)} />
                    <Skeleton className="h-5 w-20 rounded-full" delay={getDelay(rowIndex * 4 + 8)} />
                  </div>
                  <Skeleton className="h-4 w-32" delay={getDelay(rowIndex * 4 + 9)} />
                  <Skeleton className="h-4 w-28" delay={getDelay(rowIndex * 4 + 10)} />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" delay={getDelay(rowIndex * 4 + 11)} />
                    <Skeleton className="h-5 w-16" delay={getDelay(rowIndex * 4 + 12)} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3">
            <Skeleton className="h-5 w-48 hidden sm:block" delay={getDelay(82)} />
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <Skeleton className="h-8 w-full sm:w-32" delay={getDelay(83)} />
              <div className="flex gap-1 mt-2 sm:mt-0">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={`pagination-${i}`} className="h-8 w-8" delay={getDelay(84 + i)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
