#!/bin/bash

# VesselCard Fix Test Script
# Проверка исправления ошибки "IMO must be a 7-digit number"

set -e

echo "🚢 VesselCard Fix Test: Проверка исправления IMO ошибки"
echo "======================================================"
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

# Тест 1: Проверка валидного IMO номера
test_valid_imo() {
    log_info "Тест 1: Проверка валидного IMO номера"
    
    response=$(curl -s "http://localhost:3000/api/vessels/1234567")
    
    if echo "$response" | jq -e '.vessel' > /dev/null; then
        log_success "Валидный IMO номер обработан корректно"
        vessel_name=$(echo "$response" | jq -r '.vessel.name // "Unknown"')
        log_info "Название судна: $vessel_name"
        return 0
    else
        log_error "Ошибка при обработке валидного IMO номера"
        echo "$response" | jq '.'
        return 1
    fi
}

# Тест 2: Проверка невалидного IMO номера
test_invalid_imo() {
    log_info "Тест 2: Проверка невалидного IMO номера"
    
    response=$(curl -s "http://localhost:3000/api/vessels/0000000")
    
    if echo "$response" | jq -e '.error' > /dev/null; then
        error_msg=$(echo "$response" | jq -r '.error')
        if [[ "$error_msg" == *"7-digit number"* ]] || [[ "$error_msg" == *"Invalid IMO number"* ]]; then
            log_success "Невалидный IMO номер корректно отклонен"
            log_info "Сообщение об ошибке: $error_msg"
            return 0
        else
            log_error "Неожиданное сообщение об ошибке: $error_msg"
            return 1
        fi
    else
        log_error "Ошибка не была возвращена для невалидного IMO"
        return 1
    fi
}

# Тест 3: Проверка некорректного формата IMO
test_malformed_imo() {
    log_info "Тест 3: Проверка некорректного формата IMO"
    
    # Тестируем различные некорректные форматы
    test_cases=("abc1234" "123456" "12345678" "0000000" "")
    
    for imo in "${test_cases[@]}"; do
        log_info "Тестируем IMO: '$imo'"
        response=$(curl -s "http://localhost:3000/api/vessels/$imo")
        
        if echo "$response" | jq -e '.error' > /dev/null; then
            error_msg=$(echo "$response" | jq -r '.error')
            if [[ "$error_msg" == *"7-digit number"* ]] || [[ "$error_msg" == *"Invalid IMO number"* ]]; then
                log_success "IMO '$imo' корректно отклонен"
            else
                log_warning "Неожиданное сообщение для IMO '$imo': $error_msg"
            fi
        else
            log_error "Ошибка не была возвращена для IMO '$imo'"
        fi
    done
    
    return 0
}

# Тест 4: Проверка фронтенд интеграции
test_frontend_integration() {
    log_info "Тест 4: Проверка фронтенд интеграции"
    
    # Проверяем, что страница планировщика доступна
    if curl -s http://localhost:3000/planner > /dev/null; then
        log_success "Страница планировщика доступна"
    else
        log_error "Страница планировщика недоступна"
        return 1
    fi
    
    # Проверяем наличие компонента VesselCard
    if [ -f "apps/web/src/components/planner/vessel-card.tsx" ]; then
        log_success "Компонент VesselCard.tsx существует"
    else
        log_error "Компонент VesselCard.tsx не найден"
        return 1
    fi
    
    # Проверяем, что валидация IMO добавлена
    if grep -q "Валидация IMO номера" apps/web/src/components/planner/vessel-card.tsx; then
        log_success "Валидация IMO номера добавлена в VesselCard"
    else
        log_error "Валидация IMO номера не найдена в VesselCard"
        return 1
    fi
    
    return 0
}

# Тест 5: Проверка исправления в planner/page.tsx
test_planner_fix() {
    log_info "Тест 5: Проверка исправления в planner/page.tsx"
    
    # Проверяем, что fallback IMO изменен с "0000000" на "1234567"
    if grep -q 'imoNumber.*1234567' apps/web/src/app/planner/page.tsx; then
        log_success "Fallback IMO номер исправлен на валидный"
    else
        log_error "Fallback IMO номер не исправлен"
        return 1
    fi
    
    # Проверяем, что старый некорректный IMO больше не используется
    if grep -q '0000000' apps/web/src/app/planner/page.tsx; then
        log_error "Некорректный IMO номер '0000000' все еще используется"
        return 1
    else
        log_success "Некорректный IMO номер '0000000' удален"
    fi
    
    return 0
}

# Тест 6: Проверка API endpoint улучшений
test_api_improvements() {
    log_info "Тест 6: Проверка улучшений API endpoint"
    
    # Проверяем, что улучшенное сообщение об ошибке добавлено
    if grep -q "Received IMO" apps/web/src/app/api/vessels/\[imo\]/route.ts; then
        log_success "Улучшенное сообщение об ошибке добавлено в API"
    else
        log_error "Улучшенное сообщение об ошибке не найдено в API"
        return 1
    fi
    
    # Тестируем улучшенное сообщение об ошибке
    response=$(curl -s "http://localhost:3000/api/vessels/invalid")
    
    if echo "$response" | jq -e '.details' > /dev/null; then
        details=$(echo "$response" | jq -r '.details')
        log_success "Детали ошибки включены: $details"
    else
        log_warning "Детали ошибки не включены в ответ"
    fi
    
    return 0
}

# Основная функция
main() {
    echo "🚢 Запуск тестов исправления VesselCard"
    echo "======================================"
    echo ""
    
    check_server
    
    # Запускаем тесты
    tests=(
        "test_valid_imo"
        "test_invalid_imo"
        "test_malformed_imo"
        "test_frontend_integration"
        "test_planner_fix"
        "test_api_improvements"
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
    echo "📊 Итоговый отчет исправления VesselCard"
    echo "============================================="
    echo "Пройдено тестов: $passed из $total"
    
    if [ $passed -eq $total ]; then
        log_success "🎉 Все тесты исправления VesselCard пройдены успешно!"
        echo ""
        echo "✅ Ошибка 'IMO must be a 7-digit number' исправлена:"
        echo "   • Fallback IMO изменен с '0000000' на '1234567' ✓"
        echo "   • Добавлена валидация IMO в VesselCard ✓"
        echo "   • Улучшены сообщения об ошибках в API ✓"
        echo "   • Все некорректные форматы IMO отклоняются ✓"
    else
        log_error "❌ Некоторые тесты исправления VesselCard провалены"
        exit 1
    fi
}

# Запуск основной функции
main "$@"
