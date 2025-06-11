import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Group } from "@/types/User";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formata a entrada do usuário para DD/MM/YYYY enquanto digita
export const formatDateInput = (value: string) => {
  // Remove caracteres não numéricos
  const numericValue = value.replace(/\D/g, "");

  // Aplica a máscara DD/MM/YYYY
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

export function formatDateToBR(input: string | Date): string {
  let date: Date;

  if (typeof input === "string") {
    // assume que já vem em "yyyy-mm-dd"
    const [year, month, day] = input.split("-");
    date = new Date(+year, +month - 1, +day);
  } else {
    date = input;
  }
  if (date != null) {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } else {
    return "";
  }
}

export const convertDateFormat = (date: string) => {
  // Se vazio, retorna vazio
  if (!date) return "";

  // Se já estiver no formato YYYY-MM-DD, retorna como está
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;

  // Processa DD/MM/YYYY
  const parts = date.split("/");
  if (parts.length === 3) {
    const day = parts[0].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
    return `${year}-${month}-${day}`;
  }

  // Processa DD-MM-YYYY
  const dashParts = date.split("-");
  if (dashParts.length === 3) {
    const day = dashParts[0].padStart(2, "0");
    const month = dashParts[1].padStart(2, "0");
    const year = dashParts[2].length === 2 ? `20${dashParts[2]}` : dashParts[2];
    return `${year}-${month}-${day}`;
  }

  // Se chegou aqui, não conseguiu converter
  console.warn("Não foi possível converter a data:", date);
  return date;
};
// Validação de data (retorna true se a data for válida)
export const isValidDate = (dateString: string) => {
  // Verifica se é uma string e não está vazia
  if (!dateString || typeof dateString !== "string") return false;

  // Converte para o formato YYYY-MM-DD
  const formattedDate = convertDateFormat(dateString);

  // Se o formato não mudou, a conversão falhou
  if (formattedDate === dateString && !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }

  // Verifica se é uma data válida usando o construtor Date
  const date = new Date(formattedDate);
  return !isNaN(date.getTime());
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

export const dateValidator = (value: string) => {
  // Padrão para validar DD/MM/YYYY
  const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;

  if (!value) return false;

  const match = value.match(datePattern);
  if (!match) return false;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  // Verifica se é uma data válida
  if (day < 1 || day > 31) return false;
  if (month < 1 || month > 12) return false;
  if (year < 1900 || year > 2100) return false;

  // Verifica dias em meses específicos
  const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Ajuste para ano bissexto em fevereiro
  if (month === 2) {
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    if (day > (isLeapYear ? 29 : 28)) {
      return false;
    }
  } else if (day > daysInMonth[month]) {
    return false;
  }

  return true;
};

interface BadgeInfo {
  badge: any;
  stats: string;
}

export const badgesVariant = (identifier: number): BadgeInfo => {
  switch (identifier) {
    case 0: {
      const stats = "Aguardo do expediente";
      const badge = "aguardoExpediente";
      return { badge, stats };
    }
    case 1: {
      const stats = "Em produção";
      const badge = "emProducao";
      return { badge, stats };
    }
    case 2: {
      const stats = "Pronta entrega";
      const badge = "prontoEntrega";
      return { badge, stats };
    }
    case 3: {
      const stats = "Pagamento pendente";
      const badge = "pagamentoPendente";
      return { badge, stats };
    }
    case 4: {
      const stats = "Pagamento aprovado";
      const badge = "pagamentoAprovado";
      return { badge, stats };
    }
    default: {
      const stats = "Concluído";
      const badge = "concluido";
      return { badge, stats };
    }
  }
};

export const formatStatus = (name: string) => {
  if (name === "Conclu├¡do") {
    return "Concluído";
  } else if (name === "Em produ├º├úo") {
    return "Em produção";
  } else {
    return name;
  }
};

export function cleanCEP(cep: string): string {
  return cep.replace(/\D/g, "");
}
export function getTomorrowDayMonth(): { day: number; month: number } {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  return {
    day: tomorrow.getDate(), // 1–31
    month: tomorrow.getMonth() + 1, // 1–12 (getMonth() é 0-based)
  };
}

export const formatBoolean = (bool: string) => {
  if (bool === "false") {
    return "Não";
  } else {
    return "Sim";
  }
};

/**
 * Formata uma data ISO (ou Date) para "DD/MM/YYYY".
 * @param isoString string no formato ISO ou um objeto Date
 * @returns string formatada como "DD/MM/YYYY"
 */
export function formatDateToDDMMYYYY(isoString: string | Date): string {
  const date = typeof isoString === "string" ? new Date(isoString) : isoString;

  const day = String(date.getDate()).padStart(2, "0");
  // getMonth() é 0-based, então soma 1
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

// Exemplo de uso:
const raw = "2025-05-06T10:25:54.865049-03:00";
formatDateToDDMMYYYY(raw); // "06/05/2025"
