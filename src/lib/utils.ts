import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Group } from "@/types/User";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const onlyDigits = (v?: string | number | null) => (v ?? "").toString().replace(/\D/g, "");

export const formatCPF = (v?: string | null) => {
  const s = onlyDigits(v);
  if (!s) return "";
  return s
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4")
    .slice(0, 14);
};

// CNPJ
export const formatCNPJ = (v?: string | null) => {
  const s = onlyDigits(v);
  if (!s) return "";
  return s
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5")
    .slice(0, 18);
};

// Documento por tipo
export const formatDocumentByType = (doc?: string | null, type?: "PF" | "PJ") => {
  if (type === "PJ") return formatCNPJ(doc);
  if (type === "PF") return formatCPF(doc);
  const digits = onlyDigits(doc);
  return digits.length > 11 ? formatCNPJ(doc) : formatCPF(doc);
};

export const cleanDocument = (doc?: string | null) => onlyDigits(doc);

// Telefone
export const formatPhone = (v?: string | null) => {
  const s = onlyDigits(v);
  if (!s) return "";
  if (s.length <= 10) {
    return s
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 14);
  }
  return s
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 15);
};

export const cleanPhone = (v?: string | null) => onlyDigits(v);

// CEP
export const formatCEP = (v?: string | null) => {
  const s = onlyDigits(v);
  if (!s) return "";
  return s.replace(/^(\d{5})(\d)/, "$1-$2").slice(0, 9);
};

export const cleanCEP = (v?: string | null) => onlyDigits(v);

// Data (input dd/mm/yyyy)
export const formatDateInput = (v?: string | null) => {
  const s = onlyDigits(v);
  if (!s) return "";
  return s
    .replace(/^(\d{2})(\d)/, "$1/$2")
    .replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3")
    .slice(0, 10);
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
    return ""
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


type DeliveryMethod = "ENTREGA" | "RETIRADA" | null;
type BadgeInfo = { badge: string; stats: string };

// Entrada mais completa  
type OrderStatusInput = {
  sequence_order?: number | null;
  category?: number | null;
  delivery_method?: string | null | undefined; // <<< aceita string genérica
  description?: string | null;
};

/**
 * Retorna a variant de badge e o texto (stats) considerando:
 * - sequence_order (0..5)
 * - delivery_method (ENTREGA | RETIRADA)
 * - category (1=Processo, 2=Logística/Finalização, 3=Pagamento, 4=Conclusão)
 * - description (fallback)
 */
export const badgesVariant = ({
  sequence_order,
  delivery_method,
  category,
  description,
}: OrderStatusInput): BadgeInfo => {
  // Normaliza
  const seq = typeof sequence_order === "number" ? sequence_order : -1;
  const method = delivery_method ?? null;
  const desc = (description || "").toLowerCase().trim();

  // Casos específicos pelo contrato novo:
  // 0: Aguardo do expediente
  if (seq === 0) {
    return { badge: "aguardoExpediente", stats: "Aguardo do expediente" };
  }

  // 1: Em separação (antes era emProducao; mantenho nome "emProducao" para não quebrar estilo)
  if (seq === 1) {
    return { badge: "emProducao", stats: "Em separação" };
  }

  // 2: "Pronto para ..." depende do método
  if (seq === 2) {
    if (method === "RETIRADA") {
      return { badge: "prontoRetirada", stats: "Pronto para retirada" };
    }
    // default para entrega
    return { badge: "prontoEntrega", stats: "Pronto para entrega" };
  }

  // 3: Finalização: depende do método
  if (seq === 3) {
    if (method === "RETIRADA") {
      return { badge: "retiradoCliente", stats: "Retirado pelo cliente" };
    }
    return { badge: "entregue", stats: "Entregue" };
  }

  // 4: Pagamento pendente
  if (seq === 4) {
    return { badge: "pagamentoPendente", stats: "Aguardando pagamento" };
  }

  // 5: Concluído (mantendo seu mapeamento atual)
  if (seq === 5) {
    return { badge: "concluido", stats: "Concluído" };
  }

  // Fallbacks por descrição (para robustez futura)
  if (desc.includes("aguardo")) {
    return { badge: "aguardoExpediente", stats: "Aguardo do expediente" };
  }
  if (desc.includes("separação") || desc.includes("separacao")) {
    return { badge: "emProducao", stats: "Em separação" };
  }
  if (desc.includes("pronto para retirada")) {
    return { badge: "prontoRetirada", stats: "Pronto para retirada" };
  }
  if (desc.includes("pronto para entrega")) {
    return { badge: "prontoEntrega", stats: "Pronto para entrega" };
  }
  if (desc.includes("entregue")) {
    return { badge: "entregue", stats: "Entregue" };
  }
  if (desc.includes("retirado")) {
    return { badge: "retiradoCliente", stats: "Retirado pelo cliente" };
  }
  if (desc.includes("pagamento")) {
    if (desc.includes("pendente") || desc.includes("aguardando")) {
      return { badge: "pagamentoPendente", stats: "Aguardando pagamento" };
    }
    if (desc.includes("aprovado")) {
      return { badge: "pagamentoAprovado", stats: "Pagamento aprovado" };
    }
  }
  if (desc.includes("conclu")) {
    return { badge: "concluido", stats: "Concluído" };
  }

  // Fallback final
  return { badge: "outline", stats: description || "Status" };
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

// Converte "dd/MM/yyyy" -> "yyyy-MM-dd"; se já for "yyyy-MM-dd", retorna como está.
// Retorna null se input vazio ou inválido.
export const toISODateSafe = (v?: string | null): string | null => {
  if (!v) return null;
  const s = String(v).trim();

  // já está ISO curto
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // dd/MM/yyyy -> yyyy-MM-dd
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) {
    const [, dd, mm, yyyy] = m;
    return `${yyyy}-${mm}-${dd}`;
  }

  // outros formatos: considere inválido para evitar sujeira no payload
  return null;
};
