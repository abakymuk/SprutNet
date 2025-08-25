#!/bin/bash

# Maersk API Debug Script
# Диагностика проблем с Maersk API

set -e

echo "🔍 Maersk API Debug: Диагностика проблем с API"
echo "=============================================="
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

# Проверяем, что сервер запущен
check_server() {
    log_info "Проверяем доступность сервера..."
    
    if curl -s http://localhost:3000/api/maersk-health > /dev/null; then
        log_success "Сервер доступен"
    else
        log_error "Сервер недоступен. Запустите: npm run dev"
        exit 1
    fi
}

# Тест 1: Проверка переменных окружения
test_env_variables() {
    log_info "Тест 1: Проверка переменных окружения"
    
    # Проверяем наличие .env.local
    if [ -f "apps/web/.env.local" ]; then
        log_success "Файл .env.local найден"
    else
        log_error "Файл .env.local не найден"
        return 1
    fi
    
    # Проверяем FEATURE_MAERSK
    if grep -q "FEATURE_MAERSK=true" apps/web/.env.local; then
        log_success "FEATURE_MAERSK=true"
    else
        log_warning "FEATURE_MAERSK не установлен в true"
    fi
    
    # Проверяем наличие API ключей
    if grep -q "MAERSK_CONSUMER_KEY" apps/web/.env.local; then
        log_success "MAERSK_CONSUMER_KEY найден"
    else
        log_error "MAERSK_CONSUMER_KEY не найден"
        return 1
    fi
    
    if grep -q "MAERSK_CLIENT_SECRET" apps/web/.env.local; then
        log_success "MAERSK_CLIENT_SECRET найден"
    else
        log_error "MAERSK_CLIENT_SECRET не найден"
        return 1
    fi
    
    return 0
}

# Тест 2: Проверка Maersk Health API
test_maersk_health() {
    log_info "Тест 2: Проверка Maersk Health API"
    
    response=$(curl -s "http://localhost:3000/api/maersk-health")
    
    if echo "$response" | jq -e '.success' > /dev/null; then
        success=$(echo "$response" | jq -r '.success')
        if [ "$success" = "true" ]; then
            log_success "Maersk Health API отвечает"
            monitoring=$(echo "$response" | jq -r '.monitoring // "unknown"')
            log_info "Monitoring: $monitoring"
        else
            log_error "Maersk Health API возвращает success=false"
            echo "$response" | jq '.'
            return 1
        fi
    else
        log_error "Maersk Health API недоступен"
        echo "$response"
        return 1
    fi
    
    return 0
}

# Тест 3: Прямой тест Maersk API
test_direct_maersk_api() {
    log_info "Тест 3: Прямой тест Maersk API"
    
    # Тестируем API портов
    response=$(curl -s "http://localhost:3000/api/ports/search?query=Shanghai&limit=1")
    
    if echo "$response" | jq -e '.ports' > /dev/null; then
        ports_count=$(echo "$response" | jq '.ports | length')
        if [ "$ports_count" -gt 0 ]; then
            log_success "Maersk Ports API работает"
            port_name=$(echo "$response" | jq -r '.ports[0].name // "Unknown"')
            log_info "Найден порт: $port_name"
        else
            log_warning "Maersk Ports API не нашел порты"
        fi
    else
        log_error "Maersk Ports API недоступен"
        echo "$response" | jq '.'
        return 1
    fi
    
    return 0
}

