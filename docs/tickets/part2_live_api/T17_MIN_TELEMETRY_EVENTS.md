# T17. Мини-телеметрия событий

**Goal:** Видеть реальную ценность и проблемы сразу после включения live.

**Scope:**
- In: события `search_started`, `search_success(count)`, `deadline_opened`, `deadline_error(code)`, `cache_hit`, `api_retry` (client→server log).
- Out: базовый дашборд/лог-файл для анализа.

**AC (Gherkin):**
- Given пользователь сделал поиск, Then фиксируется `search_started` и `search_success` с количеством результатов.
- Given ошибка дедлайнов, Then фиксируется `deadline_error(code)`.

**DoD:**
- [ ] Логирование включено в ключевых местах BFF и UI.
- [ ] Быстрый просмотр метрик (console/лог-файл/легковесный дашборд).
