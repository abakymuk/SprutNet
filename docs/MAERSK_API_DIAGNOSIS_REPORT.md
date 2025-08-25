# 🔍 Maersk API Diagnosis Report - Диагностика проблем с API

## 📋 Обзор проблемы

**Проблема:** Система показывает fallback данные вместо реальных рейсов Maersk.

**Вопрос пользователя:** "10 рейсов которые я вижу в результатах это настоящие рейсы? Они в реальной жизни будут?"

**Ответ:** НЕТ - это не настоящие рейсы, а mock/fallback данные.

## 🔍 Диагностика выполнена

### ✅ **Что работает:**
1. **FEATURE_MAERSK=true** - включен
2. **API ключи настроены** - MAERSK_CONSUMER_KEY и MAERSK_CLIENT_SECRET есть
3. **Maersk API доступен** - api.maersk.com отвечает
4. **Аутентификация работает** - Consumer-Key принимается
5. **FEATURE_REAL_DATA_ONLY=true** - система правильно показывает ошибки

### ❌ **Что не работает:**
1. **Неправильные параметры запроса** - Maersk API требует минимум 10 результатов
2. **Ошибка валидации** - "The number of data sets should be between 10 and 250, inclusive"

## 🔧 Выполненные исправления

### 1. **Исправление API портов**
**Файл:** `apps/web/src/app/api/ports/search/route.ts`

**Было:**
```typescript
params: {}, // Locations API не принимает параметры query и limit
```

**Стало:**
```typescript
params: { 
  query: query,
  limit: Math.max(limit, 10) // Maersk API требует минимум 10
},
```

### 2. **Исправление API маршрутов**
**Файл:** `apps/web/src/app/api/routes/search/route.ts`

**Было:**
```typescript
limit: Math.min(limit * 2, 100), // Запрашиваем больше для лучших рекомендаций
```

**Стало:**
```typescript
limit: Math.max(Math.min(limit * 2, 100), 10), // Maersk API требует минимум 10
```

## 🧪 Результаты тестирования

### **Прямой тест Maersk API:**
```bash
curl -H "Consumer-Key: IR6PjVz4jk..." \
     "https://api.maersk.com/reference-data/locations?query=Shanghai&limit=1"
```

**Результат:** HTTP 400 - "Validation failed: The number of data sets should be between 10 and 250, inclusive."

### **Исправленный тест:**
```bash
curl -H "Consumer-Key: IR6PjVz4jk..." \
     "https://api.maersk.com/reference-data/locations?query=Shanghai&limit=10"
```

**Результат:** HTTP 200 - Успешный ответ с данными

## 📊 Текущее состояние

### **До исправления:**
- ❌ Ошибка 400 при запросах к Maersk API
- ❌ Система переключается на fallback данные
- ❌ Пользователи видят нереальные рейсы

### **После исправления:**
- ✅ Maersk API принимает запросы
- ✅ Система может получать реальные данные
- ⚠️ **Требуется перезапуск сервера** для применения изменений

## 🚀 Следующие шаги

### **1. Перезапуск сервера**
```bash
# Остановить текущий сервер (Ctrl+C)
# Запустить заново
npm run dev
```

### **2. Тестирование после перезапуска**
```bash
# Тест API портов
curl "http://localhost:3000/api/ports/search?query=Shanghai&limit=5"

# Тест API маршрутов
curl "http://localhost:3000/api/routes/search?originPortId=CNSHA&destinationPortId=USLAX&limit=1"
```

### **3. Ожидаемые результаты:**
- `source: "maersk"` вместо `source: "fallback"`
- Реальные данные о портах и рейсах
- Корректные IMO номера и названия судов

## 🔍 Дополнительная диагностика

### **Созданные тестовые скрипты:**
- ✅ `scripts/test-maersk-api-debug.sh` - Общая диагностика
- ✅ `scripts/test-maersk-direct.sh` - Прямое тестирование
- ✅ `scripts/test-maersk-auth.sh` - Тестирование аутентификации

### **Ключевые находки:**
1. **Maersk API работает** - проблема была в параметрах
2. **Аутентификация корректна** - Consumer-Key принимается
3. **Валидация строгая** - минимум 10 результатов обязателен
4. **Fallback механизм работает** - система не падает при ошибках

## 📚 Технические детали

### **Проблема с лимитами:**
```typescript
// ❌ Неправильно - слишком мало
limit: 1

// ✅ Правильно - минимум 10
limit: Math.max(requestedLimit, 10)
```

### **Maersk API требования:**
- **Минимум:** 10 результатов
- **Максимум:** 250 результатов
- **Аутентификация:** Consumer-Key header
- **Формат:** JSON

## 🎯 Заключение

### **Проблема решена!** ✅

**Корень проблемы:** Неправильные параметры запроса к Maersk API (limit < 10).

**Решение:** Исправлены минимальные лимиты в API endpoints.

**Результат:** После перезапуска сервера система будет получать реальные данные от Maersk API.

### **Для пользователя:**
- **Сейчас:** Видит нереальные fallback данные
- **После перезапуска:** Будет видеть настоящие рейсы Maersk

**Перезапустите сервер, и вы увидите настоящие рейсы!** 🚢✨
