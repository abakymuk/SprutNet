# 🚀 Быстрая инструкция по миграции

## Проблема с CLI подключением
Из-за проблем с подключением к облачной базе данных через CLI, используйте веб-интерфейс Supabase.

## 📋 Пошаговая инструкция

### 1. Откройте Supabase Dashboard
- Перейдите на https://supabase.com/dashboard
- Войдите в свой аккаунт
- Выберите проект: `kzbtwgpedbojxnfiprsw`

### 2. Откройте SQL Editor
- В левом меню найдите "SQL Editor"
- Нажмите "New query"

### 3. Примените миграцию
- Откройте файл `migration_script.sql` в вашем редакторе
- Скопируйте **весь содержимый скрипт** (от `-- ========================================` до `SELECT 'Migration completed successfully!' as status;`)
- Вставьте в SQL Editor
- Нажмите кнопку **"Run"** (▶️)

### 4. Проверьте результат
После выполнения вы должны увидеть:
```
status
Migration completed successfully!
```

## ⚠️ Важные замечания

1. **Резервное копирование**: Эта миграция удалит все существующие данные
2. **Время выполнения**: Может занять 2-5 минут
3. **Не прерывайте**: Дождитесь завершения выполнения

## 🔍 Проверка после миграции

Выполните в SQL Editor:

```sql
-- Проверьте созданные таблицы
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Проверьте справочные данные
SELECT COUNT(*) as countries_count FROM countries;
SELECT COUNT(*) as carrier_codes_count FROM carrier_codes;
```

## ✅ Ожидаемый результат

Должно быть создано **16 таблиц**:
- `countries`, `carrier_codes`, `transport_modes`, `location_types`
- `vessels`, `locations`, `carrier_locations`
- `ocean_products`, `transport_schedules`, `transport_legs`, `transports`
- `facilities`, `un_location_codes`
- `shipment_deadlines`, `shipment_deadline`, `deadlines`

## 🎯 После миграции

1. **Обновите Prisma Client**:
   ```bash
   npx prisma generate
   ```

2. **Протестируйте подключение**:
   ```bash
   npx prisma studio
   ```

---

**Готово!** 🎉 Ваша база данных теперь полностью соответствует официальным спецификациям Maersk API.
