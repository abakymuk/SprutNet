# Руководство по работе с таймзонами и отображению времени

## Обзор

Данное руководство описывает единую модель работы с временем в приложении SprutNet Shipping Planner. Основной принцип: **хранить UTC, показывать Local (POL/POD), избегать путаницы**.

## Основные принципы

### 1. Хранение времени
- **Все даты/время хранятся в UTC** в базе данных и API
- **Порты имеют поле `timezone`** для определения локального времени
- **Дедлайны содержат `timezone`** для корректного отображения

### 2. Отображение времени
- **Основное время показывается в локальной таймзоне порта**
- **UTC время отображается мелким шрифтом как подсказка**
- **Используются стандартные сокращения таймзон** (MSK, EST, CST, etc.)

### 3. Обработка DST (летнее время)
- **Автоматическое определение DST** для каждой таймзоны
- **Обработка переходов DST** (весенний/осенний перевод часов)
- **Визуальная индикация DST** в интерфейсе

## Утилиты времени

### Основные функции

#### `convertUTCToLocal(utcDate, timezone)`
Конвертирует UTC время в локальное время для указанной таймзоны.

```typescript
const utcDate = new Date('2024-01-15T10:00:00Z');
const localDate = convertUTCToLocal(utcDate, 'Europe/Moscow');
// Результат: 2024-01-15T13:00:00 (UTC+3)
```

#### `formatTimeForDisplay(utcDate, timezone, showUTC)`
Форматирует время для отображения в UI с поддержкой UTC подсказки.

```typescript
const result = formatTimeForDisplay(utcDate, 'Europe/Moscow', true);
// Результат:
// {
//   localTime: "15.01.2024 13:00",
//   utcTime: "15.01.2024 10:00 UTC",
//   timezoneAbbr: "MSK",
//   isDST: false
// }
```

#### `isDST(timezone, date)`
Проверяет, действует ли DST в указанной таймзоне.

```typescript
const isDSTActive = isDST('America/New_York', new Date('2024-07-15'));
// Результат: true (летнее время)
```

### Обработка краевых случаев

#### Переходы DST
- **Весенний перевод** (Spring Forward): 2:00 AM → 3:00 AM
- **Осенний перевод** (Fall Back): 2:00 AM → 1:00 AM
- **Несуществующее время**: 2:30 AM в день весеннего перевода
- **Дублированное время**: 1:30 AM в день осеннего перевода

#### Неизвестные таймзоны
- **Fallback на UTC** при ошибках конвертации
- **Логирование предупреждений** для отладки
- **Graceful degradation** в UI

## Компоненты UI

### TimeDisplay
Основной компонент для отображения времени с поддержкой таймзон.

```tsx
<TimeDisplay
  utcDate={new Date('2024-01-15T10:00:00Z')}
  timezone="Europe/Moscow"
  showUTC={true}
  size="md"
  showIcon={true}
/>
```

**Пропсы:**
- `utcDate`: UTC дата/время
- `timezone`: таймзона (например, 'Europe/Moscow')
- `showUTC`: показывать ли UTC время (по умолчанию true)
- `size`: размер компонента ('sm' | 'md' | 'lg')
- `showIcon`: показывать ли иконку часов
- `className`: дополнительные CSS классы

### TimeDisplayCompact
Компактная версия для отображения времени без лишних элементов.

```tsx
<TimeDisplayCompact
  utcDate={new Date('2024-01-15T10:00:00Z')}
  timezone="Europe/Moscow"
  showTimezone={true}
  format="datetime"
/>
```

### TimezoneInfo
Компонент для отображения информации о таймзоне.

```tsx
<TimezoneInfo
  timezone="Europe/Moscow"
  showDetails={false}
  size="md"
/>
```

## Типы данных

### Обновленные типы

#### PortRef
```typescript
export interface PortRef {
  // ... существующие поля
  /** Таймзона порта (например, 'Europe/Moscow', 'Asia/Shanghai') */
  timezone?: string;
}
```

#### Sailing
```typescript
export interface Sailing {
  // ... существующие поля
  /** Дата отправления (UTC) */
  departureDate: Date;
  /** Дата прибытия (UTC) */
  arrivalDate: Date;
  /** Локальное время отправления */
  departureLocalTime?: string;
  /** Локальное время прибытия */
  arrivalLocalTime?: string;
  /** Таймзона порта отправления */
  originTimezone?: string;
  /** Таймзона порта назначения */
  destinationTimezone?: string;
}
```

