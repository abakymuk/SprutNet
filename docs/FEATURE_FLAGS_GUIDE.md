# Feature Flags & Fallback Guide

## 🎯 Обзор

Система feature flags и fallback механизмов обеспечивает устойчивость приложения при инцидентах с Maersk API и позволяет мгновенно переключаться между реальными и демо-данными.

## 🚩 Feature Flags

### Основные флаги

#### `FEATURE_MAERSK`
- **Описание**: Включает/отключает интеграцию с Maersk API
- **Значения**: `true` | `false`
- **По умолчанию**: `true`

```env
# Включить Maersk API
FEATURE_MAERSK=true

# Отключить Maersk API (использовать только мок-данные)
FEATURE_MAERSK=false
```

#### `FEATURE_DEADLINES`
- **Описание**: Включает/отключает API дедлайнов
- **Значения**: `true` | `false`
- **По умолчанию**: `true`

```env
FEATURE_DEADLINES=true
```

### Дополнительные флаги

#### `CACHE_TTL_MINUTES`
- **Описание**: Время жизни кэша в минутах
- **Значения**: `number`
- **По умолчанию**: `10`

```env
CACHE_TTL_MINUTES=10
```

## 🔄 Fallback Механизмы

### Автоматический Fallback

Приложение автоматически переключается на мок-данные в следующих случаях:

1. **API недоступен** (5xx ошибки)
2. **Превышен лимит запросов** (429 ошибки)
3. **Некорректный ответ API**
4. **Таймаут запроса** (>15 секунд)

### Ручное переключение

Пользователи могут вручную переключиться на демо-данные:

1. **Fallback кнопка** в UI
2. **Индикатор источника данных**
3. **Сообщения об ошибках**

## 🎨 UI Компоненты

### FallbackButton

Компонент для переключения на демо-данные:

```tsx
<FallbackButton
  dataSource="maersk"
  onSwitchToMock={() => setDataSource('mock')}
  error="API недоступен"
  title="Показать демо-данные"
  showDetails={true}
/>
```

**Свойства:**
- `dataSource`: Источник данных (`'maersk'` | `'mock'` | `'mock (fallback)'`)
- `onSwitchToMock`: Функция переключения
- `error`: Сообщение об ошибке
- `title`: Текст кнопки
- `showDetails`: Показывать детальную информацию

### Индикаторы источника данных

- 🟢 **Maersk API** - Реальные данные
- 🔵 **Демо-данные** - Тестовые данные
- 🟠 **Fallback** - Демо-данные (API недоступен)

## 🔧 Настройка окружений

### Локальная разработка

```env
# .env.local
FEATURE_MAERSK=true
FEATURE_DEADLINES=true
CACHE_TTL_MINUTES=10
```

### Staging

```env
# Staging environment
FEATURE_MAERSK=true
FEATURE_DEADLINES=true
CACHE_TTL_MINUTES=5
```

### Production

```env
# Production environment
FEATURE_MAERSK=true
FEATURE_DEADLINES=true
CACHE_TTL_MINUTES=15
```

### Демо режим

```env
# Demo environment (только мок-данные)
FEATURE_MAERSK=false
FEATURE_DEADLINES=false
CACHE_TTL_MINUTES=0
```

## 🚀 Быстрое переключение

### Через переменные окружения

```bash
# Включить только мок-данные
export FEATURE_MAERSK=false

# Включить Maersk API
export FEATURE_MAERSK=true
```

### Через UI

1. Откройте приложение
2. Найдите индикатор источника данных
3. Нажмите "Показать демо-данные"
4. Приложение переключится на мок-данные

### Через API

```bash
# Проверить статус feature flags
curl http://localhost:3000/api/maersk-status

# Ответ:
{
  "success": true,
  "featureFlags": {
    "MAERSK_API": true,
    "DEADLINES": true,
    "CACHE_ENABLED": true
  }
}
```

## 📊 Мониторинг

### Статус API

Откройте `/maersk-status` для проверки:

- ✅ **Переменные окружения**
- ✅ **Feature flags**
- ✅ **Доступность продуктов**
- ✅ **Рекомендации**

### Логи

```bash
# Просмотр логов
tail -f logs/app.log | grep "FEATURE_MAERSK"

# Примеры логов:
# [INFO] FEATURE_MAERSK=true - Используем Maersk API
# [WARN] FEATURE_MAERSK=false - Переключение на мок-данные
# [ERROR] API недоступен - Fallback на мок-данные
```

## 🧪 Тестирование

### Unit тесты

```bash
# Запуск тестов с разными флагами
FEATURE_MAERSK=true pnpm test
FEATURE_MAERSK=false pnpm test
```

### E2E тесты

```bash
# Тестирование fallback механизмов
pnpm test:e2e --grep "fallback"
```

### Ручное тестирование

1. **Включите Maersk API**: `FEATURE_MAERSK=true`
2. **Выполните поиск** расписаний
3. **Отключите API**: `FEATURE_MAERSK=false`
4. **Проверьте fallback** на мок-данные

## 🔒 Безопасность

### Переменные окружения

- ✅ **Никогда не коммитьте** `.env.local`
- ✅ **Используйте секреты** в CI/CD
- ✅ **Ротация API ключей** каждые 90 дней

### Доступ к API

- ✅ **Rate limiting** на стороне Maersk
- ✅ **Кэширование** для снижения нагрузки
- ✅ **Retry механизм** с экспоненциальной задержкой

## 📈 Метрики

### Мониторинг fallback

```typescript
// Метрики для отслеживания
interface FallbackMetrics {
  totalRequests: number;
  fallbackCount: number;
  fallbackRate: number;
  averageResponseTime: number;
  errorRate: number;
}
```

### Алерты

- 🔴 **Fallback rate > 10%** - Критическая ошибка
- 🟡 **Fallback rate > 5%** - Предупреждение
- 🟢 **Fallback rate < 1%** - Нормальная работа

## 🎯 Лучшие практики

### Разработка

1. **Всегда тестируйте** с `FEATURE_MAERSK=false`
2. **Проверяйте fallback** при ошибках API
3. **Документируйте** изменения в feature flags

### Продакшен

1. **Мониторьте** fallback rate
2. **Настройте алерты** при критических ошибках
3. **Планируйте** ротацию API ключей

### Демо

1. **Используйте** `FEATURE_MAERSK=false` для демо
2. **Подготовьте** качественные мок-данные
3. **Тестируйте** все сценарии с моками

## 🆘 Устранение неполадок

### Частые проблемы

#### API недоступен
```bash
# Проверьте статус
curl https://api.maersk.com/health

# Проверьте ключи
echo $MAERSK_API_KEY
echo $MAERSK_API_SECRET
```

#### Fallback не работает
```bash
# Проверьте флаги
echo $FEATURE_MAERSK

# Перезапустите приложение
pnpm dev
```

#### Мок-данные не загружаются
```bash
# Проверьте импорты
grep -r "generateMock" src/

# Проверьте консоль браузера
# F12 → Console
```

### Контакты

- 📧 **Поддержка**: support@sprutnet.com
- 📚 **Документация**: docs.sprutnet.com
- 🐛 **Issues**: github.com/sprutnet/issues
