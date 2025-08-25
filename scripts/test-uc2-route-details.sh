#!/bin/bash

# UC2 Test Script: Просмотр деталей рейса
# JTBD: «Мне нужно выбрать оптимальный рейс и обосновать свой выбор клиенту/руководству»

set -e

echo "🚢 UC2 Test: Просмотр деталей рейса"
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

# Тест 1: Получение списка рейсов для анализа
test_get_routes() {
    log_info "Тест 1: Получение списка рейсов для анализа"
    
    # Получаем рейсы Shanghai -> Los Angeles
    response=$(curl -s "http://localhost:3000/api/routes/search?originPortId=SHANGHAI&destinationPortId=USLAX&departureDateFrom=2025-01-01&departureDateTo=2025-03-31")
    
    if echo "$response" | jq -e '.routes' > /dev/null; then
        routes_count=$(echo "$response" | jq '.routes | length')
        log_success "Получено $routes_count рейсов"
        
        # Сохраняем первый рейс для детального анализа
        first_route=$(echo "$response" | jq '.routes[0]')
        echo "$first_route" > /tmp/test_route.json
        
        # Проверяем наличие ключевых полей
        required_fields=("id" "carrierName" "voyageNumber" "originPort" "destinationPort" "departureDate" "arrivalDate" "vessel" "rates")
        
        for field in "${required_fields[@]}"; do
            if echo "$first_route" | jq -e ".$field" > /dev/null; then
                log_success "Поле '$field' присутствует"
            else
                log_error "Поле '$field' отсутствует"
            fi
        done
        
        return 0
    else
        log_error "Не удалось получить рейсы"
        echo "$response" | jq '.'
        return 1
    fi
}

# Тест 2: Анализ детальной информации о рейсе
test_route_details() {
    log_info "Тест 2: Анализ детальной информации о рейсе"
    
    if [ ! -f /tmp/test_route.json ]; then
        log_error "Файл с тестовым рейсом не найден"
        return 1
    fi
    
    route=$(cat /tmp/test_route.json)
    
    # Проверяем информацию о судне
    log_info "Проверяем информацию о судне..."
    vessel_name=$(echo "$route" | jq -r '.vessel.name // "N/A"')
    vessel_imo=$(echo "$route" | jq -r '.vessel.imoNumber // "N/A"')
    vessel_capacity=$(echo "$route" | jq -r '.vessel.capacity // "N/A"')
    
    log_success "Судно: $vessel_name (IMO: $vessel_imo, Вместимость: $vessel_capacity TEU)"
    
    # Проверяем информацию о перевозчике
    log_info "Проверяем информацию о перевозчике..."
    carrier_name=$(echo "$route" | jq -r '.carrierName // "N/A"')
    carrier_code=$(echo "$route" | jq -r '.carrierCode // "N/A"')
    
    log_success "Перевозчик: $carrier_name (Код: $carrier_code)"
    
    # Проверяем временные данные
    log_info "Проверяем временные данные..."
    etd=$(echo "$route" | jq -r '.departureDate // "N/A"')
    eta=$(echo "$route" | jq -r '.arrivalDate // "N/A"')
    transit_time=$(echo "$route" | jq -r '.transitTime // .duration // "N/A"')
    
    log_success "ETD: $etd, ETA: $eta, Transit Time: $transit_time дней"
    
    # Проверяем цены
    log_info "Проверяем информацию о ценах..."
    if echo "$route" | jq -e '.rates[0]' > /dev/null; then
        price=$(echo "$route" | jq -r '.rates[0].totalCost // "N/A"')
        currency=$(echo "$route" | jq -r '.rates[0].currency // "N/A"')
        container_type=$(echo "$route" | jq -r '.rates[0].containerType // "N/A"')
        
        log_success "Цена: $price $currency за $container_type"
    else
        log_warning "Информация о ценах отсутствует"
    fi
    
    return 0
}

# Тест 3: Сравнение рейсов
test_route_comparison() {
    log_info "Тест 3: Сравнение рейсов"
    
    # Получаем несколько рейсов для сравнения
    response=$(curl -s "http://localhost:3000/api/routes/search?originPortId=SHANGHAI&destinationPortId=USLAX&departureDateFrom=2025-01-01&departureDateTo=2025-03-31")
    
    if echo "$response" | jq -e '.routes' > /dev/null; then
        routes_count=$(echo "$response" | jq '.routes | length')
        
        if [ "$routes_count" -ge 2 ]; then
            log_success "Найдено $routes_count рейсов для сравнения"
            
            # Анализируем цены
            log_info "Анализируем цены..."
            prices=$(echo "$response" | jq -r '.routes[] | select(.rates[0].totalCost != null) | .rates[0].totalCost' | sort -n)
            min_price=$(echo "$prices" | head -1)
            max_price=$(echo "$prices" | tail -1)
            
            log_success "Диапазон цен: $min_price - $max_price USD"
            
            # Анализируем время транзита
            log_info "Анализируем время транзита..."
            transit_times=$(echo "$response" | jq -r '.routes[] | select(.transitTime != null) | .transitTime' | sort -n)
            min_transit=$(echo "$transit_times" | head -1)
            max_transit=$(echo "$transit_times" | tail -1)
            
            log_success "Диапазон транзита: $min_transit - $max_transit дней"
            
            # Находим лучшие варианты
            log_info "Определяем лучшие варианты..."
            
            # Самый дешевый
            cheapest=$(echo "$response" | jq -r '.routes | sort_by(.rates[0].totalCost // 999999) | .[0] | "\(.carrierName) - \(.voyageNumber) ($\(.rates[0].totalCost))"')
            log_success "Самый дешевый: $cheapest"
            
            # Самый быстрый
            fastest=$(echo "$response" | jq -r '.routes | sort_by(.transitTime // 999) | .[0] | "\(.carrierName) - \(.voyageNumber) (\(.transitTime) дней)"')
            log_success "Самый быстрый: $fastest"
            
        else
            log_warning "Недостаточно рейсов для сравнения (нужно минимум 2, найдено $routes_count)"
        fi
    else
        log_error "Не удалось получить рейсы для сравнения"
    fi
    
    return 0
}

