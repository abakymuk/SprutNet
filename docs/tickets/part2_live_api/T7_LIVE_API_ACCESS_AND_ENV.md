# T7. Live API Access & ENV

**Goal:** Подтвердить доступы к Maersk Ocean API и завести серверные переменные окружения.

**Scope:**
- In: проверка продуктов (Locations, Point-to-Point Schedules, Deadlines, Vessels), добавление ENV, защита секретов.
- Out: реализация запросов и маппинга.

**AC (Gherkin):**
- Given Maersk Developer Portal, When открываю карточки продуктов, Then вижу активированные Products: Locations, Point-to-Point Schedules, Deadlines, Vessels.
- Given проект, When добавляю ENV, Then build не падает и переменные доступны на сервере.

**ENV (server-only):**
```
MAERSK_BASE_URL=https://api.maersk.com
MAERSK_AUTH_HEADER=x-api-key
MAERSK_API_KEY=********
FEATURE_MAERSK=true
FEATURE_DEADLINES=true
CACHE_TTL_MINUTES=10
```

**DoD:**
- [ ] Продукты активны в портале.
- [ ] Описан источник правды по базовым URL и типу авторизации.
- [ ] ENV добавлены локально и в GitHub Environments (dev/staging/prod).
- [ ] README обновлён (как завести ключи и где их хранить).
