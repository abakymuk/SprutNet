# T2. Search Form & Basic Results ✅ ЗАВЕРШЕНО

**Goal:** Сделать форму поиска POL→POD + список рейсов.

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

**Реализация:**
- ✅ Создана страница `/planner` с современным дизайном
- ✅ Реализована форма поиска с Combobox для портов (POL/POD)
- ✅ Добавлен DateRangePicker для выбора дат отправления
- ✅ Создан компонент результатов с карточками рейсов
- ✅ Реализована сортировка: Earliest / Shortest / Best
- ✅ Подсветка лучших рейсов с бейджами
- ✅ Полная интеграция с API (порты и расписания)
- ✅ Адаптивный дизайн для мобильных устройств
- ✅ Обновлена главная страница с ссылками на планировщик

**Архитектура:**
- `apps/web/src/app/planner/page.tsx` - главная страница планировщика
- `apps/web/src/components/planner/SearchForm.tsx` - форма поиска
- `apps/web/src/components/planner/SailingResults.tsx` - результаты поиска
- `apps/web/src/components/ui/` - UI компоненты (Popover, Command, Separator)

**Технические детали:**
- Использование shadcn/ui компонентов
- TypeScript типизация с @sprutnet/shared
- Debounced поиск портов (300ms)
- Сортировка и фильтрация на клиенте
- Responsive дизайн с Tailwind CSS
- Интеграция с моковыми данными

**Статус: ✅ ЗАВЕРШЕНО**
