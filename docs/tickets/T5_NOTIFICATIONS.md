# T5. Notifications

**Goal:** Возможность включить напоминания о дедлайнах.

**Scope:**
- In: чекбокс «Напомнить за 24 часа», базовый email/push.
- Out: сложные интеграции (Slack, WhatsApp).

**AC (Gherkin):**
- Given включено напоминание, Then получаю уведомление за 24 ч до cut-off.

**UX:** чекбокс в модалке дедлайнов.

**Contracts:** локальное хранилище или Supabase table `reminders`.

**DoD:**
- [ ] Чекбокс сохраняет настройки.
- [ ] Email/push срабатывает (через SendGrid/OneSignal).
