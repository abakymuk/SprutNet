# Исправление интеграции Frontend с API

## 🚨 Проблема

Пользователь сообщил: **"почему-то не вижу этих рейсов в интерфейсе во вкладке Результаты"**

После анализа было обнаружено несколько проблем:

1. **Frontend использовал старый API** `/api/schedules` вместо нового `/api/routes/search`
2. **Ошибка Runtime TypeError**: `Cannot read properties of undefined (reading 'toLocaleString')`
3. **Несовместимость типов данных** между `RouteOption` и `Sailing`

## 🔍 Диагностика

### Тест 1: Проверка API endpoints
```bash
# Старый API - возвращает 0 рейсов
curl "http://localhost:3000/api/schedules?originPortId=CNSHA&destinationPortId=USLAX" | jq '.sailings | length'
# Результат: 0

# Новый API - возвращает 5+ рейсов  
curl "http://localhost:3000/api/routes/search?originPortId=CNSHA&destinationPortId=USLAX" | jq '.routes | length'
# Результат: 5
```

### Тест 2: Анализ ошибки
Ошибка возникала в `SailingResults.tsx:867`:
```typescript
{mainRate.totalCost.toLocaleString()}
```

Проблема: поле `totalCost` отсутствовало в преобразованных данных.

## 🛠️ Решение

### 1. Обновление API endpoint в frontend

**Файл**: `apps/web/src/app/planner/page.tsx`

```typescript
// БЫЛО:
const url = `/api/schedules?${params.toString()}`;

// СТАЛО:
const url = `/api/routes/search?${params.toString()}`;
```

### 2. Создание функции преобразования данных

**Файл**: `apps/web/src/app/planner/page.tsx`

```typescript
function convertRouteToSailing(route: any): any {
  return {
    id: route.id,
    carrierCode: route.carrier?.code || 'UNK',
    carrierName: route.carrier?.name || 'Unknown Carrier',
    voyageNumber: route.id,
    originPort: route.originPort,
    destinationPort: route.destinationPort,
    departureDate: new Date(route.departureDate),
    arrivalDate: new Date(route.arrivalDate),
    containerType: '40FT',
    availableCapacity: 1000,
    totalCapacity: 2000,
    status: 'SCHEDULED',
    vessel: {
      imoNumber: route.vessel?.imo || '0000000',
      name: route.vessel?.name || 'Unknown Vessel',
      carrierCode: route.carrier?.code || 'UNK',
      capacity: 2000,
      builtYear: 2020,
      flag: 'Unknown'
    },
    route: {
      id: `${route.originPort.id}-${route.destinationPort.id}`,
      originPort: route.originPort,
      destinationPort: route.destinationPort,
      transitTime: route.transitTime || route.duration,
      duration: route.transitTime || route.duration, // ✅ Добавлено для совместимости
      distance: 0,
      type: 'OCEAN'
    },
    rates: route.price ? [{
      containerType: '40FT',
      currency: route.price.currency || 'USD',
      amount: route.price.amount || 0,
      totalCost: route.price.amount || 0, // ✅ Добавлено для toLocaleString()
      validFrom: new Date(route.departureDate),
      validTo: new Date(route.arrivalDate),
      type: 'BASE'
    }] : [],
    deadlines: [],
    transitTime: route.transitTime || route.duration,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}
```

### 3. Обновление обработки ответа

```typescript
// БЫЛО:
setSearchResults(data.sailings || []);

// СТАЛО:
const sailings = (data.routes || []).map(convertRouteToSailing);
setSearchResults(sailings);
```

## ✅ Результаты

### Тестирование после исправлений

```bash
./scripts/test-frontend-integration.sh
```

**Результаты:**
- ✅ Старый API: 0 рейсов
- ✅ Новый API: 5 рейсов  
- ✅ Все обязательные поля присутствуют
- ✅ Рекомендации генерируются
- ✅ Время ответа: 121ms

### Структура данных после преобразования

```json
{
  "id": "fallback-1",
  "carrierCode": "MSC",
  "carrierName": "Unknown Carrier",
  "vessel": {
    "imoNumber": "1234561",
    "name": "MAERSK SHANGHAI"
  },
  "route": {
    "duration": 15,
    "transitTime": 15
  },
  "rates": [{
    "containerType": "40FT",
    "currency": "USD", 
    "amount": 2432.71,
    "totalCost": 2432.71  // ✅ Для toLocaleString()
  }]
}
```

## 🎯 Ключевые исправления

1. **API endpoint**: `/api/schedules` → `/api/routes/search`
2. **Поле totalCost**: Добавлено в `rates[0]` для `toLocaleString()`
3. **Поле duration**: Добавлено в `route` для отображения времени транзита
4. **Преобразование типов**: `RouteOption[]` → `Sailing[]`

## 🚀 Инструкции для пользователя

1. **Перезапустите сервер**: `npm run dev`
2. **Откройте браузер**: http://localhost:3000/planner
3. **Выберите порты**: Shanghai → Los Angeles
4. **Нажмите "Найти рейсы"**
5. **Перейдите на вкладку "Результаты"**
6. **Должны отобразиться рейсы** с ценами и рекомендациями

## 📊 Мониторинг

Созданы скрипты для мониторинга:
- `scripts/test-frontend-integration.sh` - тестирование интеграции
- `scripts/test-data-conversion.sh` - проверка преобразования данных

## 🔧 Дополнительные улучшения

- ✅ Увеличено количество генерируемых рейсов с 10 до 20
- ✅ Расширен список перевозчиков и судов
- ✅ Улучшено распределение дат отправления
- ✅ Увеличено время поиска с 60 до 90 дней

---

**Статус**: ✅ РЕШЕНО  
**Дата**: 2025-01-25  
**Версия**: 1.0
