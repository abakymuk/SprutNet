/**
 * PortRef - Ссылка на порт
 * Основной доменный тип для идентификации портов
 */
export interface PortRef {
  /** Уникальный идентификатор порта */
  id: string;
  /** Название порта */
  name: string;
  /** Код страны (ISO 3166-1 alpha-2) */
  countryCode: string;
  /** Название страны */
  countryName: string;
  /** Код города */
  cityCode?: string;
  /** Название города */
  cityName?: string;
  /** Тип порта */
  type: PortType;
  /** Координаты порта */
  coordinates?: Coordinates;
  /** Таймзона порта (например, 'Europe/Moscow', 'Asia/Shanghai') */
  timezone?: string;
  /** Активен ли порт */
  isActive: boolean;
  /** Дата создания записи */
  createdAt: Date;
  /** Дата последнего обновления */
  updatedAt: Date;
}

/**
 * Типы портов
 */
export enum PortType {
  /** Морской порт */
  SEAPORT = 'SEAPORT',
  /** Речной порт */
  RIVERPORT = 'RIVERPORT',
  /** Контейнерный терминал */
  CONTAINER_TERMINAL = 'CONTAINER_TERMINAL',
  /** Мультимодальный терминал */
  MULTIMODAL_TERMINAL = 'MULTIMODAL_TERMINAL'
}

/**
 * Координаты порта
 */
export interface Coordinates {
  /** Широта */
  latitude: number;
  /** Долгота */
  longitude: number;
}

/**
 * Поисковый запрос для портов
 */
export interface PortSearchQuery {
  /** Поисковый запрос */
  query: string;
  /** Код страны для фильтрации */
  countryCode?: string;
  /** Тип порта для фильтрации */
  type?: PortType;
  /** Максимальное количество результатов */
  limit?: number;
  /** Смещение для пагинации */
  offset?: number;
}

/**
 * Результат поиска портов
 */
export interface PortSearchResult {
  /** Найденные порты */
  ports: PortRef[];
  /** Общее количество результатов */
  total: number;
  /** Смещение */
  offset: number;
  /** Лимит */
  limit: number;
  /** Есть ли следующая страница */
  hasNext: boolean;
}
