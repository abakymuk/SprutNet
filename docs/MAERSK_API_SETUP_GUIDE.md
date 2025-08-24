# Maersk API Setup Guide

## 🎉 Статус: ВСЕ API ПРОДУКТЫ ДОСТУПНЫ!

**Текущий статус (v1.0.1):**
- ✅ **Locations API** - Активен и работает
- ✅ **Point-to-Point Schedules API** - Активен и работает  
- ✅ **Deadlines API** - Активен и работает
- ✅ **Vessels API** - Активен и работает

## Получение API ключей

1. Зарегистрируйтесь на [Maersk Developer Portal](https://developer.maersk.com/)
2. Создайте новое приложение
3. Активируйте следующие продукты:
   - **Locations** (Reference Data)
   - **Point-to-Point Schedules** (Ocean Products)
   - **Deadlines** (Shipment Deadlines)
   - **Vessels** (Reference Data)
4. Получите API ключи:
   - **Consumer Key**: `IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd`
   - **Client Secret**: `CnIcg3YgUUtSp8a3`

## Настройка переменных окружения

### Локальная разработка

Создайте файл `apps/web/.env.local`:

```env
# Maersk API Configuration
MAERSK_API_KEY=IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd
MAERSK_API_SECRET=CnIcg3YgUUtSp8a3
MAERSK_API_BASE_URL=https://api.maersk.com

# Maersk API Endpoints
MAERSK_LOCATIONS_API_URL=https://api.maersk.com/reference-data
MAERSK_P2P_API_URL=https://api.maersk.com/products
MAERSK_VESSELS_API_URL=https://api.maersk.com/reference-data
MAERSK_DEADLINES_API_URL=https://api.maersk.com

# Feature Flags
FEATURE_MAERSK=true
FEATURE_DEADLINES=true

# Cache Configuration
CACHE_TTL_MINUTES=10
```

### GitHub Secrets

Добавьте следующие секреты в настройках репозитория:

- `MAERSK_API_KEY`: `IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd`
- `MAERSK_API_SECRET`: `CnIcg3YgUUtSp8a3`
- `MAERSK_API_BASE_URL`: `https://api.maersk.com`
- `MAERSK_LOCATIONS_API_URL`: `https://api.maersk.com/reference-data`
- `MAERSK_P2P_API_URL`: `https://api.maersk.com/products`
- `MAERSK_VESSELS_API_URL`: `https://api.maersk.com/reference-data`
- `MAERSK_DEADLINES_API_URL`: `https://api.maersk.com`
- `FEATURE_MAERSK`: `true`
- `FEATURE_DEADLINES`: `true`
- `CACHE_TTL_MINUTES`: `10`

### Vercel Environment Variables

Добавьте те же переменные в настройках проекта Vercel.

## Проверка статуса API

### Веб-интерфейс
Откройте [http://localhost:3000/maersk-status](http://localhost:3000/maersk-status) для проверки статуса всех API продуктов.

### API Endpoint
```bash
curl http://localhost:3000/api/maersk-status
```

### Прямая проверка API

```bash
# Locations API
curl 'https://api.maersk.com/reference-data/locations' \
  --header 'Consumer-Key: IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd'

# Vessels API
curl 'https://api.maersk.com/reference-data/vessels?limit=1' \
  --header 'Consumer-Key: IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd'

# Point-to-Point Schedules API
curl 'https://api.maersk.com/products/ocean-products?collectionOriginCountryCode=US&collectionOriginCityName=New%20York&deliveryDestinationCountryCode=DE&deliveryDestinationCityName=Hamburg&vesselOperatorCarrierCode=MAEU&limit=1' \
  --header 'Consumer-Key: IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd'

# Deadlines API
curl 'https://api.maersk.com/shipment-deadlines?ISOCountryCode=US&portOfLoad=New%20York&vesselIMONumber=9456783&voyage=216E&limit=1' \
  --header 'Consumer-Key: IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd'
```

## Использование в коде

### Импорт конфигурации
```typescript
import { MAERSK_API_CONFIG, getMaerskHeaders } from '@/lib/maersk-api';
```

### Пример запроса
```typescript
const response = await fetch(`${MAERSK_API_CONFIG.baseUrl}/reference-data/locations`, {
  method: 'GET',
  headers: getMaerskHeaders(),
});

if (response.ok) {
  const data = await response.json();
  console.log('Locations:', data);
}
```

## Рекомендации по безопасности

1. **Никогда не коммитьте API ключи** в репозиторий
2. Используйте `.env.local` для локальной разработки
3. Используйте GitHub Secrets для CI/CD
4. Регулярно ротируйте API ключи
5. Ограничивайте доступ к API по IP адресам в Maersk Developer Portal

## Устранение неполадок

### Ошибка 401 - Unauthorized
- Проверьте правильность API ключей
- Убедитесь, что продукты активированы в Developer Portal

### Ошибка 400 - Bad Request
- Проверьте обязательные параметры для каждого API
- Убедитесь в правильности формата данных

### Ошибка 404 - Not Found
- Для некоторых API это нормально (данных нет для указанных параметров)
- Попробуйте другие параметры поиска

### API недоступен
- Проверьте статус Maersk API на [developer.maersk.com](https://developer.maersk.com/)
- Убедитесь, что ваш аккаунт активен

## Обновления и изменения

- **v1.0.1**: Все 4 API продукта успешно подключены и работают
- **v1.0.0**: Базовая настройка и подключение к Maersk API
