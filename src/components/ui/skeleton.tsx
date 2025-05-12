import type React from "react"
import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean
  delay?: number
}

export function Skeleton({ className, shimmer = true, delay = 0, ...props }: SkeletonProps) {
  const delayStyle = delay ? { animationDelay: `${delay}ms` } : {}
  
  return (
    <div
      className={cn(
        "rounded-md bg-muted",
        shimmer &&
          "animate-pulse relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
        className,
      )}
      style={delayStyle}
      {...props}
    />
  )
}
