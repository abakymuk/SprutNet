import { getErrorMessage, getErrorType } from './messages';

export interface ErrorHandlerOptions {
  onRetry?: () => void;
  onUseDemo?: () => void;
  onFixData?: () => void;
  autoRetry?: boolean;
  retryDelay?: number;
  maxRetries?: number;
}

export interface ErrorInfo {
  code: string | number;
  message: string;
  type: 'client' | 'server' | 'network' | 'validation' | 'unknown';
  shouldRetry: boolean;
  shouldShowDemo: boolean;
  shouldShowFixData: boolean;
}

// Функция для анализа ошибки и определения действий
export function analyzeError(
  error: any, 
  options: ErrorHandlerOptions = {}
): ErrorInfo {
  let code = 'UNKNOWN_ERROR';
  let message = 'Произошла неизвестная ошибка';
  
  // Извлекаем код ошибки
  if (error?.status) {
    code = error.status.toString();
  } else if (error?.code) {
    code = error.code;
  } else if (error?.message) {
    // Пытаемся извлечь код из сообщения
    const statusMatch = error.message.match(/status[:\s]*(\d+)/i);
    if (statusMatch) {
      code = statusMatch[1];
    }
  }
  
  // Получаем человечное сообщение
  const errorMessage = getErrorMessage(code);
  message = errorMessage.message;
  
  // Определяем тип ошибки
  const type = getErrorType(code);
  
  // Определяем, какие действия доступны
  const shouldRetry = type === 'network' || code === '429';
  const shouldShowDemo = type === 'server' || code.toString().startsWith('5');
  const shouldShowFixData = (type === 'validation' || code.toString().startsWith('4')) && code !== '429';
  
  return {
    code,
    message,
    type,
    shouldRetry,
    shouldShowDemo,
    shouldShowFixData,
  };
}

// Функция для автоматического повтора запроса
export function createRetryHandler(
  retryFn: () => Promise<any>,
  options: ErrorHandlerOptions = {}
): () => Promise<any> {
  const {
    autoRetry = true,
    retryDelay = 2000,
    maxRetries = 3,
    onRetry
  } = options;
  
  let retryCount = 0;
  
  return async () => {
    if (!autoRetry || retryCount >= maxRetries) {
      throw new Error('Max retries exceeded');
    }
    
    retryCount++;
    
    // Вызываем callback если предоставлен
    if (onRetry) {
      onRetry();
    }
    
    // Ждем перед повтором
    await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
    
    // Выполняем повторный запрос
    return retryFn();
  };
}

// Функция для обработки ошибок API
export function handleApiError(
  error: any,
  context: string = 'api',
  options: ErrorHandlerOptions = {}
): void {
  const errorInfo = analyzeError(error, options);
  
  // Логируем ошибку
  console.error(`[${context}] Error:`, {
    code: errorInfo.code,
    type: errorInfo.type,
    message: errorInfo.message,
    originalError: error,
  });
  
  // Для 429 ошибок можно добавить автоматический повтор
  if (errorInfo.code === '429' && options.autoRetry) {
    console.log(`[${context}] Rate limited, will retry automatically`);
  }
  
  // Для серверных ошибок можно показать fallback
  if (errorInfo.shouldShowDemo && options.onUseDemo) {
    console.log(`[${context}] Server error, suggesting demo data`);
  }
}

// Функция для создания обработчика ошибок с fallback
export function createErrorHandler(
  options: ErrorHandlerOptions = {}
) {
  return {
    handle: (error: any, context?: string) => {
      handleApiError(error, context, options);
    },
    
    analyze: (error: any) => {
      return analyzeError(error, options);
    },
    
    retry: (retryFn: () => Promise<any>) => {
      return createRetryHandler(retryFn, options);
    }
  };
}

// Функция для извлечения кода ошибки из различных источников
export function extractErrorCode(error: any): string | number {
  if (typeof error === 'string') {
    return error;
  }
  
  if (typeof error === 'number') {
    return error;
  }
  
  if (error?.status) {
    return error.status.toString();
  }
  
  if (error?.code) {
    return error.code;
  }
  
  if (error?.response?.status) {
    return error.response.status.toString();
  }
  
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error?.message) {
    // Пытаемся извлечь код из сообщения
    const statusMatch = error.message.match(/status[:\s]*(\d+)/i);
    if (statusMatch) {
      return statusMatch[1];
    }
    
    // Проверяем на специфичные ошибки
    if (error.message.includes('network')) return 'NETWORK_ERROR';
    if (error.message.includes('timeout')) return 'TIMEOUT_ERROR';
    if (error.message.includes('cors')) return 'CORS_ERROR';
    if (error.message.includes('validation')) return 'VALIDATION_ERROR';
  }
  
  return 'UNKNOWN_ERROR';
}

// Функция для определения, нужно ли показывать fallback
export function shouldShowFallback(error: any): boolean {
  const code = extractErrorCode(error);
  const type = getErrorType(code);
  
  return type === 'server' || 
         code.toString().startsWith('5') || 
         code === 'MAERSK_API_ERROR' ||
         code === 'MAERSK_UNAVAILABLE';
}

// Функция для определения, нужно ли повторять запрос
export function shouldRetry(error: any): boolean {
  const code = extractErrorCode(error);
  const type = getErrorType(code);
  
  return type === 'network' || 
         code === '429' || 
         code === 'TIMEOUT_ERROR' ||
         code === 'NETWORK_ERROR';
}
