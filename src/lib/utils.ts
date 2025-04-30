import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDateInput = (value: string) => {
  const numericValue = value.replace(/\D/g, "");

  if (numericValue.length <= 2) {
    return numericValue;
  } else if (numericValue.length <= 4) {
    return `${numericValue.slice(0, 2)}/${numericValue.slice(2)}`;
  } else {
    return `${numericValue.slice(0, 2)}/${numericValue.slice(
      2,
      4
    )}/${numericValue.slice(4, 8)}`;
  }
};

export const formatGroup = (group: string | undefined) => {
  if (group === undefined) {
    return "Administrador";
  } else {
    if (group == "delivery_person") {
      return "Entregador";
    } else {
      return "Vendedor";
    }
  }
};
