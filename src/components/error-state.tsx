"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  title = "Erro ao carregar dados",
  message = "Ocorreu um erro ao carregar os dados. Por favor, tente novamente.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center my-4 mx-4 lg:mx-6">
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-red-100 rounded-full">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-red-800 mb-2">{title}</h3>
      <p className="text-red-700 max-w-md mx-auto mb-4">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-100 hover:text-red-800"
          onClick={onRetry}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Tentar novamente
        </Button>
      )}
    </div>
  )
}
