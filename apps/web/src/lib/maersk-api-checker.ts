import { MAERSK_API_CONFIG, getMaerskHeaders } from './maersk-api';
import { Maersk } from './maersk';

export interface MaerskAPICheckResult {
  success: boolean;
  message: string;
  details?: {
    products?: string[];
    endpoints?: string[];
    errors?: string[];
  };
}

export interface MaerskProduct {
  name: string;
  endpoint: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
}

export const MAERSK_PRODUCTS: MaerskProduct[] = [
  {
    name: 'Locations',
    endpoint: '/reference-data/locations',
    description: 'Справочник портов и локаций',
    status: 'inactive'
  },
  {
    name: 'Point-to-Point Schedules',
    endpoint: '/products/ocean-products',
    description: 'Расписания рейсов между портами',
    status: 'inactive'
  },
  {
    name: 'Deadlines',
    endpoint: '/shipment-deadlines',
    description: 'Дедлайны для грузов',
    status: 'inactive'
  },
  {
    name: 'Vessels',
    endpoint: '/reference-data/vessels',
    description: 'Справочник судов',
    status: 'inactive'
  }
];

/**
 * Проверяет доступность переменных окружения для Maersk API
 */
export function checkEnvironmentVariables(): MaerskAPICheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Проверяем обязательные переменные
  if (!process.env.MAERSK_CONSUMER_KEY && !process.env.MAERSK_API_KEY) {
    errors.push('MAERSK_CONSUMER_KEY или MAERSK_API_KEY не установлен');
  }

  if (!process.env.MAERSK_API_BASE_URL) {
    warnings.push('MAERSK_API_BASE_URL не установлен, используется значение по умолчанию');
  }

  if (!process.env.FEATURE_MAERSK) {
    warnings.push('FEATURE_MAERSK не установлен, API будет отключен');
  }

  if (errors.length > 0) {
    return {
      success: false,
      message: 'Критические ошибки в переменных окружения',
      details: { errors }
    };
  }

  return {
    success: true,
    message: warnings.length > 0 
      ? `Переменные окружения настроены с предупреждениями: ${warnings.join(', ')}`
      : 'Переменные окружения настроены корректно',
    details: { errors: warnings }
  };
}

/**
 * Проверяет доступность конкретного продукта Maersk API
 */
export async function checkProductAccess(product: MaerskProduct): Promise<MaerskProduct> {
  try {
    let url: string;
    
    // Специальные параметры для каждого продукта
    switch (product.name) {
      case 'Locations':
        url = `${product.endpoint}`;
        break;
      case 'Point-to-Point Schedules':
        // Для P2P нужны все обязательные параметры включая vesselOperatorCarrierCode
        url = `${product.endpoint}?collectionOriginCountryCode=US&collectionOriginCityName=New%20York&deliveryDestinationCountryCode=DE&deliveryDestinationCityName=Hamburg&vesselOperatorCarrierCode=MAEU&limit=1`;
        break;
      case 'Deadlines':
        // Для Deadlines нужны vesselIMONumber и voyage
        url = `${product.endpoint}?ISOCountryCode=US&portOfLoad=New%20York&vesselIMONumber=9456783&voyage=216E&limit=1`;
        break;
      case 'Vessels':
        url = `${product.endpoint}?limit=1`;
        break;
      default:
        url = `${product.endpoint}?limit=1`;
    }
    
    console.log(`🔍 Проверяем продукт ${product.name}: ${url}`);

    try {
      const response = await Maersk.fetch(url);
      
      console.log(`✅ ${product.name} активен, получено ${Array.isArray(response.data) ? response.data.length : 'данные'}`);
      return { ...product, status: 'active' };
    } catch (error: any) {
      if (error.status === 404) {
        // 404 означает, что API доступен, но данных для этих параметров нет
        console.log(`✅ ${product.name} доступен, но данных нет (404)`);
        return { ...product, status: 'active' };
      } else if (error.status === 401) {
        console.log(`❌ ${product.name}: ошибка аутентификации`);
        return { ...product, status: 'error' };
      } else {
        console.log(`⚠️ ${product.name}: недоступен (${error.status})`);
        return { ...product, status: 'inactive' };
      }
    }
  } catch (error) {
    console.error(`❌ Ошибка при проверке продукта ${product.name}:`, error);
    return { ...product, status: 'error' };
  }
}

/**
 * Проверяет доступность всех продуктов Maersk API
 */
export async function checkAllProducts(): Promise<MaerskAPICheckResult> {
  const envCheck = checkEnvironmentVariables();
  if (!envCheck.success) {
    return envCheck;
  }

  const products = await Promise.all(
    MAERSK_PRODUCTS.map(product => checkProductAccess(product))
  );

  const activeProducts = products.filter(p => p.status === 'active');
  const inactiveProducts = products.filter(p => p.status === 'inactive');
  const errorProducts = products.filter(p => p.status === 'error');

  const success = activeProducts.length > 0;
  const message = success
    ? `Доступно ${activeProducts.length} из ${products.length} продуктов`
    : 'Нет доступных продуктов Maersk API';

  return {
    success,
    message,
    details: {
      products: activeProducts.map(p => p.name),
      endpoints: activeProducts.map(p => p.endpoint),
      errors: [
        ...inactiveProducts.map(p => `${p.name}: недоступен`),
        ...errorProducts.map(p => `${p.name}: ошибка доступа`)
      ]
    }
  };
}

/**
 * Получает информацию о доступных продуктах
 */
export function getAvailableProducts(): MaerskProduct[] {
  return MAERSK_PRODUCTS;
}

/**
 * Проверяет статус feature flags
 */
export function checkFeatureFlags(): Record<string, boolean> {
  return {
    MAERSK_API: process.env.FEATURE_MAERSK === 'true',
    DEADLINES: process.env.FEATURE_DEADLINES === 'true',
    CACHE_ENABLED: process.env.CACHE_TTL_MINUTES !== undefined,
  };
}
