import { NextResponse } from 'next/server';
import {
  checkEnvironmentVariables,
  checkProductAccess,
  checkAllProducts,
  getAvailableProducts,
  checkFeatureFlags,
  MAERSK_PRODUCTS,
} from '@/lib/maersk-api-checker';

export async function GET() {
  console.log('🔍 Maersk API Status Check initiated');

  try {
    // Проверяем переменные окружения
    const envCheck = checkEnvironmentVariables();
    console.log('📋 Environment check result:', envCheck);

    // Проверяем feature flags
    const featureFlags = checkFeatureFlags();
    console.log('🚩 Feature flags:', featureFlags);

    // Проверяем доступность продуктов
    const productsCheck = await checkAllProducts();
    console.log('📦 Products check result:', productsCheck);

    // Формируем общий статус
    const isSuccess = envCheck.success && productsCheck.success;
    const availableProducts = getAvailableProducts();
    const message = isSuccess
      ? `Доступно ${availableProducts.length} из ${MAERSK_PRODUCTS.length} продуктов`
      : 'Критические ошибки в настройке API';

    const recommendations: string[] = [];

    // Добавляем рекомендации
    if (!envCheck.success) {
      recommendations.push(
        'Проверьте настройку переменных окружения MAERSK_CONSUMER_KEY и MAERSK_CLIENT_SECRET'
      );
    }

    if (!productsCheck.success) {
      recommendations.push(
        'Убедитесь, что все необходимые продукты активированы в Maersk Developer Portal'
      );
    }

    if (availableProducts.length === 0) {
      recommendations.push(
        'Проверьте правильность API ключей и активацию продуктов'
      );
    }

    const response = {
      success: isSuccess,
      message,
      environment: envCheck,
      featureFlags,
      products: MAERSK_PRODUCTS,
      details: productsCheck.details,
      recommendations,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Error in Maersk API Status Check:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при проверке статуса API',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
