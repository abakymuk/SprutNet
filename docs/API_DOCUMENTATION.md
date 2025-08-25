# API Документация SprutNet Shipping Planner

## Обзор

SprutNet Shipping Planner предоставляет REST API для работы с данными Maersk о портах, судах, расписаниях и дедлайнах.

## Базовые принципы

### Аутентификация
API использует API ключи Maersk для аутентификации. Ключи должны быть настроены в переменных окружения.

### Формат ответов
Все API endpoints возвращают JSON в следующем формате:

```json
{
  "success": true,
  "data": {...},
  "message": "Опциональное сообщение",
  "error": "Опциональная ошибка"
}
```

### Коды ошибок
- `200` - Успешный запрос
- `400` - Неверные параметры запроса
- `401` - Неавторизованный доступ
- `403` - Доступ запрещен
- `404` - Ресурс не найден
- `429` - Превышен лимит запросов
- `500` - Внутренняя ошибка сервера

## Endpoints

### 1. Поиск портов

**GET** `/api/ports/search`

Поиск портов по названию, коду или стране.

#### Параметры запроса
- `q` (string, обязательный) - Поисковый запрос
- `limit` (number, опциональный) - Лимит результатов (по умолчанию: 10)

#### Пример запроса
```bash
GET /api/ports/search?q=sha&limit=5
```

#### Пример ответа
```json
{
  "success": true,
  "ports": [
    {
      "id": "CNSHA",
      "name": "Shanghai",
      "countryCode": "CN",
      "countryName": "China",
      "cityName": "Shanghai",
      "type": "SEAPORT",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "data": [...], // Дублирует ports для обратной совместимости
  "total": 1
}
```

### 2. Информация о судне

**GET** `/api/vessels/{imo}`

Получение информации о судне по IMO номеру.

#### Параметры пути
- `imo` (string, обязательный) - 7-значный IMO номер судна

#### Пример запроса
```bash
GET /api/vessels/1234567
```

#### Пример ответа
```json
{
  "imo": "1234567",
  "name": "MAERSK SEVILLE",
  "vessel": {
    "imo": "1234567",
    "name": "MAERSK SEVILLE",
    "operator": "MAEU",
    "size": 15000,
    "flag": "DK",
    "builtYear": 2018
  },
  "source": "maersk"
}
```

### 3. Поиск расписаний

**GET** `/api/schedules`

Поиск расписаний рейсов между портами.

#### Параметры запроса
- `originPortId` (string, обязательный) - Код порта отправления
- `destinationPortId` (string, обязательный) - Код порта назначения
- `departureDateFrom` (string, обязательный) - Дата отправления от (YYYY-MM-DD)
- `departureDateTo` (string, обязательный) - Дата отправления до (YYYY-MM-DD)

#### Пример запроса
```bash
GET /api/schedules?originPortId=CNSHA&destinationPortId=USLAX&departureDateFrom=2024-01-01&departureDateTo=2024-01-31
```

#### Пример ответа
```json
{
  "success": true,
  "sailings": [
    {
      "id": "sailing-001",
      "originPort": {
        "id": "CNSHA",
        "name": "Shanghai"
      },
      "destinationPort": {
        "id": "USLAX",
        "name": "Los Angeles"
      },
      "departureDate": "2024-01-15T10:00:00Z",
      "arrivalDate": "2024-01-30T14:00:00Z",
      "vessel": {
        "imo": "1234567",
        "name": "MAERSK SEVILLE"
      },
      "voyage": "123E"
    }
  ],
  "total": 1
}
```

### 4. Поиск дедлайнов

**GET** `/api/deadlines`

Получение дедлайнов отправки для конкретного рейса.

#### Параметры запроса
- `vesselImo` (string, обязательный) - IMO номер судна
- `voyage` (string, обязательный) - Номер рейса (1-4 символа)
- `portOfLoad` (string, обязательный) - Порт погрузки
- `isoCountryCode` (string, обязательный) - Код страны (2 буквы)

#### Пример запроса
```bash
GET /api/deadlines?vesselImo=1234567&voyage=123&portOfLoad=CNSHA&isoCountryCode=CN
```

#### Пример ответа
```json
{
  "success": true,
  "deadlines": [
    {
      "id": "deadline-001",
      "type": "DOCUMENTATION",
      "name": "Documentation Deadline",
      "description": "Подготовка и подача документов",
      "deadlineDate": "2024-01-10T17:00:00Z",
      "timezone": "Asia/Shanghai",
      "port": {
        "id": "CNSHA",
        "name": "Shanghai Terminal"
      },
      "isMandatory": true,
      "status": "ACTIVE"
    }
  ],
  "source": "maersk"
}
```

### 5. Загрузка данных

**POST** `/api/load-data`

Загрузка данных из Maersk API в локальную базу данных.

#### Параметры запроса
- `type` (string, обязательный) - Тип данных для загрузки:
  - `vessels` - Данные о судах
  - `locations` - Данные о локациях
  - `deadlines` - Данные о дедлайнах
  - `ocean-products` - Данные о расписаниях

#### Пример запроса
```bash
POST /api/load-data?type=vessels
```

#### Пример ответа
```json
{
  "success": true,
  "message": "Данные vessels загружены успешно",
  "count": 150,
  "source": "maersk"
}
```

### 6. Мониторинг производительности

**GET** `/api/performance`

