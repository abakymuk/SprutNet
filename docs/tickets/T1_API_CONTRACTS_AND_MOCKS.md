# T1. API Contracts & Mocks

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
- [ ] Типы описаны в `packages/shared`.
- [ ] Моки подготовлены.
- [ ] API-роуты (`/api/ports/search`, `/api/schedules`, `/api/deadlines`) возвращают моки.
