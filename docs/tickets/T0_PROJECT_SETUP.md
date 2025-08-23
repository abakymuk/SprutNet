# T0. Project Setup & Environment

**Goal:** Запустить монорепо с Next.js 15 + shadcn/ui и готовым окружением.

**Scope:**
- In: pnpm workspaces, Next.js, Tailwind, shadcn/ui, базовые UI-компоненты.
- Out: бизнес-логика, API-маппинг.

**AC (Gherkin):**
- Given репозиторий, When запускаю `pnpm dev`, Then вижу пустую страницу Next.js.

**UX:** пока пустая страница.

**Contracts:** нет.

**DoD:**
- [x] Monorepo (pnpm workspaces).
- [x] Next.js 15 в `apps/web`.
- [x] shadcn/ui подключён (Card, Badge, Table, Dialog, Tabs, Combobox, Calendar).
- [x] `.env` с ключами Maersk.
- [x] README с инструкцией запуска.
- [x] Supabase интеграция настроена.
- [x] Базовые типы в `packages/shared`.
- [x] Проект запускается и работает.

**Статус:** ✅ ЗАВЕРШЕНО
