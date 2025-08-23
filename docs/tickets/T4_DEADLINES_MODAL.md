# T4. Deadlines Modal

**Goal:** Добавить просмотр дедлайнов для рейса.

**Scope:**
- In: кнопка «Дедлайны», модалка с таблицей cut-off.
- Out: напоминания.

**AC (Gherkin):**
- Given рейс в списке, When нажимаю «Дедлайны», Then вижу таблицу (тип, дата, комментарий).
- Given нет дедлайнов, Then вижу «No deadlines available».

**UX:** модалка (Dialog) с таблицей дедлайнов.

**Contracts:** `/api/deadlines`.

**DoD:**
- [ ] API-прослойка к Ocean Deadlines.
- [ ] Таблица дедлайнов (DOC, CY, VGM, …).
- [ ] Локальное время.
