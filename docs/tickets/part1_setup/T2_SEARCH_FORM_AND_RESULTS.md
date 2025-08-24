# T2. Search Form & Basic Results ✅ ЗАВЕРШЕНО

**Goal:** Сделать форму поиска POL→POD + список рейсов с единой shadcn стилистикой.

**Scope:**
- In: Combobox POL/POD, DateRangePicker, выдача рейсов.
- Out: дедлайны, инсайты.

**AC (Gherkin):**
- Given выбран POL/POD, When нажимаю «Search», Then вижу список рейсов.
- Given нет данных, Then вижу «No sailings».

**UX:** страница `/planner`: поиск сверху, список карточек рейсов ниже.

**Contracts:** `/api/ports/search`, `/api/schedules`.

**DoD:**
- [x] Форма поиска (Combobox + DateRange).
- [x] Карточка рейса: Vessel, Service, ETD, ETA, transitDays.
- [x] Подсветка Earliest / Shortest / Best.
- [x] Работает и на моках.
- [x] Единая shadcn стилистика.

**Реализация:**
- ✅ Создана страница `/planner` с современным shadcn дизайном
- ✅ Реализована форма поиска с Combobox для портов (POL/POD)
- ✅ Добавлен DateRangePicker для выбора дат отправления
- ✅ Создан компонент результатов с карточками рейсов
- ✅ Реализована сортировка: Earliest / Shortest / Best
- ✅ Подсветка лучших рейсов с бейджами
- ✅ Полная интеграция с API (порты и расписания)
- ✅ Адаптивный дизайн для мобильных устройств
- ✅ Обновлена главная страница с shadcn стилистикой
- ✅ Исправлены CSS переменные и убраны ошибки Tailwind

**Архитектура:**
- `apps/web/src/app/planner/page.tsx` - главная страница планировщика
- `apps/web/src/components/planner/SearchForm.tsx` - форма поиска
- `apps/web/src/components/planner/SailingResults.tsx` - результаты поиска
- `apps/web/src/components/ui/` - UI компоненты (Popover, Command, Separator, Calendar)

**Технические детали:**
- Использование shadcn/ui компонентов с правильными CSS переменными
- TypeScript типизация с @sprutnet/shared
- Debounced поиск портов (300ms)
- Сортировка и фильтрация на клиенте
- Responsive дизайн с Tailwind CSS
- Интеграция с моковыми данными
- Единая цветовая схема и стилистика

**shadcn стилистика:**
- ✅ CSS переменные для темной/светлой темы
- ✅ Использование semantic цветов (primary, secondary, muted, etc.)
- ✅ Консистентные компоненты (Button, Card, Badge, etc.)
- ✅ Правильная типографика и spacing
- ✅ Hover эффекты и transitions
- ✅ Адаптивный дизайн

**Статус: ✅ ЗАВЕРШЕНО**
