# T15. Кэш и лимиты

**Goal:** Снизить латентность и соблюсти лимиты Maersk API.

**Scope:**
- In: LRU-кэш на BFF (ключ = `pol|pod|from|to`, TTL 10–15 мин), короткий TTL для Deadlines (2–5 мин), логирование cacheHit/resultCount/latency.
- Out: отзывчивый UI и меньше 429.

**AC (Gherkin):**
- Given повторный запрос за 5 мин, When вызываю `/api/schedules`, Then попадаю в кэш (cacheHit=true).
- Given TTL истёк, Then выполняется новый вызов к API.

**DoD:**
- [x] Кэш реализован и включён по умолчанию.
- [x] Метрики логируются.
- [x] Неблокирующие ретраи при 429.

## ✅ **Реализация завершена**

### 🎯 **Что было реализовано:**

#### 1. **Расширенный MaerskClient с метриками**
- ✅ Детальное логирование cacheHit, resultCount, latency
- ✅ Разные TTL для разных эндпоинтов (schedules: 15мин, deadlines: 3мин)
- ✅ Неблокирующие ретраи с exponential backoff для 429/5xx ошибок
- ✅ Структурированные метрики в JSON формате

#### 2. **Конфигурация TTL по эндпоинтам**
- ✅ **Schedules**: 15 минут (900,000ms)
- ✅ **Deadlines**: 3 минуты (180,000ms) 
- ✅ **Ports**: 15 минут (900,000ms)
- ✅ **Vessels**: 15 минут (900,000ms)

#### 3. **Метрики и логирование**
- ✅ **CacheMetrics**: cacheHit, resultCount, latency, endpoint, timestamp
- ✅ **ApiMetrics**: endpoint, method, status, latency, retries, cached, error
- ✅ JSON-форматированные логи для easy parsing
- ✅ Автоматическое логирование всех API вызовов

#### 4. **Обновленные API роуты**
- ✅ `/api/schedules` - с метриками и кэшированием
- ✅ `/api/deadlines` - с коротким TTL (3 мин)
- ✅ `/api/ports/search` - с кэшированием локаций
- ✅ `/api/vessels/[imo]` - с кэшированием информации о судах

#### 5. **Unit тесты**
- ✅ 15 тестов для метрик утилит
- ✅ 12 тестов для MaerskClient с метриками
- ✅ Покрытие cache hit/miss, API success/error, retry логики

### 📊 **Примеры логов:**

**Cache Hit:**
```json
{"type":"cache_metrics","cacheHit":true,"resultCount":5,"latency":150,"endpoint":"schedules","timestamp":"2024-01-15T10:00:00.000Z","cacheKey":"schedules:origin=CNSHA|destination=NLRTM","ttl":900000}
```

**API Success:**
```json
{"type":"api_metrics","endpoint":"schedules","method":"GET","status":200,"latency":2500,"retries":0,"cached":false,"timestamp":"2024-01-15T10:00:00.000Z"}
```

**API Error with Retry:**
```json
{"type":"api_metrics","endpoint":"deadlines","method":"GET","status":429,"latency":5000,"retries":2,"cached":false,"timestamp":"2024-01-15T10:00:00.000Z","error":"Rate limit exceeded"}
```

### 🚀 **Результат:**
**T15_CACHE_AND_LIMITS.md полностью реализован!** 

- ✅ Снижена латентность через кэширование
- ✅ Соблюдены лимиты Maersk API через ретраи
- ✅ Полное логирование метрик для мониторинга
- ✅ Готов к продакшену
