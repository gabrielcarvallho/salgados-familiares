// apiErrorHandler.ts
import axios, { AxiosError } from "axios";

// Interface para o formato padrão de erro da API
interface ApiErrorResponse {
  detail?: string;
  non_field_errors?: string[];
  [key: string]: any; // Permite outras propriedades
}

// Tipo para erros da API
export type ApiError = AxiosError<ApiErrorResponse>;

// Função principal de tratamento de erros
export function handleApiError(error: unknown): Error {
  // Tratamento para erros do Axios
  if (axios.isAxiosError(error)) {
    const axiosError = error as ApiError;
    
    // Mensagens prioritárias (ajuste conforme sua API)
    const errorMessage =
      axiosError.response?.data?.detail ||
      axiosError.response?.data?.non_field_errors?.[0] ||
      axiosError.message ||
      "Erro desconhecido na comunicação com o servidor";

    return new Error(errorMessage);
  }

  // Tratamento para erros genéricos
  if (error instanceof Error) {
    return error;
  }

  // Fallback para erros desconhecidos
  return new Error("Ocorreu um erro inesperado");
}

// Função para obter a mensagem de erro formatada
export function getErrorMessage(error: unknown): string {
  return handleApiError(error).message;
}