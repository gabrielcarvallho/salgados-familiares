// src/components/ui/input.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export function Input(
  { className, type, value, ...props }: React.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      // ← if value is ever undefined, force it to empty string
      value={value ?? ""}
      {...props}
    />
  )
}
