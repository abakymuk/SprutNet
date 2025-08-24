# T12. Integrate Vessels (optional) → `/api/vessels/[imo]`

**Goal:** Вернуть `VesselBrief` по IMO для карточки судна.

**Scope:**
- In: маршрут `/api/vessels/[imo]`, маппинг `{ name, imo, operator, size/TEU, flag? }`.
- Out: по клику на судно открывается карточка с данными.

**AC (Gherkin):**
- Given IMO из рейса, When вызываю `/api/vessels/{imo}`, Then получаю валидный `VesselBrief`.
- Given поля отсутствуют, Then UI показывает дефолты (без краша).

**DoD:**
- [ ] Вызов Vessels через `Maersk.fetch` и маппинг.
- [ ] Unit-тест маппинга (в т.ч. отсутствующие поля).
- [ ] Связь с UI (кнопка/иконка судна).
