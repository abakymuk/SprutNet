export interface ErrorMessage {
  title: string;
  message: string;
  suggestion?: string;
  action?: string;
}

export interface ErrorMessages {
  [key: string]: ErrorMessage;
}

// Словарь человечных сообщений об ошибках
export const ERROR_MESSAGES: ErrorMessages = {
  // HTTP ошибки
  '400': {
    title: 'Неверный запрос',
    message: 'Проверьте правильность введенных данных и попробуйте снова.',
    suggestion: 'Убедитесь, что все поля заполнены корректно.',
    action: 'Исправить данные'
  },
  
  '401': {
    title: 'Ошибка авторизации',
    message: 'Не удалось авторизоваться в системе.',
    suggestion: 'Проверьте правильность учетных данных.',
    action: 'Войти снова'
  },
  
  '403': {
    title: 'Доступ запрещен',
    message: 'У вас нет прав для выполнения этого действия.',
    suggestion: 'Обратитесь к администратору для получения доступа.',
    action: 'Обратиться в поддержку'
  },
  
  '404': {
    title: 'Данные не найдены',
    message: 'По вашему запросу ничего не найдено.',
    suggestion: 'Попробуйте изменить параметры поиска или даты.',
    action: 'Изменить параметры'
  },
  
  '429': {
    title: 'Слишком много запросов',
    message: 'Превышен лимит запросов к серверу.',
    suggestion: 'Мы автоматически повторим запрос через несколько секунд.',
    action: 'Повторить сейчас'
  },
  
  '500': {
    title: 'Ошибка сервера',
    message: 'Произошла внутренняя ошибка на сервере.',
    suggestion: 'Попробуйте позже или используйте демо-данные.',
    action: 'Использовать демо-данные'
  },
  
  '502': {
    title: 'Ошибка шлюза',
    message: 'Сервер временно недоступен.',
    suggestion: 'Попробуйте позже или используйте демо-данные.',
    action: 'Использовать демо-данные'
  },
  
  '503': {
    title: 'Сервис недоступен',
    message: 'Сервис временно не работает.',
    suggestion: 'Попробуйте позже или используйте демо-данные.',
    action: 'Использовать демо-данные'
  },
  
  '504': {
    title: 'Превышено время ожидания',
    message: 'Сервер не ответил в течение ожидаемого времени.',
    suggestion: 'Попробуйте позже или используйте демо-данные.',
    action: 'Использовать демо-данные'
  },

  // Специфичные ошибки API
  'SCHEDULES_NOT_FOUND': {
    title: 'Расписания не найдены',
    message: 'Не найдено расписаний по выбранным портам и датам.',
    suggestion: 'Попробуйте изменить порты отправления/назначения или даты.',
    action: 'Изменить параметры'
  },
  
  'PORTS_NOT_FOUND': {
    title: 'Порты не найдены',
    message: 'Не найдено портов по вашему запросу.',
    suggestion: 'Попробуйте изменить название порта или страны.',
    action: 'Изменить поиск'
  },
  
  'VESSEL_NOT_FOUND': {
    title: 'Судно не найдено',
    message: 'Информация о судне не найдена.',
    suggestion: 'Проверьте правильность IMO номера.',
    action: 'Проверить IMO'
  },
  
  'DEADLINES_NOT_FOUND': {
    title: 'Дедлайны не найдены',
    message: 'Дедлайны для выбранного рейса не найдены.',
    suggestion: 'Попробуйте выбрать другой рейс или обратитесь к перевозчику.',
    action: 'Выбрать другой рейс'
  },

  // Сетевые ошибки
  'NETWORK_ERROR': {
    title: 'Ошибка подключения',
    message: 'Не удалось подключиться к серверу.',
    suggestion: 'Проверьте интернет-соединение и попробуйте снова.',
    action: 'Повторить подключение'
  },
  
  'TIMEOUT_ERROR': {
    title: 'Превышено время ожидания',
    message: 'Запрос не был выполнен в течение ожидаемого времени.',
    suggestion: 'Попробуйте позже или используйте демо-данные.',
    action: 'Использовать демо-данные'
  },
  
  'CORS_ERROR': {
    title: 'Ошибка доступа',
    message: 'Не удалось получить доступ к ресурсу.',
    suggestion: 'Попробуйте обновить страницу или обратитесь в поддержку.',
    action: 'Обновить страницу'
  },

  // Ошибки валидации
  'VALIDATION_ERROR': {
    title: 'Ошибка в данных',
    message: 'Проверьте правильность введенных данных.',
    suggestion: 'Убедитесь, что все обязательные поля заполнены корректно.',
    action: 'Исправить данные'
  },
  
  'DATE_RANGE_ERROR': {
    title: 'Неверный диапазон дат',
    message: 'Выбранный диапазон дат некорректен.',
    suggestion: 'Дата отправления должна быть раньше даты прибытия.',
    action: 'Изменить даты'
  },
  
  'PORT_SAME_ERROR': {
    title: 'Одинаковые порты',
    message: 'Порт отправления и назначения не могут быть одинаковыми.',
    suggestion: 'Выберите разные порты для отправления и назначения.',
    action: 'Изменить порты'
  },

  // Ошибки Maersk API
  'MAERSK_API_ERROR': {
    title: 'Ошибка API поставщика',
    message: 'Не удалось получить данные от поставщика услуг.',
    suggestion: 'Попробуйте позже или используйте демо-данные.',
    action: 'Использовать демо-данные'
  },
  
  'MAERSK_RATE_LIMIT': {
    title: 'Превышен лимит запросов',
    message: 'Превышен лимит запросов к API поставщика.',
    suggestion: 'Мы автоматически повторим запрос через несколько секунд.',
    action: 'Повторить сейчас'
  },
  
  'MAERSK_UNAVAILABLE': {
    title: 'API поставщика недоступен',
    message: 'Сервис поставщика временно недоступен.',
    suggestion: 'Попробуйте позже или используйте демо-данные.',
    action: 'Использовать демо-данные'
  },

  // Общие ошибки
  'UNKNOWN_ERROR': {
    title: 'Неизвестная ошибка',
    message: 'Произошла непредвиденная ошибка.',
    suggestion: 'Попробуйте обновить страницу или обратитесь в поддержку.',
    action: 'Обновить страницу'
  },
  
  'FALLBACK_AVAILABLE': {
    title: 'Используются демо-данные',
    message: 'В связи с техническими проблемами используются демонстрационные данные.',
    suggestion: 'Демо-данные показывают примеры рейсов для ознакомления.',
    action: 'Попробовать снова'
  }
};

