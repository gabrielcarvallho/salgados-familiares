"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useOrderStatus } from "@/hooks/useOrder";
import { badgesVariant, formatStatus } from "@/lib/utils";

interface OrderStatusFilterProps {
  onStatusChange: (statusId: string | null) => void;
  activeStatus: string | null;
}

export function OrderStatusFilter({ onStatusChange, activeStatus }: OrderStatusFilterProps) {
  const { orderStatus = [] } = useOrderStatus();

  // Reset handler
  const handleReset = () => {
    onStatusChange(null);
  };

  return (
    <div className="flex flex-wrap gap-2 items-center mb-4">
      <div className="text-sm font-medium mr-2">Filtrar por status:</div>
      <Badge 
        variant={activeStatus === null ? "default" : "outline"}
        className="cursor-pointer"
        onClick={handleReset}
      >
        Todos
      </Badge>
      
      {orderStatus.map((status) => {
        const { badge } = badgesVariant(status.identifier);
        const isActive = activeStatus === String(status.id);
        
        return (
          <Badge
            key={status.id}
            variant={isActive ? badge : "outline"}
            className="cursor-pointer"
            onClick={() => onStatusChange(isActive ? null : String(status.id))}
          >
            {formatStatus(status.description)}
          </Badge>
        );
      })}
    </div>
  );
}