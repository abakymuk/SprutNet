# T11. Integrate Deadlines → `/api/deadlines`

**Goal:** Подключить дедлайны для выбранного рейса и отдать `Deadline[]` с UTC и Local.

**Scope:**
- In: параметры `pol` + `voyageId` (или другой идентификатор, который требует API), нормализация типов (DOC, CY, VGM, CUS, OTHER).
- Out: модалка дедлайнов показывает реальные cut-off.

**AC (Gherkin):**
- Given выбран рейс, When открываю "Deadlines", Then вижу как минимум DOC/CY/VGM (или "No deadlines available").
- Given у API отсутствует local time, Then UI показывает Local через таймзону POL.

**DoD:**
- [ ] Реальный вызов Deadlines через `Maersk.fetch`.
- [ ] Маппинг с нормализацией типов и безопасными полями.
- [ ] Unit-тесты на конвертацию времени (UTC ↔ Local).
- [ ] e2e: открытие модалки в пределах 500 мс (при кэше).
