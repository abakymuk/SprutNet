# T10. Integrate Point-to-Point Schedules → `/api/schedules`

**Goal:** Подключить расписания POL→POD, посчитать `transitDays`, отдать массив `Sailing[]`.

**Scope:**
- In: параметры `pol`, `pod`, `from`, `to` (ISO), маппинг в доменную модель, расчёт `transitDays = ceil(ETA-ETD)`.
- Out: список рейсов в UI на реальных данных.

**AC (Gherkin):**
- Given CNSHA→USLAX в окне 30 дней, When вызываю `/api/schedules`, Then получаю ≥ 5 рейсов.
- Given корректный ответ, Then `transitDays` положителен и целочисленный.

**DoD:**
- [ ] Реальный вызов Schedules через `Maersk.fetch`.
- [ ] Надёжный маппинг ETA/ETD, защита от пустых полей.
- [ ] Unit-тест расчёта `transitDays` и сортировок.
- [ ] e2e happy-path отображает карточки за < 5 c.
