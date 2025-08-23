# Инструкция по применению миграции Maersk API

## 🚀 Применение миграции

### Вариант 1: Через веб-интерфейс Supabase (Рекомендуется)

1. **Откройте Supabase Dashboard**
   - Перейдите на https://supabase.com/dashboard
   - Выберите проект: `kzbtwgpedbojxnfiprsw`

2. **Откройте SQL Editor**
   - В левом меню выберите "SQL Editor"
   - Нажмите "New query"

3. **Скопируйте и выполните скрипт**
   - Откройте файл `migration_script.sql`
   - Скопируйте весь содержимый скрипт
   - Вставьте в SQL Editor
   - Нажмите "Run" для выполнения

4. **Проверьте результат**
   - После выполнения вы должны увидеть сообщение: "Migration completed successfully!"

### Вариант 2: Через Supabase CLI (Если доступен)

```bash
# Свяжите проект
supabase link --project-ref kzbtwgpedbojxnfiprsw

# Примените миграцию
supabase db push
```

### Вариант 3: Через Prisma (Альтернатива)

```bash
# Убедитесь, что DATABASE_URL настроен в .env
npx prisma db push
```

## 📋 Что делает миграция

### ✅ Создает новые таблицы:
- **Справочные таблицы**: `countries`, `carrier_codes`, `transport_modes`, `location_types`
- **Vessels API**: `vessels` (с правильными типами данных)
- **Locations API**: `locations`, `carrier_locations`
- **P2P Schedules API**: `ocean_products`, `transport_schedules`, `transport_legs`, `transports`, `facilities`, `un_location_codes`
- **Deadlines API**: `shipment_deadlines`, `shipment_deadline`, `deadlines`

### ✅ Настраивает:
- **Индексы** для производительности
- **RLS политики** для безопасности
- **Триггеры** для автоматического обновления `updated_at`
- **Справочные данные** (страны, коды перевозчиков, режимы транспорта, типы локаций)

### ✅ Удаляет старые таблицы:
- Все существующие таблицы удаляются и пересоздаются с правильной структурой

## ⚠️ Важные замечания

1. **Резервное копирование**: Эта миграция удаляет все существующие данные. Убедитесь, что у вас есть резервная копия.

2. **Время выполнения**: Миграция может занять несколько минут из-за большого количества операций.

3. **Проверка**: После выполнения проверьте, что все таблицы созданы корректно.

## 🔍 Проверка миграции

После выполнения миграции проверьте:

```sql
-- Проверьте, что все таблицы созданы
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Проверьте справочные данные
SELECT COUNT(*) as countries_count FROM countries;
SELECT COUNT(*) as carrier_codes_count FROM carrier_codes;
SELECT COUNT(*) as transport_modes_count FROM transport_modes;
SELECT COUNT(*) as location_types_count FROM location_types;
```

## 🎯 Результат

После успешной миграции ваша база данных будет **100% соответствовать** официальным спецификациям Maersk API:

- ✅ Все типы данных соответствуют OpenAPI схемам
- ✅ Все размеры полей точные
- ✅ Все связи и ограничения настроены
- ✅ Готово для работы с реальными данными Maersk API

## 🚀 Следующие шаги

1. **Обновите Prisma Client** (если используете):
   ```bash
   npx prisma generate
   ```

2. **Протестируйте подключение**:
   ```bash
   npx prisma studio
   ```

3. **Начните интеграцию с Maersk API** используя новые типы данных!

---

**Готово!** Ваша база данных теперь полностью соответствует официальным спецификациям Maersk API. 🎉
