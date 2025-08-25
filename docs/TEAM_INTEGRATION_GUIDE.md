# Руководство по интеграции для команды

## 🎯 Обзор изменений

Этот документ описывает все изменения, внесенные в проект SprutNet для интеграции с новой базой данных Supabase и улучшения мониторинга производительности.

## 📋 Что было добавлено

### 1. **Новая база данных Supabase**
- ✅ Унифицированная схема с 25 таблицами
- ✅ Интеграция с Maersk API
- ✅ Система мониторинга производительности
- ✅ Кэширование и аналитика
- ✅ Feature flags и конфигурация

### 2. **Система тестирования API**
- ✅ Комплексный тест-сьют для всех endpoints
- ✅ Автоматическое тестирование производительности
- ✅ Дашборд для мониторинга тестов
- ✅ Экспорт результатов тестов

### 3. **Мониторинг производительности**
- ✅ Автоматический мониторинг всех API запросов
- ✅ Интеграция с базой данных
- ✅ Дашборды производительности
- ✅ Алерты и уведомления

## 🗄️ Структура базы данных

### **Основные таблицы**

| Группа | Таблицы | Назначение |
|--------|---------|------------|
| **Maersk API** | 16 таблиц | Данные от Maersk API (порты, суда, расписания) |
| **Пользователи** | 5 таблиц | Пользователи, кэш, избранное, поиски |
| **Системные** | 4 таблицы | Метрики, аналитика, конфигурация |
| **Тестирование** | 2 таблицы | Результаты тестов API |

### **Ключевые представления**
- `cache_stats` - Статистика кэша
- `api_stats` - Статистика API
- `popular_routes` - Популярные маршруты
- `test_stats` - Статистика тестов
- `recent_test_results` - Последние результаты тестов

## 🧪 Система тестирования

### **Новые файлы**
```
apps/web/src/lib/testing/api-test-suite.ts     # Основной тест-сьют
apps/web/src/app/api/testing/route.ts          # API для запуска тестов
apps/web/src/app/testing-dashboard/page.tsx    # Дашборд тестирования
```

### **Запуск тестов**

#### **Через API**
```bash
# Запуск всех тестов
curl "http://localhost:3000/api/testing?action=run"

# Экспорт результатов
curl "http://localhost:3000/api/testing?action=run&export=true"

# Статус тестов
curl "http://localhost:3000/api/testing?action=status"
```

#### **Через дашборд**
1. Откройте `http://localhost:3000/testing-dashboard`
2. Нажмите "Run Tests"
3. Просмотрите результаты в реальном времени

### **Тест-сьюты**
1. **Core API Endpoints** - Основные API (порты, расписания, дедлайны)
2. **Data Management** - Управление данными
3. **Monitoring & Diagnostics** - Мониторинг и диагностика
4. **Error Handling** - Обработка ошибок

## 📊 Мониторинг производительности

### **Новые файлы**
```
apps/web/src/lib/monitoring/performance-db.ts  # Интеграция с БД
apps/web/src/middleware.ts                     # Автоматический мониторинг
apps/web/src/app/performance-dashboard/page.tsx # Дашборд производительности
```

### **Автоматический мониторинг**
- Все API запросы автоматически отслеживаются
- Метрики сохраняются в базу данных
- Время ответа, статус коды, ошибки

### **Дашборды**
- `/performance-dashboard` - Детальный мониторинг
- `/testing-dashboard` - Тестирование и мониторинг
- `/diagnostics` - Диагностика системы

## 🔧 Интеграция с существующим кодом

### **Обновленные файлы**

#### **API Endpoints**
- `apps/web/src/app/api/ports/search/route.ts` - Обновлен для работы с новой БД
- `apps/web/src/app/api/schedules/route.ts` - Добавлен мониторинг
- `apps/web/src/app/api/deadlines/route.ts` - Улучшена обработка ошибок
- `apps/web/src/app/api/vessels/[imo]/route.ts` - Интеграция с БД

#### **Компоненты**
- `apps/web/src/components/planner/SearchForm.tsx` - Обновлен для новой БД
- `apps/web/src/components/planner/SailingResults.tsx` - Улучшен UI
- `apps/web/src/components/ui/` - Новые UI компоненты

### **Переменные окружения**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Maersk API
MAERSK_CONSUMER_KEY=your_maersk_key
MAERSK_CLIENT_SECRET=your_maersk_secret

# Feature Flags
FEATURE_MAERSK=true
CACHE_ENABLED=true
USE_MOCKS=false

