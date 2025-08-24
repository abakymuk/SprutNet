# Maersk API Setup Guide

## 📋 Обзор

Данный документ описывает процесс настройки интеграции с Maersk Ocean API для проекта SprutNet.

## 🔑 Получение API ключа

### 1. Регистрация в Maersk Developer Portal

1. Перейдите на [Maersk Developer Portal](https://developer.maersk.com)
2. Создайте аккаунт или войдите в существующий
3. Перейдите в раздел "My Apps"

### 2. Создание приложения

1. Нажмите "Create New App"
2. Заполните форму:
   - **App Name**: `SprutNet Shipping Planner`
   - **Description**: `Intelligent shipping planning system with Maersk API integration`
   - **Category**: `Logistics & Shipping`

### 3. Активация продуктов

Убедитесь, что у вас активированы следующие продукты:

- ✅ **Locations** - справочник портов и локаций
- ✅ **Point-to-Point Schedules** - расписания рейсов между портами
- ✅ **Deadlines** - дедлайны для грузов
- ✅ **Vessels** - справочник судов

### 4. Получение API ключа

1. В настройках приложения найдите раздел "API Keys"
2. Скопируйте ваш API ключ
3. **Важно**: Храните ключ в безопасном месте

## ⚙️ Настройка переменных окружения

### Локальная разработка

1. Скопируйте файл с примерами:
   ```bash
   cp apps/web/env.example apps/web/.env.local
   ```

2. Отредактируйте `apps/web/.env.local`:
   ```env
   # Maersk API Configuration
   MAERSK_API_KEY=IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd
   MAERSK_API_SECRET=CnIcg3YgUUtSp8a3
   MAERSK_API_BASE_URL=https://api.maersk.com
   
   # Maersk API Endpoints
   MAERSK_LOCATIONS_API_URL=https://api.maersk.com/reference-data
   MAERSK_P2P_API_URL=https://api.maersk.com/products
   MAERSK_VESSELS_API_URL=https://api.maersk.com/reference-data
   MAERSK_DEADLINES_API_URL=https://api.maersk.com
   
   # Feature Flags
   FEATURE_MAERSK=true
   FEATURE_DEADLINES=true
   
   # Cache Configuration
   CACHE_TTL_MINUTES=10
   ```

### GitHub Environments

#### Development Environment

1. Перейдите в Settings → Environments → Create environment
2. Название: `development`
3. Добавьте переменные:
   ```
   MAERSK_API_KEY=your_dev_api_key
   FEATURE_MAERSK=true
   FEATURE_DEADLINES=true
   CACHE_TTL_MINUTES=10
   ```

#### Staging Environment

1. Создайте environment `staging`
2. Добавьте переменные:
   ```
   MAERSK_API_KEY=your_staging_api_key
   FEATURE_MAERSK=true
   FEATURE_DEADLINES=true
   CACHE_TTL_MINUTES=10
   ```

#### Production Environment

1. Создайте environment `production`
2. Добавьте переменные:
   ```
   MAERSK_API_KEY=your_production_api_key
   FEATURE_MAERSK=true
   FEATURE_DEADLINES=true
   CACHE_TTL_MINUTES=10
   ```

### Vercel Deployment

1. В настройках проекта Vercel перейдите в Environment Variables
2. Добавьте переменные:
   ```
   MAERSK_API_KEY=your_production_api_key
   FEATURE_MAERSK=true
   FEATURE_DEADLINES=true
   CACHE_TTL_MINUTES=10
   ```

## 🔍 Проверка настройки

### 1. Запустите проект
```bash
pnpm dev
```

### 2. Проверьте статус API
Откройте [http://localhost:3000/maersk-status](http://localhost:3000/maersk-status)

### 3. Ожидаемый результат

✅ **Успешная настройка:**
- Все переменные окружения настроены
- Feature flags активны
- Продукты Maersk API доступны

❌ **Проблемы:**
- Отсутствует MAERSK_API_KEY
- FEATURE_MAERSK=false
- Ошибки доступа к API

## 🛡️ Безопасность

### Рекомендации по безопасности

1. **Никогда не коммитьте API ключи** в Git
2. **Используйте разные ключи** для dev/staging/prod
3. **Регулярно ротируйте** API ключи
4. **Ограничивайте доступ** к переменным окружения
5. **Мониторьте использование** API

### Переменные для разных сред

| Environment | MAERSK_API_KEY | FEATURE_MAERSK | Описание |
|-------------|----------------|----------------|----------|
| Development | dev_key_xxx | true | Локальная разработка |
| Staging | staging_key_xxx | true | Тестирование |
| Production | prod_key_xxx | true | Продакшн |

## 🔧 Troubleshooting

### Частые проблемы

#### 1. "MAERSK_API_KEY не установлен"
**Решение:** Проверьте, что переменная добавлена в `.env.local`

#### 2. "API отключен через feature flag"
**Решение:** Установите `FEATURE_MAERSK=true`

#### 3. "Ошибка доступа к API"
**Решение:** 
- Проверьте правильность API ключа
- Убедитесь, что продукты активированы в портале
- Проверьте сетевое подключение

#### 4. "401 Unauthorized"
**Решение:**
- Проверьте формат API ключа
- Убедитесь, что ключ не истек
- Проверьте права доступа в портале

### Логи и отладка

1. **Проверьте консоль браузера** на ошибки
2. **Проверьте логи сервера** в терминале
3. **Используйте страницу статуса** для диагностики
4. **Проверьте Network tab** в DevTools

## 📚 Дополнительные ресурсы

- [Maersk API Documentation](https://developer.maersk.com/docs)
- [Maersk Developer Portal](https://developer.maersk.com)
- [API Rate Limits](https://developer.maersk.com/docs/rate-limits)
- [Error Codes](https://developer.maersk.com/docs/error-codes)

## 🔄 Обновления

### Версия 1.0.0
- Базовая интеграция с Maersk API
- Поддержка 4 основных продуктов
- Система проверки статуса API
- Документация по настройке

### Планы на будущее
- Интеграция с дополнительными API
- Расширенная система кэширования
- Мониторинг и алерты
- Автоматическая ротация ключей
