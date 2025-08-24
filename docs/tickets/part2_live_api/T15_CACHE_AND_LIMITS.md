# T15. Кэш и лимиты

**Goal:** Снизить латентность и соблюсти лимиты Maersk API.

**Scope:**
- In: LRU-кэш на BFF (ключ = `pol|pod|from|to`, TTL 10–15 мин), короткий TTL для Deadlines (2–5 мин), логирование cacheHit/resultCount/latency.
- Out: отзывчивый UI и меньше 429.

**AC (Gherkin):**
- Given повторный запрос за 5 мин, When вызываю `/api/schedules`, Then попадаю в кэш (cacheHit=true).
- Given TTL истёк, Then выполняется новый вызов к API.

**DoD:**
- [ ] Кэш реализован и включён по умолчанию.
- [ ] Метрики логируются.
- [ ] Неблокирующие ретраи при 429.
