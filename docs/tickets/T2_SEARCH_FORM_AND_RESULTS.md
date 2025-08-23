# T2. Search Form & Basic Results

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
- [ ] Форма поиска (Combobox + DateRange).
- [ ] Карточка рейса: Vessel, Service, ETD, ETA, transitDays.
- [ ] Подсветка Earliest / Shortest / Best.
- [ ] Работает и на моках.
