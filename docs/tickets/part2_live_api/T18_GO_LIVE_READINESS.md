# T18. Go-Live Readiness Checklist

**Goal:** Убедиться, что MVP на живых API готов к показу/пилотам.

**Scope:**
- In: финальная проверка маршрутов, дедлайнов, производительности и фоллбеков.
- Out: ✅ чек-лист пройден.

**AC (Gherkin):**
- [ ] `/api/ports/search?q=sha` → CNSHA в топ-3.
- [ ] `/api/schedules?pol=CNSHA&pod=USLAX&from=2025-09-01&to=2025-09-30` → ≥ 5 записей.
- [ ] `/planner` рендер < 5 c на первом заходе.
- [ ] Дедлайны: видны DOC/CY/VGM или честный "No deadlines available".
- [ ] `FEATURE_MAERSK=false` → мгновенно возвращаются моки.
- [ ] Логи: cacheHit и 429→retry присутствуют, error rate < 2%.

**DoD:**
- [ ] Чек-лист выполнен.
- [ ] Демо-сценарий обновлён под live-данные.
- [ ] README: раздел "Как переключиться на live/моки".
