# T20: Lane Insights - Аналитика направления

## 🎯 Цель

Дать пользователю агрегированное понимание надёжности и регулярности маршрута (средний транзит, частота рейсов, ближайшие рейсы).

## 📋 JTBD

**«Мне нужно оценить надёжность и регулярность направления, прежде чем принять решение по рейсу.»**

## 🏗️ Архитектура

### Входные данные
- Массив `Sailing[]` из `/api/routes/search`
- Параметры поиска: `originPort`, `destinationPort`

### Выходные данные
Объект `LaneMetrics`:
```typescript
interface LaneMetrics {
  avgTransitTime: number;        // Средний транзит (дни)
  sailingsPerWeek: number;       // Частота рейсов в неделю
  totalSailings: number;         // Общее количество рейсов
  reliability: number;           // Надежность (%)
  nextSailings: Sailing[];       // Ближайшие 5 рейсов
  routeEfficiency: number;       // Общая эффективность маршрута
  capacityUtilization: number;   // Утилизация вместимости
}
```

## 🎨 UX/UI Дизайн

### KPI Карточки
1. **Средний транзит** - с прогресс-баром
2. **Частота рейсов** - с индикатором уровня (высокая/средняя/низкая)
3. **Надежность** - с прогресс-баром и процентом
4. **Эффективность** - общий показатель с цветовой индикацией

### Таймлайн
- Горизонтальная линия времени
- Точки с hover-эффектами
- Детальная информация в tooltip
- Анимации при наведении

### Рекомендации
- Общая оценка маршрута
- Рекомендации по частоте
- Уровень риска

## 🔧 Реализация

### Компонент: `LaneInsights`

**Расположение:** `apps/web/src/components/planner/lane-insights.tsx`

**Основные функции:**
- Расчет метрик на основе данных рейсов
- Отображение KPI карточек
- Рендеринг таймлайна
- Формирование рекомендаций

### Алгоритмы расчета

#### Средний транзит
```typescript
const avgTransitTime = transitTimes.length > 0
  ? Math.round(transitTimes.reduce((sum, time) => sum + time, 0) / transitTimes.length)
  : 0;
```

#### Частота рейсов
```typescript
const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
const recentSailings = sailings.filter(s => new Date(s.departureDate) >= fourWeeksAgo);
const sailingsPerWeek = Math.round((recentSailings.length / 4) * 10) / 10;
```

#### Надежность
```typescript
const onTimeSailings = sailings.filter(s => !s.delay || s.delay === 0).length;
const reliability = sailings.length > 0
  ? Math.round((onTimeSailings / sailings.length) * 100)
  : 0;
```

#### Эффективность маршрута
```typescript
const routeEfficiency = Math.min(100, Math.round(
  ((100 - avgTransitTime * 2) + (sailingsPerWeek * 10) + reliability) / 3
));
```

### Интеграция

**В планировщике:** `apps/web/src/app/planner/page.tsx`
```typescript
<LaneInsights
  sailings={searchResults}
  originPort={originPort?.name}
  destinationPort={destinationPort?.name}
/>
```

## 🧪 Тестирование

### Unit-тесты
**Файл:** `apps/web/src/components/planner/__tests__/lane-insights.test.tsx`

**Покрытие:**
- Корректность расчетов метрик
- Поведение при пустом массиве
- Обработка отсутствующих данных
- Отображение KPI карточек
- Рендеринг таймлайна

### E2E тесты
**Скрипт:** `scripts/test-lane-insights.sh`

**Сценарии:**
1. Поиск CNSHA→USLAX
2. Проверка отображения блока "Инсайты"
3. Валидация расчетов метрик
4. Проверка таймлайна
5. Тестирование hover-эффектов

## 📊 Метрики и KPI

### Ключевые показатели
- **Средний транзит:** 12-28 дней (оптимально: <20)
- **Частота рейсов:** 0.5-3.0 в неделю (оптимально: >2.0)
- **Надежность:** 70-100% (оптимально: >90%)
- **Эффективность:** 60-100% (оптимально: >80%)

### Цветовая индикация
- 🟢 **Зеленый:** Отлично (80-100%)
- 🟡 **Желтый:** Хорошо (60-79%)
- 🔴 **Красный:** Требует внимания (<60%)

## 🚀 Производительность

### Оптимизации
- `useMemo` для расчетов метрик
- Ленивая загрузка компонентов
- Кэширование результатов API
- Виртуализация для больших списков

### Мониторинг
- Время рендеринга компонента
- Размер бандла
- Количество перерендеров

## 🔮 Будущие улучшения

### Планируемые функции
1. **Сравнение маршрутов** - side-by-side анализ
2. **Исторические данные** - тренды за период
3. **Прогнозирование** - ML-модели для предсказания
4. **Уведомления** - алерты о изменениях
5. **Экспорт данных** - PDF/Excel отчеты

### Технические улучшения
1. **Web Workers** - для тяжелых расчетов
2. **Service Workers** - для кэширования
3. **GraphQL** - для оптимизации запросов
4. **Real-time обновления** - WebSocket интеграция

## 📝 Acceptance Criteria (Gherkin)

```gherkin
Feature: Lane Insights
  As a user
  I want to see aggregated insights about route reliability and regularity
  So that I can make informed decisions about route selection

  Scenario: View route insights after search
    Given пользователь сделал поиск POL→POD
    When рейсы найдены
    Then сверху страницы видит:
      | KPI | Описание |
      | Средний транзит | дни |
      | Частота рейсов | рейсов/неделю |
      | Надежность | % |
      | Эффективность | % |
    And таймлайн ближайших 5 рейсов
    And hover на точку таймлайна показывает детали рейса

  Scenario: No data state
    Given нет рейсов
    Then блок «Инсайты» показывает «Нет данных для анализа»

  Scenario: Route recommendations
    Given есть данные о рейсах
    When анализируется маршрут
    Then отображается общая оценка
    And показывается рекомендация по частоте
    And указывается уровень риска
```

## 🛠️ Инструкции по запуску

### Запуск тестов
```bash
# Сделать скрипт исполняемым
chmod +x scripts/test-lane-insights.sh

# Запустить тесты
./scripts/test-lane-insights.sh
```

### Ручное тестирование
1. Открыть `http://localhost:3000/planner`
2. Выбрать порты отправления и назначения
3. Нажать "Найти рейсы"
4. Перейти на вкладку "Аналитика"
5. Проверить отображение KPI и таймлайна

## 📚 Дополнительные ресурсы

- [Figma макеты](../../designs/lane-insights.fig)
- [API документация](../../docs/API.md)
- [Компонентная библиотека](../../docs/COMPONENTS.md)
- [Руководство по тестированию](../../docs/TESTING.md)