Получение метрик производительности системы.

#### Параметры запроса
- `action` (string, обязательный) - Действие:
  - `overview` - Общий обзор
  - `recent` - Последние метрики
  - `cache` - Статистика кэша
- `limit` (number, опциональный) - Лимит результатов

#### Пример запроса
```bash
GET /api/performance?action=overview
```

#### Пример ответа
```json
{
  "success": true,
  "data": {
    "totalRequests": 1250,
    "successfulRequests": 1180,
    "failedRequests": 70,
    "averageResponseTime": 245,
    "cacheHitRate": 78.5,
    "uptime": 99.8
  }
}
```

### 7. Мониторинг здоровья Maersk API

**GET** `/api/maersk-health`

Получение статуса здоровья Maersk API.

#### Параметры запроса
- `action` (string, опциональный) - Действие:
  - `status` - Текущий статус (по умолчанию)
  - `metrics` - Метрики за 24 часа
  - `history` - История проверок
  - `check` - Принудительная проверка
- `limit` (number, опциональный) - Лимит для истории

#### Пример запроса
```bash
GET /api/maersk-health?action=metrics
```

#### Пример ответа
```json
{
  "success": true,
  "data": {
    "uptime": 99.5,
    "averageResponseTime": 320,
    "totalChecks": 288,
    "successfulChecks": 286,
    "failedChecks": 2,
    "lastError": "Connection timeout",
    "lastErrorTime": "2024-01-15T10:30:00Z"
  }
}
```

### 8. Диагностика системы

**GET** `/api/diagnostics`

Получение диагностической информации о системе.

#### Параметры запроса
- `action` (string, обязательный) - Действие:
  - `health` - Общее здоровье системы
  - `api-status` - Статус всех API endpoints
  - `cache-status` - Статус кэша
  - `database-status` - Статус базы данных

#### Пример запроса
```bash
GET /api/diagnostics?action=health
```

#### Пример ответа
```json
{
  "success": true,
  "status": "healthy",
  "checks": {
    "database": "healthy",
    "maersk-api": "healthy",
    "cache": "healthy",
    "memory": "healthy"
  },
  "timestamp": "2024-01-15T12:00:00Z"
}
```

## Обработка ошибок

### Формат ошибки
```json
{
  "success": false,
  "error": "Описание ошибки",
  "code": "ERROR_CODE",
  "details": {
    "field": "Дополнительная информация"
  }
}
```

### Типичные ошибки

#### 400 Bad Request
```json
{
  "success": false,
  "error": "Неверные параметры запроса",
  "details": {
    "voyage": "voyage must be 1-4 alphanumeric characters"
  }
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "error": "Неверный API ключ или отсутствует доступ"
}
```

#### 429 Too Many Requests
```json
{
  "success": false,
  "error": "Превышен лимит запросов к Maersk API",
  "retryAfter": 60
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Внутренняя ошибка сервера",
  "source": "mock (fallback)"
}
```

## Fallback механизмы

### Mock данные
При недоступности Maersk API система автоматически переключается на mock данные:

```json
{
  "success": true,
  "data": [...],
  "source": "mock (fallback)",
  "error": "Maersk API недоступен"
}
```

### Кэширование
Система использует многоуровневое кэширование:
- **Статические данные**: 24 часа (порты, суда)
- **API ответы**: 15 минут (расписания, дедлайны)
- **Пользовательские данные**: 5 минут

## Лимиты и ограничения

### Rate Limiting
- Maersk API: 100 запросов в минуту
- Локальные endpoints: 1000 запросов в минуту

### Размеры данных
- Максимальный размер ответа: 10MB
- Максимальное количество результатов: 1000

### Таймауты
- Maersk API запросы: 15 секунд
- Локальные запросы: 30 секунд

## Мониторинг и логирование

### Логирование
Все API запросы логируются с контекстом:
- Request ID
- Пользователь (если авторизован)
- Endpoint и метод
- Время выполнения
- Статус ответа

### Метрики
Система собирает метрики:
- Количество запросов
- Время ответа
- Hit rate кэша
- Ошибки и их типы

## Примеры использования

### JavaScript/Node.js
```javascript
// Поиск портов
const response = await fetch('/api/ports/search?q=sha');
const data = await response.json();

// Получение информации о судне
const vesselResponse = await fetch('/api/vessels/1234567');
const vesselData = await vesselResponse.json();

// Поиск расписаний
const schedulesResponse = await fetch('/api/schedules?' + new URLSearchParams({
  originPortId: 'CNSHA',
  destinationPortId: 'USLAX',
  departureDateFrom: '2024-01-01',
  departureDateTo: '2024-01-31'
}));
const schedulesData = await schedulesResponse.json();
```

### cURL
```bash
# Поиск портов
curl "http://localhost:3000/api/ports/search?q=sha"

# Информация о судне
curl "http://localhost:3000/api/vessels/1234567"

# Поиск расписаний
curl "http://localhost:3000/api/schedules?originPortId=CNSHA&destinationPortId=USLAX&departureDateFrom=2024-01-01&departureDateTo=2024-01-31"
```

## Поддержка

При возникновении проблем:
1. Проверьте логи системы
2. Используйте `/api/diagnostics` для диагностики
3. Проверьте статус Maersk API через `/api/maersk-health`
4. Обратитесь к команде разработки с логами ошибок