// Функция для получения сообщения об ошибке по коду
export function getErrorMessage(errorCode: string | number): ErrorMessage {
  const code = errorCode.toString();
  
  // Сначала ищем точное совпадение
  if (ERROR_MESSAGES[code]) {
    return ERROR_MESSAGES[code];
  }
  
  // Затем ищем по категориям
  if (code.startsWith('4')) {
    return ERROR_MESSAGES['400'];
  }
  
  if (code.startsWith('5')) {
    return ERROR_MESSAGES['500'];
  }
  
  // По умолчанию возвращаем неизвестную ошибку
  return ERROR_MESSAGES['UNKNOWN_ERROR'];
}

// Функция для определения типа ошибки
export function getErrorType(errorCode: string | number): 'client' | 'server' | 'network' | 'validation' | 'unknown' {
  const code = errorCode.toString();
  
  if (code.startsWith('4')) {
    if (code === '429') return 'network';
    if (code === '400' || code === '422') return 'validation';
    return 'client';
  }
  
  if (code.startsWith('5')) {
    return 'server';
  }
  
  if (code.includes('NETWORK') || code.includes('TIMEOUT') || code.includes('CORS')) {
    return 'network';
  }
  
  if (code.includes('VALIDATION') || code.includes('DATE') || code.includes('PORT')) {
    return 'validation';
  }
  
  return 'unknown';
}

// Функция для получения иконки ошибки
export function getErrorIcon(errorType: string): string {
  switch (errorType) {
    case 'client':
    case 'validation':
      return 'AlertTriangle';
    case 'server':
      return 'Server';
    case 'network':
      return 'Wifi';
    default:
      return 'AlertCircle';
  }
}

// Функция для получения цвета ошибки
export function getErrorColor(errorType: string): string {
  switch (errorType) {
    case 'client':
    case 'validation':
      return 'text-orange-600';
    case 'server':
      return 'text-red-600';
    case 'network':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
}
