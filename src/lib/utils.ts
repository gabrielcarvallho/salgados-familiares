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

export const convertDateFormat = (date: string) => {
  // If empty, return empty
  if (!date) return "";

  // If already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;

  // If in DD/MM/YYYY format, convert to YYYY-MM-DD
  const parts = date.split("/");
  if (parts.length === 3) {
    const day = parts[0].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
    return `${year}-${month}-${day}`;
  }

  // If in DD-MM-YYYY format, convert to YYYY-MM-DD
  const dashParts = date.split("-");
  if (dashParts.length === 3) {
    const day = dashParts[0].padStart(2, "0");
    const month = dashParts[1].padStart(2, "0");
    const year = dashParts[2].length === 2 ? `20${dashParts[2]}` : dashParts[2];
    return `${year}-${month}-${day}`;
  }

  // Return original if can't convert
  return date;
};

// Format CNPJ as user types (XX.XXX.XXX/YYYY-ZZ)
export const formatCNPJ = (value: string) => {
  const numericValue = value.replace(/\D/g, "");

  if (numericValue.length <= 2) {
    return numericValue;
  } else if (numericValue.length <= 5) {
    return `${numericValue.slice(0, 2)}.${numericValue.slice(2)}`;
  } else if (numericValue.length <= 8) {
    return `${numericValue.slice(0, 2)}.${numericValue.slice(
      2,
      5
    )}.${numericValue.slice(5)}`;
  } else if (numericValue.length <= 12) {
    return `${numericValue.slice(0, 2)}.${numericValue.slice(
      2,
      5
    )}.${numericValue.slice(5, 8)}/${numericValue.slice(8)}`;
  } else {
    return `${numericValue.slice(0, 2)}.${numericValue.slice(
      2,
      5
    )}.${numericValue.slice(5, 8)}/${numericValue.slice(
      8,
      12
    )}-${numericValue.slice(12, 14)}`;
  }
};

// Format phone as user types ((XX) XXXXX-XXXX)
export const formatPhone = (value: string) => {
  const numericValue = value.replace(/\D/g, "");

  if (numericValue.length <= 2) {
    return numericValue;
  } else if (numericValue.length <= 7) {
    return `(${numericValue.slice(0, 2)}) ${numericValue.slice(2)}`;
  } else {
    return `(${numericValue.slice(0, 2)}) ${numericValue.slice(
      2,
      7
    )}-${numericValue.slice(7, 11)}`;
  }
};

// Format CEP as user types (XXXXX-XXX)
export const formatCEP = (value: string) => {
  const numericValue = value.replace(/\D/g, "");

  if (numericValue.length <= 5) {
    return numericValue;
  } else {
    return `${numericValue.slice(0, 5)}-${numericValue.slice(5, 8)}`;
  }
};

// Função para limpar formatação de telefone (remove parênteses, espaços e hífens)
export const cleanPhone = (phone: string) => phone.replace(/\D/g, "");

// Função para limpar formatação de CNPJ (remove pontos, barra e hífen)
export const cleanCNPJ = (cnpj: string) => cnpj.replace(/\D/g, "");

export const formatPaymentMethod = (name: string) => {
  if (name === undefined || null) {
    return "";
  } else {
    if (name === "Boleto banc├írio") {
      return "Boleto Bancário";
    } else {
      return "Dinheiro";
    }
  }
};

export const formatOrderStatus = (description: string) => {
  if (description === undefined || null) {
    return "";
  } else {
    if (description == "Em produ├º├úo") {
      return "Em produção";
    } else if (description == "Conclu├¡do") {
      return "Concluído";
    } else {
      return description;
    }
  }
};
