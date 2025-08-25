# UC1: Поиск рейса (Find Route)

## 🎯 Job To Be Done (JTBD)

**«Мне нужно быстро понять, каким рейсом я могу отправить груз»**

## 📋 Описание Use Case

Пользователь хочет найти доступные рейсы для отправки груза из одного порта в другой в определенный период времени и получить рекомендации по лучшим вариантам.

### Основные требования:
- ✅ Ввести порт отправления (POL) и назначения (POD)
- ✅ Указать диапазон дат
- ✅ Получить список доступных рейсов
- ✅ Видеть лучшие варианты (Earliest, Shortest, Balanced)

## 🚀 API Endpoint

### GET `/api/routes/search`

**Описание:** Поиск рейсов с параметрами в URL

**Параметры:**
- `originPortId` (обязательный) - код порта отправления
- `destinationPortId` (обязательный) - код порта назначения
- `departureDateFrom` (опциональный) - дата отправления от (YYYY-MM-DD)
- `departureDateTo` (опциональный) - дата отправления до (YYYY-MM-DD)
- `containerType` (опциональный) - тип контейнера
- `limit` (опциональный) - количество результатов (по умолчанию 20)

**Пример запроса:**
```bash
curl "http://localhost:3000/api/routes/search?originPortId=CNSHA&destinationPortId=USLAX&departureDateFrom=2024-12-01&departureDateTo=2024-12-31&limit=5"
```

### POST `/api/routes/search`

**Описание:** Поиск рейсов с JSON body

**Тело запроса:**
```json
{
  "originPortId": "CNSHA",
  "destinationPortId": "USLAX",
  "departureDateFrom": "2024-12-01",
  "departureDateTo": "2024-12-31",
  "containerType": "40HC",
  "limit": 10
}
```

**Пример запроса:**
```bash
curl -X POST "http://localhost:3000/api/routes/search" \
  -H "Content-Type: application/json" \
  -d '{
    "originPortId": "CNSHA",
    "destinationPortId": "USLAX",
    "departureDateFrom": "2024-12-01",
    "departureDateTo": "2024-12-31",
    "limit": 5
  }'
```

## 📊 Структура ответа

```json
{
  "success": true,
  "routes": [
    {
      "id": "MAEU-1704067200000",
      "originPort": {
        "id": "CNSHA",
        "name": "Shanghai",
        "countryCode": "CN",
        "countryName": "China"
      },
      "destinationPort": {
        "id": "USLAX",
        "name": "Los Angeles",
        "countryCode": "US",
        "countryName": "United States"
      },
      "departureDate": "2024-01-01T00:00:00.000Z",
      "arrivalDate": "2024-01-15T00:00:00.000Z",
      "duration": 14,
      "carrier": {
        "code": "MAEU",
        "name": "Maersk"
      },
      "vessel": {
        "name": "MAERSK SEVILLE",
        "imo": "1234567"
      },
      "transitTime": 14,
      "price": {
        "currency": "USD",
        "amount": 2500
      },
      "reliability": 85,
      "score": 78
    }
  ],
  "total": 10,
  "source": "maersk",
  "cached": false,
  "responseTime": 245,
  "recommendations": {
    "earliest": { /* самый ранний рейс */ },
    "shortest": { /* самый короткий рейс */ },
    "balanced": { /* лучший по общему скору */ }
  }
}
```

## 🎯 Рекомендации

### Earliest (Самый ранний)
- Рейс с самой ранней датой отправления
- Подходит для срочных грузов
- Может иметь более длительное время в пути

### Shortest (Самый короткий)
- Рейс с минимальным временем в пути
- Подходит для скоропортящихся грузов
- Может быть дороже

### Balanced (Сбалансированный)
- Рейс с лучшим общим скором
- Учитывает время в пути, надежность, перевозчика
- Оптимальный выбор для большинства случаев

## 🔧 Алгоритм расчета скора

```typescript
function calculateScore(schedule: any, duration: number, reliability: number): number {
  let score = 50; // базовый скор
  
  // Фактор времени в пути (короче = лучше)
  if (duration <= 7) score += 30;
  else if (duration <= 14) score += 20;
  else if (duration <= 21) score += 10;
  
  // Фактор надежности
  score += (reliability - 70) * 0.3;
  
  // Фактор перевозчика
  if (schedule.carrier?.code === 'MAEU') score += 15;
  
  return Math.max(0, Math.min(100, score));
}
```

## 🧪 Тестирование

### Автоматическое тестирование
```bash
./scripts/test-uc1-routes.sh
```

### Ручное тестирование
```bash
# Тест 1: Shanghai -> Los Angeles
curl "http://localhost:3000/api/routes/search?originPortId=CNSHA&destinationPortId=USLAX&departureDateFrom=2024-12-01&departureDateTo=2024-12-31&limit=5"

# Тест 2: New York -> Rotterdam
curl "http://localhost:3000/api/routes/search?originPortId=USNYC&destinationPortId=NLRTM&departureDateFrom=2024-12-01&departureDateTo=2024-12-31&limit=5"

# Тест 3: Singapore -> Hamburg
curl "http://localhost:3000/api/routes/search?originPortId=SGSIN&destinationPortId=DEHAM&departureDateFrom=2024-12-01&departureDateTo=2024-12-31&limit=5"
```

## 📈 Производительность

### Кэширование
- **Supabase кэш**: 2 часа TTL
- **API кэш**: 30 минут TTL
- **Автоматическая очистка** устаревших данных

### Оптимизация
- Запрос большего количества рейсов для лучших рекомендаций
- Сортировка по скору для приоритизации
- Ленивая загрузка деталей

## 🔍 Мониторинг

### Метрики
- Время ответа API
- Количество найденных рейсов
- Источник данных (maersk/cache/fallback)
- Статистика использования маршрутов

### Логирование
```typescript
logger.info('Routes search completed', {
  route: `${originPortId}-${destinationPortId}`,
  responseTime,
  totalRoutes: routes.length,
  source: 'maersk'
});
```

## 🚨 Обработка ошибок

### Валидация
- Обязательные параметры: `originPortId`, `destinationPortId`
- Формат дат: YYYY-MM-DD
- Лимиты: 1-100 результатов

### Ошибки API
```json
{
  "success": false,
  "error": "originPortId and destinationPortId are required",
  "details": "Please provide both origin and destination port IDs"
}
```

### Fallback режим
- При недоступности Maersk API используются fallback данные
- В режиме реальных данных возвращается ошибка 503

## 🎨 Frontend интеграция

### Пример использования в React
```typescript
const searchRoutes = async (params: RouteSearchQuery) => {
  const response = await fetch('/api/routes/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Показать список рейсов
    setRoutes(data.routes);
    
    // Показать рекомендации
    setRecommendations(data.recommendations);
  }
};
```

## 📋 Чек-лист готовности

- ✅ API endpoint создан
- ✅ Поддержка GET и POST запросов
- ✅ Валидация параметров
- ✅ Рекомендации (Earliest, Shortest, Balanced)
- ✅ Кэширование данных
- ✅ Обработка ошибок
- ✅ Логирование и мониторинг
- ✅ Тестирование
- ✅ Документация

## 🔗 Связанные компоненты

- **API Schedules** - базовый API расписаний
- **Route Cache Service** - кэширование маршрутов
- **Maersk API Integration** - получение реальных данных
- **Port Search API** - поиск портов
- **Vessel API** - информация о судах