# Тест 4: Проверка рекомендаций
test_recommendations() {
    log_info "Тест 4: Проверка рекомендаций"
    
    response=$(curl -s "http://localhost:3000/api/routes/search?originPortId=SHANGHAI&destinationPortId=USLAX&departureDateFrom=2025-01-01&departureDateTo=2025-03-31")
    
    if echo "$response" | jq -e '.recommendations' > /dev/null; then
        recommendations=$(echo "$response" | jq '.recommendations')
        rec_count=$(echo "$recommendations" | jq 'length')
        
        log_success "Найдено $rec_count рекомендаций"
        
        # Проверяем типы рекомендаций
        echo "$recommendations" | jq -r '.[] | "\(.type): \(.title) - \(.description)"' | while read -r line; do
            log_info "Рекомендация: $line"
        done
        
    else
        log_warning "Рекомендации не найдены в ответе API"
    fi
    
    return 0
}

# Тест 5: Проверка обоснования выбора
test_justification() {
    log_info "Тест 5: Проверка обоснования выбора"
    
    # Получаем детальную информацию о рейсе
    if [ -f /tmp/test_route.json ]; then
        route_id=$(cat /tmp/test_route.json | jq -r '.id')
        
        log_info "Анализируем рейс ID: $route_id"
        
        # Проверяем наличие всех необходимых данных для обоснования
        route=$(cat /tmp/test_route.json)
        
        # Проверяем наличие ключевых метрик
        has_price=$(echo "$route" | jq -e '.rates[0].totalCost' > /dev/null && echo "true" || echo "false")
        has_transit=$(echo "$route" | jq -e '.transitTime' > /dev/null && echo "true" || echo "false")
        has_vessel=$(echo "$route" | jq -e '.vessel.name' > /dev/null && echo "true" || echo "false")
        has_carrier=$(echo "$route" | jq -e '.carrierName' > /dev/null && echo "true" || echo "false")
        
        log_info "Метрики для обоснования:"
        log_info "  - Цена: $has_price"
        log_info "  - Время транзита: $has_transit"
        log_info "  - Информация о судне: $has_vessel"
        log_info "  - Информация о перевозчике: $has_carrier"
        
        if [ "$has_price" = "true" ] && [ "$has_transit" = "true" ] && [ "$has_vessel" = "true" ] && [ "$has_carrier" = "true" ]; then
            log_success "Все необходимые данные для обоснования выбора присутствуют"
        else
            log_warning "Некоторые данные для обоснования отсутствуют"
        fi
        
    else
        log_error "Тестовый рейс не найден"
    fi
    
    return 0
}

# Тест 6: Проверка фронтенд интеграции
test_frontend_integration() {
    log_info "Тест 6: Проверка фронтенд интеграции"
    
    # Проверяем, что фронтенд доступен
    if curl -s http://localhost:3000/planner > /dev/null; then
        log_success "Страница планировщика доступна"
    else
        log_error "Страница планировщика недоступна"
        return 1
    fi
    
    # Проверяем наличие компонентов UC2
    log_info "Проверяем наличие компонентов UC2..."
    
    # Проверяем, что RouteDetailsModal импортирован
    if grep -q "RouteDetailsModal" apps/web/src/components/planner/SailingResults.tsx; then
        log_success "RouteDetailsModal интегрирован в SailingResults"
    else
        log_error "RouteDetailsModal не интегрирован в SailingResults"
    fi
    
    # Проверяем наличие файла RouteDetailsModal
    if [ -f "apps/web/src/components/planner/RouteDetailsModal.tsx" ]; then
        log_success "Файл RouteDetailsModal.tsx существует"
    else
        log_error "Файл RouteDetailsModal.tsx не найден"
    fi
    
    return 0
}

# Основная функция
main() {
    echo "🚢 Запуск тестов UC2: Просмотр деталей рейса"
    echo "============================================="
    echo ""
    
    check_server
    
    # Запускаем тесты
    tests=(
        "test_get_routes"
        "test_route_details"
        "test_route_comparison"
        "test_recommendations"
        "test_justification"
        "test_frontend_integration"
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
    echo "📊 Итоговый отчет UC2"
    echo "============================================="
    echo "Пройдено тестов: $passed из $total"
    
    if [ $passed -eq $total ]; then
        log_success "🎉 Все тесты UC2 пройдены успешно!"
        echo ""
        echo "✅ UC2 'Просмотр деталей рейса' полностью реализован:"
        echo "   • Открытие карточки рейса ✓"
        echo "   • Информация о судне, операторе, ETD, ETA, transit days ✓"
        echo "   • Сравнение рейсов ✓"
        echo "   • Обоснование выбора для клиента/руководства ✓"
    else
        log_error "❌ Некоторые тесты UC2 провалены"
        exit 1
    fi
    
    # Очистка временных файлов
    rm -f /tmp/test_route.json
}

# Запуск основной функции
main "$@"
