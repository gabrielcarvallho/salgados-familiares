"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from 'lucide-react'

export function SalgadosSkeletonLoading() {
  return (
    <div className="px-4 lg:px-6 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-5 w-5 text-orange-500" />
        <h2 className="text-2xl font-bold">
          Demanda de amanhã{" "}
          <span className="text-orange-500">
            <Skeleton className="h-6 w-16 inline-block" />
          </span>
        </h2>
      </div>

      {/* Skeleton for cards grid */}
      <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm flex flex-col">
            <Skeleton className="h-6 w-3/4 mb-3 pb-2 border-b" />

            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-7 w-12" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-7 w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