#### Deadline
```typescript
export interface Deadline {
  // ... существующие поля
  /** Дата и время дедлайна */
  deadlineDate: Date;
  /** Временная зона */
  timezone: string;
}
```

## Правила отображения

### 1. Карточки рейсов
- **ETD/ETA**: показываются в таймзоне соответствующего порта
- **UTC подсказка**: отображается мелким шрифтом при наведении
- **Индикация DST**: показывается в бейдже таймзоны

### 2. Дедлайны
- **Время дедлайна**: в таймзоне порта отправления
- **Статус**: учитывает локальное время для определения просрочки
- **Уведомления**: отправляются в локальном времени пользователя

### 3. Таблицы и списки
- **Основное время**: локальное время порта
- **Сортировка**: по UTC времени для корректности
- **Фильтрация**: учитывает таймзоны при поиске

## Популярные таймзоны

### Европа
- `Europe/Moscow` - Москва (MSK, UTC+3)
- `Europe/London` - Лондон (GMT/BST, UTC+0/+1)
- `Europe/Berlin` - Берлин (CET/CEST, UTC+1/+2)

### Америка
- `America/New_York` - Нью-Йорк (EST/EDT, UTC-5/-4)
- `America/Chicago` - Чикаго (CST/CDT, UTC-6/-5)
- `America/Los_Angeles` - Лос-Анджелес (PST/PDT, UTC-8/-7)

### Азия
- `Asia/Shanghai` - Шанхай (CST, UTC+8)
- `Asia/Tokyo` - Токио (JST, UTC+9)
- `Asia/Dubai` - Дубай (GST, UTC+4)
- `Asia/Singapore` - Сингапур (SGT, UTC+8)

### Австралия
- `Australia/Sydney` - Сидней (AEST/AEDT, UTC+10/+11)

## Тестирование

### Unit-тесты
Все утилиты времени покрыты unit-тестами, включая:

- **Краевые случаи DST**: переходы весной и осенью
- **Неизвестные таймзоны**: graceful fallback
- **Международные таймзоны**: корректность конвертации
- **Форматирование**: правильность отображения

### Примеры тестов
```typescript
// DST переходы
it('should handle spring forward transition correctly', () => {
  const beforeTransition = new Date('2024-03-10T01:59:00Z');
  const afterTransition = new Date('2024-03-10T03:01:00Z');
  const timezone = 'America/New_York';
  
  const beforeOffset = getTimezoneOffset(timezone, beforeTransition);
  const afterOffset = getTimezoneOffset(timezone, afterTransition);
  
  expect(afterOffset - beforeOffset).toBe(60); // 1 час разницы
});
```

## Рекомендации по использованию

### 1. Всегда указывайте таймзону
```typescript
// ✅ Правильно
const timeInfo = formatTimeForDisplay(utcDate, 'Europe/Moscow', true);

// ❌ Неправильно
const timeInfo = formatTimeForDisplay(utcDate, 'UTC', true);
```

### 2. Используйте компоненты UI
```typescript
// ✅ Правильно
<TimeDisplay utcDate={deadline.deadlineDate} timezone={deadline.timezone} />

// ❌ Неправильно
<span>{deadline.deadlineDate.toLocaleString()}</span>
```

### 3. Обрабатывайте ошибки
```typescript
// ✅ Правильно
const timeInfo = formatTimeForDisplay(utcDate, timezone, true);
if (timeInfo.timezoneAbbr === 'UTC') {
  console.warn('Fallback to UTC for timezone:', timezone);
}
```

### 4. Тестируйте DST переходы
```typescript
// Тестируйте переходы DST для критичных операций
const dstTransitionDate = new Date('2024-03-10T02:00:00Z');
const result = handleDSTTransitions(dstTransitionDate, 'America/New_York');
```

## Миграция

### Для существующего кода
1. **Добавьте таймзоны к портам** в базе данных
2. **Обновите API** для возврата таймзон
3. **Замените прямые вызовы** `toLocaleString()` на компоненты
4. **Добавьте тесты** для новых утилит

### Пример миграции
```typescript
// Старый код
const departureTime = sailing.departureDate.toLocaleDateString('ru-RU');

// Новый код
<TimeDisplay
  utcDate={sailing.departureDate}
  timezone={sailing.originPort?.timezone || 'UTC'}
  showUTC={false}
/>
```

## Заключение

Следуя этим правилам, мы обеспечиваем:
- **Консистентность** отображения времени во всем приложении
- **Правильность** работы с международными таймзонами
- **Удобство** для пользователей из разных регионов
- **Надежность** при обработке DST переходов
- **Тестируемость** всех временных операций
