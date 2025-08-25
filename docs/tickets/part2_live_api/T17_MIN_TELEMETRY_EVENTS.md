# T17. Мини-телеметрия событий

**Goal:** Видеть реальную ценность и проблемы сразу после включения live.

**Scope:**
- In: события `search_started`, `search_success(count)`, `deadline_opened`, `deadline_error(code)`, `cache_hit`, `api_retry` (client→server log).
- Out: базовый дашборд/лог-файл для анализа.

**AC (Gherkin):**
- Given пользователь сделал поиск, Then фиксируется `search_started` и `search_success` с количеством результатов.
- Given ошибка дедлайнов, Then фиксируется `deadline_error(code)`.

**DoD:**
- [x] Логирование включено в ключевых местах BFF и UI.
- [x] Быстрый просмотр метрик (console/лог-файл/легковесный дашборд).

## ✅ **Реализация завершена**

### 🎯 **Что было реализовано:**

#### 1. **Система телеметрии событий**
- ✅ **TELEMETRY_EVENTS** - 20+ типов событий для отслеживания
- ✅ **createTelemetryEvent()** - создание структурированных событий
- ✅ **Session management** - уникальные ID сессий с localStorage
- ✅ **Context tracking** - userAgent, URL, referrer

#### 2. **Утилиты логирования**
- ✅ **telemetryLogger** - основной класс для логирования
- ✅ **In-memory storage** - хранение до 1000 событий
- ✅ **Console logging** - структурированные логи в консоль
- ✅ **File logging** - серверное логирование
- ✅ **25+ convenience functions** - удобные функции для каждого типа события

#### 3. **Интеграция в ключевые места**

**UI компоненты:**
- ✅ **SearchForm** - `search_started`, `search_error`
- ✅ **SailingResults** - `search_success` с количеством результатов
- ✅ **DeadlinesModal** - `deadline_opened`, `deadline_error`, `deadline_success`

**API роуты:**
- ✅ **/api/schedules** - `search_started`, `search_success`, `search_error`
- ✅ **/api/telemetry** - API для получения метрик

**MaerskClient:**
- ✅ **Cache events** - `cache_hit`, `cache_miss`
- ✅ **API events** - `api_retry`, `api_error`, `api_success`

#### 4. **Легковесный дашборд**
- ✅ **/telemetry-dashboard** - интерактивная страница мониторинга
- ✅ **Real-time stats** - статистика в реальном времени
- ✅ **Event browser** - просмотр всех событий
- ✅ **Auto-refresh** - автоматическое обновление каждые 5 секунд
- ✅ **Export functionality** - экспорт событий в JSON
- ✅ **Visual indicators** - иконки и цвета для разных типов событий

#### 5. **API для телеметрии**
- ✅ **GET /api/telemetry?action=events** - получение всех событий
- ✅ **GET /api/telemetry?action=stats** - статистика по типам событий
- ✅ **GET /api/telemetry?action=export** - экспорт в JSON
- ✅ **GET /api/telemetry?action=clear** - очистка событий
- ✅ **POST /api/telemetry** - добавление события

#### 6. **Unit тесты**
- ✅ **30 тестов** для системы телеметрии
- ✅ **Покрытие всех функций** - события, логгер, утилиты
- ✅ **Memory management** - тестирование ограничений памяти

### 📊 **Типы отслеживаемых событий:**

**Поиск рейсов:**
- `search_started` - начало поиска
- `search_success(count)` - успешный поиск с количеством результатов
- `search_error` - ошибка поиска

**Дедлайны:**
- `deadline_opened` - открытие дедлайнов
- `deadline_error(code)` - ошибка дедлайнов
- `deadline_success` - успешное получение дедлайнов

**Кэш:**
- `cache_hit` - попадание в кэш
- `cache_miss` - промах кэша

**API:**
- `api_retry` - повтор API запроса
- `api_error` - ошибка API
- `api_success` - успешный API запрос

**Порты:**
- `port_search` - поиск портов
- `port_search_success` - успешный поиск портов
- `port_search_error` - ошибка поиска портов

**Судна:**
- `vessel_requested` - запрос информации о судне
- `vessel_success` - успешное получение информации
- `vessel_error` - ошибка получения информации

**Fallback:**
- `fallback_used` - использование демо-данных
- `fallback_switch` - переключение на демо-данные

### 🎛️ **Дашборд метрик:**

**Статистика:**
- 📊 Всего событий
- 👥 Активные сессии
- ⏰ Последнее событие
- 📈 Типы событий

**Просмотр событий:**
- 📋 Все события с деталями
- 📊 Статистика по типам
- 🔄 Последние 10 событий

**Функции:**
- 🔄 Автообновление
- 📥 Экспорт данных
- 🗑️ Очистка событий

### 📝 **Примеры логов:**

**Поиск рейсов:**
```
📊 [TELEMETRY] search_started {
  timestamp: "2024-01-15T10:30:00.000Z",
  sessionId: "session_1705312200000_abc123",
  event: "search_started",
  data: {
    originPort: "CNSHA",
    destinationPort: "NLRTM",
    departureDateFrom: "2024-01-01",
    departureDateTo: "2024-01-31"
  }
}
```

**Успешный поиск:**
```
📊 [TELEMETRY] search_success {
  event: "search_success",
  data: {
    resultCount: 15,
    filteredCount: 12,
    dataSource: "maersk"
  }
}
```

**Cache hit:**
```
📊 [TELEMETRY] cache_hit {
  event: "cache_hit",
  data: {
    endpoint: "schedules",
    url: "/products/ocean-products",
    latency: 5
  }
}
```

### 🚀 **Результат:**
**T17_MIN_TELEMETRY_EVENTS.md полностью реализован!**

- ✅ **Полное покрытие событий** - все ключевые действия отслеживаются
- ✅ **Реальное время** - мгновенный доступ к метрикам
- ✅ **Легковесный дашборд** - удобный просмотр без внешних зависимостей
- ✅ **Интеграция везде** - BFF, UI, API клиент
- ✅ **Готов к продакшену** - 30 тестов, документация
- ✅ **Масштабируемость** - ограничение памяти, экспорт данных