# Тест 4: Тест поиска маршрутов с детальным логированием
test_routes_search_detailed() {
    log_info "Тест 4: Детальный тест поиска маршрутов"
    
    # Очищаем кэш перед тестом
    log_info "Очищаем кэш..."
    curl -s -X POST "http://localhost:3000/api/route-cache?action=clear-all" > /dev/null
    
    # Делаем запрос с подробным выводом
    log_info "Делаем запрос к API маршрутов..."
    response=$(curl -s "http://localhost:3000/api/routes/search?originPortId=CNSHA&destinationPortId=USLAX&limit=1")
    
    # Анализируем ответ
    source=$(echo "$response" | jq -r '.source // "unknown"')
    cached=$(echo "$response" | jq -r '.cached // "unknown"')
    response_time=$(echo "$response" | jq -r '.responseTime // "unknown"')
    total=$(echo "$response" | jq -r '.total // "unknown"')
    
    log_info "Результат анализа:"
    log_info "  Источник данных: $source"
    log_info "  Из кэша: $cached"
    log_info "  Время ответа: ${response_time}ms"
    log_info "  Всего рейсов: $total"
    
    if [ "$source" = "maersk" ]; then
        log_success "Данные получены от Maersk API"
        return 0
    elif [ "$source" = "fallback" ]; then
        log_warning "Используются fallback данные"
        
        # Проверяем, есть ли ошибка в ответе
        if echo "$response" | jq -e '.error' > /dev/null; then
            error=$(echo "$response" | jq -r '.error')
            log_error "Ошибка API: $error"
        fi
        
        return 1
    else
        log_error "Неизвестный источник данных: $source"
        return 1
    fi
}

# Тест 5: Проверка логов сервера
test_server_logs() {
    log_info "Тест 5: Проверка логов сервера"
    
    # Проверяем, есть ли логи в консоли сервера
    log_info "Проверьте консоль сервера на наличие ошибок Maersk API"
    log_info "Обычно ошибки выглядят как:"
    log_info "  ❌ Error fetching from Maersk API"
    log_info "  ❌ Ошибка при запросе к Maersk API"
    log_info "  ❌ Invalid Maersk API response format"
    
    return 0
}

# Тест 6: Проверка конфигурации Maersk клиента
test_maersk_client_config() {
    log_info "Тест 6: Проверка конфигурации Maersk клиента"
    
    # Проверяем файл конфигурации Maersk
    if [ -f "apps/web/src/lib/maersk.ts" ]; then
        log_success "Maersk клиент найден"
        
        # Проверяем наличие обработки ошибок
        if grep -q "catch.*error" apps/web/src/lib/maersk.ts; then
            log_success "Обработка ошибок настроена"
        else
            log_warning "Обработка ошибок не найдена"
        fi
        
        # Проверяем настройки timeout
        if grep -q "timeout" apps/web/src/lib/maersk.ts; then
            log_success "Timeout настроен"
        else
            log_warning "Timeout не настроен"
        fi
    else
        log_error "Maersk клиент не найден"
        return 1
    fi
    
    return 0
}

# Основная функция
main() {
    echo "🔍 Запуск диагностики Maersk API"
    echo "================================"
    echo ""
    
    check_server
    
    # Запускаем тесты
    tests=(
        "test_env_variables"
        "test_maersk_health"
        "test_direct_maersk_api"
        "test_routes_search_detailed"
        "test_server_logs"
        "test_maersk_client_config"
    )
    
    passed=0
    total=${#tests[@]}
    
    for test in "${tests[@]}"; do
        echo ""
        log_info "Запуск теста: $test"
        echo "----------------------------------------"
        
        if $test; then
            log_success "Тест $test пройден"
            ((passed++))
        else
            log_error "Тест $test провален"
        fi
        
        echo ""
    done
    
    # Итоговый отчет
    echo "============================================="
    echo "📊 Итоговый отчет диагностики Maersk API"
    echo "============================================="
    echo "Пройдено тестов: $passed из $total"
    
    if [ $passed -eq $total ]; then
        log_success "🎉 Все тесты диагностики пройдены!"
        echo ""
        echo "✅ Maersk API должен работать корректно"
        echo "🔍 Если проблемы остаются, проверьте:"
        echo "   • Логи сервера на наличие ошибок"
        echo "   • Валидность API ключей"
        echo "   • Доступность api.maersk.com"
    else
        log_error "❌ Обнаружены проблемы с Maersk API"
        echo ""
        echo "🔧 Рекомендации по исправлению:"
        echo "   1. Проверьте API ключи Maersk"
        echo "   2. Убедитесь, что api.maersk.com доступен"
        echo "   3. Проверьте логи сервера"
        echo "   4. Возможно, нужна перезагрузка сервера"
    fi
}

# Запуск основной функции
main "$@"
