# ⚙️ Tech Stack — MVP Shipping Planner

## Frontend
- **Next.js 15** (App Router) — основной фреймворк для веб-приложения.
- **TypeScript** — строгая типизация.
- **Tailwind CSS** — быстрая стилизация.
- **shadcn/ui** — готовые UI-компоненты (Card, Badge, Table, Dialog, Tabs, Combobox, Calendar).
- **lucide-react** — иконки.

## Backend (BFF)
- **Next.js API Routes** (или NestJS позже) — тонкий слой-прокси между фронтом и Maersk API.
- **Feature Flags** (`FEATURE_MAERSK`, `FEATURE_DEADLINES`) — переключение между моками и живыми API.
- **Кэширование** (in-memory LRU / Supabase таблица) — чтобы снизить нагрузку на Maersk API и ускорить ответы.

## Data Layer
- **Maersk Developer API** (основные источники):
  - **Locations API** — поиск и автодополнение портов.
  - **Point-to-Point Schedules** — расписания рейсов POL→POD.
  - **Ocean Deadlines** — cut-off даты для рейсов.
  - **Vessels** — характеристики судов.
- **Domain Models (contracts-first)**: PortRef, Sailing, Deadline, VesselBrief.

## Infrastructure
- **pnpm workspaces** — монорепо для фронта, бекенда и пакетов.
- **Supabase** (опционально) — для хранения кэша и напоминаний.
- **Env-переменные** — для API-ключей и конфигурации.

## Testing & Quality
- **Vitest** — юнит-тесты (например, ранжирование рейсов).
- **Playwright** — e2e happy-path (поиск → список → дедлайны).
- **ESLint + Prettier** — кодстайл и чистота кода.

## Observability
- **Console + OpenTelemetry (опционально)** — логирование вызовов API, кэш-хитов, ошибок.
- Метрики: latency, % ошибок, cacheHit.

---
