# T1. API Contracts & Mocks ✅ ЗАВЕРШЕНО

**Goal:** Определить доменные типы и моковые данные для POL→POD поиска.

**Scope:**
- In: OpenAPI/TS-интерфейсы, моки для портов, расписаний, дедлайнов.
- Out: живая интеграция с Maersk.

**AC (Gherkin):**
- Given `FEATURE_MAERSK=false`, When открываю `/api/*`, Then возвращаются моки.

**UX:** пока нет.

**Contracts:**
- PortRef, Sailing, Deadline (см. `@shared/types`).

**DoD:**
- [x] Типы описаны в `packages/shared`.
- [x] Моки подготовлены.
- [x] API-роуты (`/api/ports/search`, `/api/schedules`, `/api/deadlines`) возвращают моки.

**Реализация:**
- ✅ Создан shared types package с полной типизацией
- ✅ Подготовлены моковые данные (10 портов, 3 расписания, 7 дедлайнов)
- ✅ Реализованы API роуты с поддержкой фильтрации и пагинации
- ✅ Добавлена поддержка feature flag `FEATURE_MAERSK`
- ✅ Протестированы все API endpoints

**Документация:** `docs/T1_IMPLEMENTATION_COMPLETE.md`
