// apiErrorHandler.ts
import axios, { AxiosError } from "axios";

// Interface para o formato padrão de erro da API
interface ApiErrorResponse {
  detail?: string | { [key: string]: string[] };
  non_field_errors?: string[];
  [key: string]: any;
}

// Tipo para erros da API
export type ApiError = AxiosError<ApiErrorResponse>;

// Função para extrair mensagens de erro de objetos aninhados
function extractErrorMessages(errorObj: any): string[] {
  const messages: string[] = [];
  
  if (typeof errorObj === 'string') {
    messages.push(errorObj);
  } else if (Array.isArray(errorObj)) {
    messages.push(...errorObj);
  } else if (typeof errorObj === 'object' && errorObj !== null) {
    for (const key in errorObj) {
      if (errorObj.hasOwnProperty(key)) {
        const value = errorObj[key];
        if (Array.isArray(value)) {
          messages.push(...value);
        } else if (typeof value === 'string') {
          messages.push(value);
        } else if (typeof value === 'object') {
          messages.push(...extractErrorMessages(value));
        }
      }
    }
  }
  
  return messages;
}

// Função principal de tratamento de erros
export function handleApiError(error: unknown): Error {
  // Tratamento para erros do Axios
  if (axios.isAxiosError(error)) {
    const axiosError = error as ApiError;
    
    if (axiosError.response?.data) {
      const errorData = axiosError.response.data;
      
      // Verificar se tem detail (pode ser string ou objeto)
      if (errorData.detail) {
        if (typeof errorData.detail === 'string') {
          return new Error(errorData.detail);
        } else if (typeof errorData.detail === 'object') {
          const messages = extractErrorMessages(errorData.detail);
          if (messages.length > 0) {
            return new Error(messages.join(', '));
          }
        }
      }
      
      // Verificar non_field_errors
      if (errorData.non_field_errors && errorData.non_field_errors.length > 0) {
        return new Error(errorData.non_field_errors[0]);
      }
      
      // Tentar extrair qualquer mensagem de erro do objeto
      const allMessages = extractErrorMessages(errorData);
      if (allMessages.length > 0) {
        return new Error(allMessages.join(', '));
      }
    }
    
    // Fallback para mensagem do axios
    return new Error(axiosError.message || "Erro na comunicação com o servidor");
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