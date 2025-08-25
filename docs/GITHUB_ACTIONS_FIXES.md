# GitHub Actions Fixes - npm Registry Rate Limits

## Проблема

GitHub Actions сталкивались с ошибкой HTTP 429 (Too Many Requests) при установке pnpm из-за ограничений скорости npm registry.

## Решение

### 1. Обновление до официального pnpm action

**Было:**
```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v2
  with:
    version: '8'
```

**Стало:**
```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v3
  with:
    version: '8'
    run_install: false
```

### 2. Улучшенное кэширование

Добавлено кэширование для:
- pnpm store (`~/.pnpm-store`)
- node_modules в корне и подпапках
- Использование `--prefer-offline` для уменьшения сетевых запросов

```yaml
- name: Setup pnpm cache
  uses: actions/cache@v4
  with:
    path: |
      ~/.pnpm-store
      node_modules
      */*/node_modules
    key: node-${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      node-${{ runner.os }}-
```

### 3. Оптимизация установки зависимостей

**Было:**
```yaml
- name: Install dependencies
  run: pnpm install
```

**Стало:**
```yaml
- name: Install dependencies
  run: pnpm install --fetch-retries=6 --fetch-timeout=60000 --prefer-offline
```

## Обновленные файлы

1. `.github/workflows/ci.yml` - Основной CI/CD pipeline
2. `.github/workflows/database.yml` - Управление базой данных
3. `.github/workflows/auto-deploy.yml` - Автоматическое развертывание
4. `.github/workflows/api-test.yml` - Тестирование API
5. `.github/workflows/deploy-production.yml` - Развертывание в production
6. `.github/workflows/deploy-staging.yml` - Развертывание в staging

## Преимущества

### 🚀 Производительность
- **Кэширование**: Значительное ускорение сборки за счет кэширования зависимостей
- **Offline-first**: Использование `--prefer-offline` уменьшает сетевые запросы
- **Retry logic**: Автоматические повторы при временных сбоях

### 🔒 Надежность
- **Официальный action**: Использование стабильного pnpm/action-setup@v3
- **Fallback keys**: Кэш восстанавливается даже при частичных совпадениях
- **Timeout handling**: Увеличенные таймауты для медленных соединений

### 💰 Экономия ресурсов
- **Меньше запросов**: Кэширование снижает нагрузку на npm registry
- **Быстрые сборки**: Повторные сборки используют кэш
- **Стабильность**: Меньше сбоев из-за ограничений скорости

## Мониторинг

После внедрения этих изменений:

1. **Время сборки**: Должно сократиться на 30-50%
2. **Стабильность**: Устранение ошибок HTTP 429
3. **Кэш hit rate**: Отслеживание эффективности кэширования

## Дополнительные рекомендации

### Для дальнейшей оптимизации:

1. **Registry mirror**: Уже используется `registry.npmmirror.com`
2. **Dependency analysis**: Регулярный аудит зависимостей
3. **Build optimization**: Рассмотрение использования pnpm workspaces

### Мониторинг кэша:

```bash
# Проверка размера кэша
du -sh ~/.pnpm-store

# Очистка кэша при необходимости
pnpm store prune
```

## Заключение

Эти изменения должны полностью решить проблему с ограничениями скорости npm registry и значительно улучшить производительность CI/CD pipeline.
