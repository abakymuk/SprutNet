# Настройка работы только с реальными данными

## Обзор

Проект настроен для работы с реальными данными от Maersk API. Система поддерживает два режима:
- **Смешанный режим**: Использует реальные данные, но при ошибках возвращает fallback данные
- **Режим только реальных данных**: Использует исключительно реальные данные, возвращает ошибки при недоступности API

## Переменные окружения

### Обязательные переменные

```env
# Maersk API Configuration
MAERSK_API_KEY=IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd
MAERSK_API_SECRET=CnIcg3YgUUtSp8a3
MAERSK_API_BASE_URL=https://api.maersk.com

# Feature Flags
FEATURE_MAERSK=true                    # Включить Maersk API
FEATURE_REAL_DATA_ONLY=true            # Режим только реальных данных
FEATURE_DEADLINES=true                 # Включить API дедлайнов

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://kzbtwgpedbojxnfiprsw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Дополнительные настройки

```env
# Cache Configuration
CACHE_TTL_MINUTES=30                   # TTL кэша в минутах
ROUTE_CACHE_TTL_HOURS=2                # TTL кэша маршрутов в часах

# Logging Configuration
LOG_LEVEL=info                         # Уровень логирования
ENABLE_API_LOGGING=true                # Включить логирование API
ENABLE_CACHE_LOGGING=true              # Включить логирование кэша
```

## Режимы работы

### 1. Смешанный режим (по умолчанию)

```env
FEATURE_MAERSK=true
FEATURE_REAL_DATA_ONLY=false
```

**Поведение:**
- ✅ Использует реальные данные от Maersk API
- ✅ При ошибках API возвращает fallback данные
- ✅ Подходит для разработки и тестирования

### 2. Режим только реальных данных

```env
FEATURE_MAERSK=true
FEATURE_REAL_DATA_ONLY=true
```

**Поведение:**
- ✅ Использует исключительно реальные данные
- ❌ При ошибках API возвращает HTTP 503 ошибку
- ✅ Подходит для продакшена

## API Endpoints

### Расписания (`/api/schedules`)

```bash
# Поиск расписаний
curl "http://localhost:3000/api/schedules?originPortId=CNSHA&destinationPortId=USLAX&departureDateFrom=2024-12-01&departureDateTo=2024-12-31&resultCount=5"
```

**Ответы:**
- `source: "maersk"` - реальные данные
- `source: "error"` - ошибка API (в режиме реальных данных)
- `source: "fallback"` - fallback данные (только в смешанном режиме)

### Порты (`/api/ports/search`)

```bash
# Поиск портов
curl "http://localhost:3000/api/ports/search?q=Shanghai&limit=5"
```

**Ответы:**
- `success: true` - реальные данные
- `success: false, error: "..."` - ошибка API

### Судна (`/api/vessels/[imo]`)

```bash
# Информация о судне
curl "http://localhost:3000/api/vessels/1234567"
```

**Ответы:**
- `source: "maersk"` - реальные данные
- `source: "error"` - ошибка API (в режиме реальных данных)

## Тестирование

### Автоматическое тестирование

```bash
# Запуск тестов реальных данных
./scripts/test-real-data.sh
```

### Ручное тестирование

```bash
# 1. Проверка здоровья API
curl "http://localhost:3000/api/maersk-health"

# 2. Тест расписаний
curl "http://localhost:3000/api/schedules?originPortId=CNSHA&destinationPortId=USLAX&departureDateFrom=2024-12-01&departureDateTo=2024-12-31&resultCount=5"

# 3. Тест портов
curl "http://localhost:3000/api/ports/search?q=Shanghai&limit=5"

# 4. Тест судов
curl "http://localhost:3000/api/vessels/1234567"
```

## Мониторинг

### Проверка состояния API

```bash
# Статус Maersk API
curl "http://localhost:3000/api/maersk-health"

# Статистика кэша
curl "http://localhost:3000/api/route-cache?action=stats"

# Популярные маршруты
curl "http://localhost:3000/api/route-cache?action=popular"
```

### Логирование

```bash
# Просмотр логов API
tail -f logs/api.log

# Просмотр логов кэша
tail -f logs/cache.log
```

## Устранение неполадок

### Ошибка 503 - API недоступен

**Причина:** Maersk API недоступен или возвращает ошибку

**Решение:**
1. Проверьте переменные окружения
2. Проверьте статус Maersk API
3. В смешанном режиме система автоматически использует fallback

### Ошибка аутентификации

**Причина:** Неверные API ключи Maersk

**Решение:**
```bash
# Проверьте переменные окружения
echo $MAERSK_API_KEY
echo $MAERSK_API_SECRET

# Обновите ключи в .env.local
```

### Пустые данные

**Причина:** API возвращает пустой результат

**Решение:**
1. Проверьте параметры запроса
2. Убедитесь, что данные существуют в Maersk API
3. Проверьте логи для деталей

## Переключение режимов

### Включение режима реальных данных

```bash
# Добавьте в .env.local
echo "FEATURE_REAL_DATA_ONLY=true" >> .env.local

# Перезапустите сервер
npm run dev
```

### Отключение режима реальных данных

```bash
# Удалите или закомментируйте в .env.local
# FEATURE_REAL_DATA_ONLY=true

# Перезапустите сервер
npm run dev
```

## Производительность

### Кэширование

- **API кэш**: 30 минут TTL
- **Кэш маршрутов**: 2 часа TTL
- **Supabase кэш**: Автоматическая очистка

### Оптимизация

```env
# Увеличьте TTL для лучшей производительности
CACHE_TTL_MINUTES=60
ROUTE_CACHE_TTL_HOURS=4

# Включите агрессивное кэширование
ENABLE_AGGRESSIVE_CACHING=true
```

## Безопасность

### API ключи

- ✅ Храните ключи в `.env.local` (не в git)
- ✅ Используйте переменные окружения в продакшене
- ✅ Регулярно обновляйте ключи

### Ограничения

- ⚠️ Соблюдайте лимиты Maersk API
- ⚠️ Не превышайте rate limits
- ⚠️ Логируйте ошибки для мониторинга

## Поддержка

При возникновении проблем:

1. Проверьте логи: `tail -f logs/api.log`
2. Запустите тесты: `./scripts/test-real-data.sh`
3. Проверьте статус API: `curl /api/maersk-health`
4. Создайте issue в репозитории проекта
