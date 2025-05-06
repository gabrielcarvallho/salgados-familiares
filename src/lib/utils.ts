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

export function getTomorrowDayMonth(): { day: number; month: number } {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  return {
    day: tomorrow.getDate(),       // 1–31
    month: tomorrow.getMonth() + 1 // 1–12 (getMonth() é 0-based)
  };
}

export const formatBoolean = (bool: string) => {
  if (bool === "false") {
    return "Não"
  } else {
    return "Sim"
  }
} 

/**
 * Formata uma data ISO (ou Date) para "DD/MM/YYYY".
 * @param isoString string no formato ISO ou um objeto Date
 * @returns string formatada como "DD/MM/YYYY"
 */
export function formatDateToDDMMYYYY(isoString: string | Date): string {
  const date = typeof isoString === "string"
    ? new Date(isoString)
    : isoString;

  const day = String(date.getDate()).padStart(2, "0");
  // getMonth() é 0-based, então soma 1
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

// Exemplo de uso:
const raw = "2025-05-06T10:25:54.865049-03:00";
console.log(formatDateToDDMMYYYY(raw));  // "06/05/2025"