# Мониторинг
ENABLE_TELEMETRY=true
PERFORMANCE_MONITORING=true
```

## 🚀 Запуск и тестирование

### **1. Подготовка**
```bash
# Установка зависимостей
pnpm install

# Применение миграций базы данных
# Выполните в Supabase SQL Editor:
# supabase/migrations/20250101000002_unified_schema.sql
# supabase/migrations/20250101000003_add_test_results_table.sql
```

### **2. Запуск приложения**
```bash
# Разработка
pnpm dev

# Продакшен
pnpm build
pnpm start
```

### **3. Тестирование**
```bash
# Запуск тестов
pnpm test

# Тестирование API
curl "http://localhost:3000/api/testing?action=run"

# Проверка здоровья системы
curl "http://localhost:3000/api/diagnostics?action=health"
```

## 📈 Мониторинг в продакшене

### **Ключевые метрики**
- **Время ответа API** - должно быть < 1000ms
- **Success Rate** - должно быть > 95%
- **Cache Hit Rate** - должно быть > 80%
- **Error Rate** - должно быть < 5%

### **Алерты**
- Высокий уровень ошибок (> 10%)
- Медленные ответы (> 2000ms)
- Низкий cache hit rate (< 50%)
- Проблемы с Maersk API

### **Дашборды**
- **Операционный** - `/performance-dashboard`
- **Тестирование** - `/testing-dashboard`
- **Диагностика** - `/diagnostics`

## 🛠️ Устранение неполадок

### **Частые проблемы**

#### **1. Ошибки подключения к Supabase**
```bash
# Проверьте переменные окружения
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Проверьте статус базы данных
curl "http://localhost:3000/api/diagnostics?action=health"
```

#### **2. Проблемы с Maersk API**
```bash
# Проверьте статус Maersk API
curl "http://localhost:3000/api/maersk-status"

# Проверьте feature flags
curl "http://localhost:3000/api/diagnostics?action=api-status"
```

#### **3. Медленные запросы**
```bash
# Проверьте метрики производительности
curl "http://localhost:3000/api/performance?action=overview"

# Проверьте кэш
curl "http://localhost:3000/api/performance?action=cache"
```

### **Логи и отладка**
```bash
# Просмотр логов
tail -f logs/app.log

# Телеметрия
curl "http://localhost:3000/api/telemetry?action=stats"

# Диагностика
curl "http://localhost:3000/api/diagnostics?action=logs"
```

## 📚 Дополнительная документация

### **Руководства**
- `docs/DATABASE_MIGRATION_GUIDE.md` - Миграция базы данных
- `docs/POST_MIGRATION_GUIDE.md` - Действия после миграции
- `docs/MAERSK_API_SETUP_GUIDE.md` - Настройка Maersk API
- `docs/FEATURE_FLAGS_GUIDE.md` - Управление feature flags

### **Схемы базы данных**
- `docs/UNIFIED_DATABASE_SCHEMA.md` - Полная схема БД
- `prisma/schema.prisma` - Prisma схема
- `supabase/migrations/` - Миграции

### **API документация**
- `docs/API_ENDPOINTS.md` - Список всех endpoints
- `docs/ERROR_HANDLING.md` - Обработка ошибок
- `docs/PERFORMANCE_MONITORING.md` - Мониторинг

## 🎯 Следующие шаги

### **Краткосрочные (1-2 недели)**
1. ✅ Применить миграции базы данных
2. ✅ Протестировать все API endpoints
3. ✅ Настроить мониторинг производительности
4. ✅ Интегрировать с существующим кодом

### **Среднесрочные (1 месяц)**
1. 🔄 Настроить автоматические алерты
2. 🔄 Оптимизировать производительность
3. 🔄 Добавить больше тестов
4. 🔄 Улучшить дашборды

### **Долгосрочные (3 месяца)**
1. 🔄 Масштабирование базы данных
2. 🔄 Расширенная аналитика
3. 🔄 Интеграция с внешними системами
4. 🔄 Автоматизация развертывания

## 📞 Поддержка

### **Команда разработки**
- **Lead Developer** - Архитектура и интеграция
- **Backend Developer** - API и база данных
- **Frontend Developer** - UI/UX и дашборды
- **DevOps Engineer** - Развертывание и мониторинг

### **Контакты**
- **Slack**: #sprutnet-dev
- **Email**: dev-team@sprutnet.com
- **Jira**: SPRUTNET project

---

**Статус**: ✅ Готово к интеграции  
**Дата**: 2025-01-01  
**Версия**: 1.0
