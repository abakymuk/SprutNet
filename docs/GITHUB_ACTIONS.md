# 🚀 GitHub Actions — минимальный стандарт для MVP

## 🌿 Принципы
- **Ветвление:**  
  - `main` → прод.  
  - `develop` → staging.  
  - feature-ветки → PR → merge в `develop`.  
- **Environments:** dev / staging / prod (с отдельными секретами).  
- **Quality Gate на PR:** lint → typecheck → unit → build → e2e.  
- **Кэш:** pnpm + node_modules.  
- **Превью:**  
  - фронт → Fly.io Preview.  
  - API → Render/Cloud Run Preview (без Docker, через buildpacks).  
- **Secrets:** хранятся в GitHub Environments.  
- **Commits:** Conventional Commits → авто CHANGELOG + релизы.  

---

## 📂 Структура

```
.github/
├── workflows/
│   ├── _setup.yml          # базовая подготовка окружения
│   ├── _quality.yml        # lint/typecheck/tests/build
│   ├── pr.yml              # проверки для PR
│   ├── ci_develop.yml      # CI на develop (деплой в staging)
│   ├── release_main.yml    # релиз на main
│   └── deploy_prod.yml     # ручной деплой в prod
└── release-drafter.yml     # конфигурация авторелизов
```

---

## 🔧 Основные workflow

### 1. Setup (reusable)
- Checkout, Node.js 20, corepack enable.  
- Установка зависимостей (`pnpm i --frozen-lockfile`).  

### 2. Quality Gate (reusable)
- Lint.  
- Typecheck.  
- Unit tests.  
- Build.  
- (опционально) e2e через Playwright/Cypress.  

### 3. PR Checks
- paths-filter → запуск тестов только для изменённых частей (FE или API).  
- Для изменённых директорий прогоняется `_quality.yml`.  

### 4. CI on Develop
- Автоматический quality gate.  
- Deploy staging:  
  - фронт → Fly.io.  
  - API → Render/Cloud Run.  

### 5. Release on Main
- Conventional Commits → автоматический CHANGELOG + git-теги.  
- Версионирование (semver).  

### 6. Deploy Prod
- Триггер по тегу (`vX.Y.Z`).  
- Deploy фронта и API в прод (Fly.io).  
- Approvals обязательны.  

---

## 🔒 Защита
- Branch protection: PR-чеки обязательны.  
- Staging → 1 approve, Prod → 2 approves.  
- Timeout джоб: 15–20 мин.  
- Логи храним 14–30 дней.  

---

## ✅ Практика
- Коммиты: `feat:`, `fix:`, `perf:`, `refactor:`.  
- Major changes → `feat!:` или `BREAKING CHANGE:`.  
- Автоматический changelog через release-drafter.  

---

## 🚀 Использование

### Разработка
1. Создайте feature ветку: `git checkout -b feature/new-feature`
2. Внесите изменения с conventional commits
3. Создайте PR в `develop`
4. Дождитесь прохождения всех проверок
5. Получите approve и merge

### Релиз
1. Merge `develop` в `main`
2. Автоматически создается релиз
3. Создается тег `vX.Y.Z`
4. Запускается деплой в production

### Ручной деплой
```bash
# Создать тег для деплоя в production
git tag v1.0.0
git push origin v1.0.0
```

---

## 📊 Мониторинг

### GitHub Actions
- **PR Checks**: https://github.com/abakymuk/SprutNet/actions?query=workflow%3A%22Pull+Request+Checks%22
- **CI Develop**: https://github.com/abakymuk/SprutNet/actions?query=workflow%3A%22CI+on+Develop%22
- **Releases**: https://github.com/abakymuk/SprutNet/actions?query=workflow%3A%22Release+on+Main%22

### Environments
- **Staging**: https://sprutnet-staging.vercel.app
- **Production**: https://sprutnet.vercel.app

---

## 🔧 Настройка

### Branch Protection Rules
1. Перейдите в Settings → Branches
2. Добавьте rule для `main` и `develop`
3. Включите:
   - Require a pull request before merging
   - Require status checks to pass before merging
   - Require branches to be up to date before merging

### Environments
1. Перейдите в Settings → Environments
2. Создайте `staging` и `production`
3. Добавьте required reviewers:
   - Staging: 1 reviewer
   - Production: 2 reviewers

### Secrets
Убедитесь, что все секреты добавлены в соответствующие environments:
- `staging`: все секреты для staging
- `production`: все секреты для production

---

## 🚨 Устранение неполадок

### Проблемы с кэшем
```bash
# Очистить кэш локально
pnpm store prune

# Очистить кэш в CI
# Добавьте в workflow:
- name: Clear cache
  run: pnpm store prune
```

### Проблемы с деплоем
1. Проверьте логи в GitHub Actions
2. Убедитесь, что все секреты настроены
3. Проверьте статус приложений в Fly.io

### Проблемы с тестами
1. Запустите тесты локально: `pnpm test`
2. Проверьте конфигурацию тестов
3. Убедитесь, что все зависимости установлены
