import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/70",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",

        // Existentes
        prontoEntrega:
          "border-transparent bg-blue-600 text-primary-foreground [a&]:hover:bg-primary/90",
        aguardoExpediente:
          "border-transparent bg-gray-200 text-foreground [a&]:hover:bg-primary/90",
        emProducao:
          "border-transparent bg-orange-400 text-primary-foreground [a&]:hover:bg-primary/90",
        entregue:
          "border-transparent bg-sky-400 text-primary-foreground [a&]:hover:bg-primary/90",
        pagamentoPendente:
          "border-transparent bg-yellow-400 text-primary-foreground [a&]:hover:bg-primary/90",
        pagamentoAprovado:
          "border-transparent bg-green-600 text-primary-foreground [a&]:hover:bg-primary/90",
        concluido:
          "border-transparent bg-green-400 text-primary-foreground [a&]:hover:bg-primary/90",

        // Novos para RETIRADA
        prontoRetirada:
          "border-transparent bg-indigo-500 text-primary-foreground [a&]:hover:bg-indigo-600",
        retiradoCliente:
          "border-transparent bg-purple-500 text-primary-foreground [a&]:hover:bg-purple-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
