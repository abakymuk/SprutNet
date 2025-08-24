# T6. Polish & Demo

**Goal:** Подготовить MVP к показу.

**Scope:**
- In: skeleton loaders, error states, e2e тест.
- Out: продакшен оптимизации.

**AC (Gherkin):**
- Given поиск в прогрессе, Then вижу skeleton.
- Given ошибка API, Then вижу дружелюбное сообщение.
- Given e2e тест проходит, Then MVP готов к демо.

**UX:** всё аккуратно, удобный happy-path.

**Contracts:** нет новых.

**DoD:**
- [x] Skeleton loaders.
- [x] Error states.
- [x] e2e happy-path (поиск → список → дедлайны).
- [x] Демо-сценарий подготовлен (например, CNSHA → USLAX).

**Реализовано:**
- ✅ Skeleton loaders для формы поиска и результатов
- ✅ Error states с дружелюбными сообщениями
- ✅ Empty states для пустых результатов
- ✅ E2E тестирование happy path с автоматизированными тестами
- ✅ Интерактивная демо-страница с пошаговым показом
- ✅ Демо-сценарий Shanghai (CNSHA) → Los Angeles (USLAX)
- ✅ Интеграция в навигацию приложения
