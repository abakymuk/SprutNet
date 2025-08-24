import { NextResponse } from 'next/server';
import { 
  checkEnvironmentVariables, 
  checkAllProducts, 
  checkFeatureFlags,
  getAvailableProducts 
} from '@/lib/maersk-api-checker';

export async function GET() {
  try {
    console.log('🔍 Maersk API Status Check initiated');

    // Проверяем переменные окружения
    const envCheck = checkEnvironmentVariables();
    console.log('📋 Environment check result:', envCheck);

    // Проверяем feature flags
    const featureFlags = checkFeatureFlags();
    console.log('🚩 Feature flags:', featureFlags);

    // Получаем список продуктов
    const products = getAvailableProducts();

    // Если переменные окружения не настроены, возвращаем только базовую информацию
    if (!envCheck.success) {
      return NextResponse.json({
        success: false,
        message: 'Maersk API не настроен',
        environment: envCheck,
        featureFlags,
        products: products.map(p => ({ ...p, status: 'not_configured' })),
        recommendations: [
          'Установите MAERSK_API_KEY в переменных окружения',
          'Установите MAERSK_BASE_URL (опционально)',
          'Установите FEATURE_MAERSK=true для активации API'
        ]
      });
    }

    // Если API отключен через feature flag, возвращаем соответствующую информацию
    if (!featureFlags.MAERSK_API) {
      return NextResponse.json({
        success: false,
        message: 'Maersk API отключен через feature flag',
        environment: envCheck,
        featureFlags,
        products: products.map(p => ({ ...p, status: 'disabled' })),
        recommendations: [
          'Установите FEATURE_MAERSK=true для активации API'
        ]
      });
    }

    // Проверяем доступность продуктов
    const productsCheck = await checkAllProducts();
    console.log('📦 Products check result:', productsCheck);

    return NextResponse.json({
      success: productsCheck.success,
      message: productsCheck.message,
      environment: envCheck,
      featureFlags,
      products: products.map(p => ({
        ...p,
        status: productsCheck.details?.products?.includes(p.name) ? 'active' : 'inactive'
      })),
      details: productsCheck.details,
      recommendations: productsCheck.success ? [] : [
        'Проверьте правильность MAERSK_API_KEY',
        'Убедитесь, что у вас есть доступ к запрашиваемым продуктам',
        'Проверьте сетевое подключение к api.maersk.com'
      ]
    });

  } catch (error) {
    console.error('❌ Error checking Maersk API status:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Ошибка при проверке статуса Maersk API',
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: checkEnvironmentVariables(),
      featureFlags: checkFeatureFlags(),
      products: getAvailableProducts().map(p => ({ ...p, status: 'error' }))
    }, { status: 500 });
  }
}
