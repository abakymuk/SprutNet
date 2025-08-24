# T9. Integrate Locations → `/api/ports/search`

**Goal:** Подключить Maersk Locations к маршруту `/api/ports/search` и нормализовать в `PortRef`.

**Scope:**
- In: параметры `q` (строка), фильтр типа "port/UNLOCODE" (если требуется API), маппинг в `{ code, name, country }`.
- Out: фронт-Combobox получает реальные подсказки.

**AC (Gherkin):**
- Given запрос `/api/ports/search?q=sha`, When ответ получен, Then `CNSHA (Shanghai)` в топ-3 результатов.
- Given пустой ввод, Then возвращается пустой список или безопасный минимум.

**DoD:**
- [ ] Реальный вызов Locations через `Maersk.fetch`.
- [ ] Маппинг и защита от отсутствующих полей (используем `??`).
- [ ] Unit-тест маппера.
- [ ] Обновлён e2e: ввод "sha" → видим Shanghai.
