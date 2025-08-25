#!/bin/bash

# Maersk API Authentication Test
# Тестирование аутентификации Maersk API

echo "🔐 Maersk API Authentication Test"
echo "=================================="
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции для логирования
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Проверяем переменные окружения
log_info "Проверка переменных окружения:"
CONSUMER_KEY=$(grep MAERSK_CONSUMER_KEY apps/web/.env.local | cut -d'=' -f2)
CLIENT_SECRET=$(grep MAERSK_CLIENT_SECRET apps/web/.env.local | cut -d'=' -f2)

echo "MAERSK_CONSUMER_KEY: ${CONSUMER_KEY:0:10}..."
echo "MAERSK_CLIENT_SECRET: ${CLIENT_SECRET:0:10}..."
echo ""

# Тест 1: Прямой запрос к Maersk API с текущими заголовками
log_info "Тест 1: Прямой запрос к Maersk API"
log_info "URL: https://api.maersk.com/reference-data/locations?query=Shanghai&limit=1"

response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Consumer-Key: $CONSUMER_KEY" \
  -H "User-Agent: SprutNet/1.0" \
  "https://api.maersk.com/reference-data/locations?query=Shanghai&limit=1")

http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d':' -f2)
response_body=$(echo "$response" | sed '/HTTP_STATUS:/d')

echo "HTTP Status: $http_status"
echo "Response:"
echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
echo ""

# Тест 2: Проверка доступности API
log_info "Тест 2: Проверка доступности Maersk API"

if curl -s --connect-timeout 10 "https://api.maersk.com" > /dev/null; then
    log_success "Maersk API доступен"
else
    log_error "Maersk API недоступен"
fi

# Тест 3: Проверка с разными методами аутентификации
log_info "Тест 3: Проверка с разными методами аутентификации"

# Тест с Authorization header
log_info "Пробуем с Authorization header..."
response_auth=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $CONSUMER_KEY" \
  "https://api.maersk.com/reference-data/locations?query=Shanghai&limit=1")

http_status_auth=$(echo "$response_auth" | grep "HTTP_STATUS:" | cut -d':' -f2)
echo "Authorization Header - HTTP Status: $http_status_auth"

# Тест с X-API-Key header
log_info "Пробуем с X-API-Key header..."
response_xapi=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Accept: application/json" \
  -H "X-API-Key: $CONSUMER_KEY" \
  "https://api.maersk.com/reference-data/locations?query=Shanghai&limit=1")

http_status_xapi=$(echo "$response_xapi" | grep "HTTP_STATUS:" | cut -d':' -f2)
echo "X-API-Key Header - HTTP Status: $http_status_xapi"

# Тест с API-Key header
log_info "Пробуем с API-Key header..."
response_apikey=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Accept: application/json" \
  -H "API-Key: $CONSUMER_KEY" \
  "https://api.maersk.com/reference-data/locations?query=Shanghai&limit=1")

http_status_apikey=$(echo "$response_apikey" | grep "HTTP_STATUS:" | cut -d':' -f2)
echo "API-Key Header - HTTP Status: $http_status_apikey"
echo ""

# Тест 4: Проверка документации Maersk API
log_info "Тест 4: Проверка документации Maersk API"

# Проверяем, есть ли документация доступна
if curl -s "https://api.maersk.com" | grep -i "maersk" > /dev/null; then
    log_success "Maersk API домен отвечает"
else
    log_warning "Maersk API домен не отвечает как ожидалось"
fi

# Тест 5: Анализ ошибок
log_info "Тест 5: Анализ ошибок аутентификации"

if [ "$http_status" = "401" ]; then
    log_error "Ошибка 401: Неавторизованный доступ"
    log_info "Возможные причины:"
    log_info "  • Неверный Consumer-Key"
    log_info "  • Неправильный метод аутентификации"
    log_info "  • Истек срок действия ключа"
elif [ "$http_status" = "403" ]; then
    log_error "Ошибка 403: Доступ запрещен"
    log_info "Возможные причины:"
    log_info "  • Недостаточно прав для доступа к API"
    log_info "  • IP адрес не в белом списке"
elif [ "$http_status" = "429" ]; then
    log_error "Ошибка 429: Превышен лимит запросов"
    log_info "Возможные причины:"
    log_info "  • Rate limit превышен"
    log_info "  • Слишком много запросов"
elif [ "$http_status" = "200" ]; then
    log_success "Успешный ответ от API"
else
    log_warning "Неожиданный HTTP статус: $http_status"
fi

echo ""
echo "📊 Результаты тестирования аутентификации:"
echo "=========================================="
echo "Основной запрос: $http_status"
echo "Authorization: $http_status_auth"
echo "X-API-Key: $http_status_xapi"
echo "API-Key: $http_status_apikey"
echo ""

# Рекомендации
echo "🔧 Рекомендации по исправлению:"
echo "==============================="

if [ "$http_status" = "401" ]; then
    echo "1. Проверьте правильность Consumer-Key"
    echo "2. Убедитесь, что ключ активен и не истек"
    echo "3. Проверьте документацию Maersk API для правильного метода аутентификации"
    echo "4. Возможно, нужен OAuth токен вместо простого Consumer-Key"
elif [ "$http_status" = "403" ]; then
    echo "1. Проверьте права доступа к API"
    echo "2. Убедитесь, что ваш IP адрес разрешен"
    echo "3. Проверьте, что API ключ имеет нужные разрешения"
elif [ "$http_status" = "429" ]; then
    echo "1. Уменьшите частоту запросов"
    echo "2. Добавьте задержки между запросами"
    echo "3. Проверьте лимиты вашего API плана"
else
    echo "1. Проверьте документацию Maersk API"
    echo "2. Убедитесь, что используете правильные endpoints"
    echo "3. Проверьте формат запросов"
fi

echo ""
echo "📚 Полезные ссылки:"
echo "• Maersk API Documentation: https://api.maersk.com"
echo "• API Key Management: https://api.maersk.com/developer"
