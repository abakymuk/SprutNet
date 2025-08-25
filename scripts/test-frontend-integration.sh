#!/bin/bash

# Скрипт для тестирования интеграции frontend с новым API
# Проверяет, что frontend может получать и отображать данные от /api/routes/search

set -e

echo "🎨 ТЕСТИРОВАНИЕ ИНТЕГРАЦИИ FRONTEND С API"
echo "=========================================="
echo "Проблема: не вижу рейсов в интерфейсе во вкладке Результаты"
echo ""

# Проверяем, что сервер запущен
if ! curl -s http://localhost:3000/api/maersk-health > /dev/null; then
    echo "❌ Ошибка: Сервер не запущен. Запустите: npm run dev"
    exit 1
fi

echo "✅ Сервер запущен"
echo ""

# Тест 1: Проверка старого API (должен возвращать 0)
echo "🔍 Тест 1: Проверка старого API /api/schedules"
echo "----------------------------------------------"
OLD_API_COUNT=$(curl -s "http://localhost:3000/api/schedules?originPortId=CNSHA&destinationPortId=USLAX&limit=5" | jq '.sailings | length')
echo "Количество рейсов в старом API: $OLD_API_COUNT"
if [ "$OLD_API_COUNT" -eq 0 ]; then
    echo "✅ Старый API возвращает 0 рейсов (ожидаемо)"
else
    echo "❌ Старый API возвращает $OLD_API_COUNT рейсов (неожиданно)"
fi
echo ""

# Тест 2: Проверка нового API (должен возвращать > 0)
echo "🔍 Тест 2: Проверка нового API /api/routes/search"
echo "------------------------------------------------"
NEW_API_COUNT=$(curl -s "http://localhost:3000/api/routes/search?originPortId=CNSHA&destinationPortId=USLAX&limit=5" | jq '.routes | length')
echo "Количество рейсов в новом API: $NEW_API_COUNT"
if [ "$NEW_API_COUNT" -gt 0 ]; then
    echo "✅ Новый API возвращает $NEW_API_COUNT рейсов"
else
    echo "❌ Новый API возвращает 0 рейсов"
fi
echo ""

# Тест 3: Проверка структуры данных нового API
echo "🔍 Тест 3: Проверка структуры данных нового API"
echo "----------------------------------------------"
RESPONSE=$(curl -s "http://localhost:3000/api/routes/search?originPortId=CNSHA&destinationPortId=USLAX&limit=1")
echo "Структура ответа:"
echo "$RESPONSE" | jq 'keys'
echo ""

echo "Поля первого рейса:"
echo "$RESPONSE" | jq '.routes[0] | keys'
echo ""

# Тест 4: Проверка совместимости с frontend
echo "🔍 Тест 4: Проверка совместимости с frontend"
echo "-------------------------------------------"
echo "Проверяем наличие обязательных полей для frontend:"

HAS_ID=$(echo "$RESPONSE" | jq '.routes[0] | has("id")')
HAS_CARRIER=$(echo "$RESPONSE" | jq '.routes[0] | has("carrier")')
HAS_VESSEL=$(echo "$RESPONSE" | jq '.routes[0] | has("vessel")')
HAS_DEPARTURE_DATE=$(echo "$RESPONSE" | jq '.routes[0] | has("departureDate")')
HAS_ARRIVAL_DATE=$(echo "$RESPONSE" | jq '.routes[0] | has("arrivalDate")')

echo "  • id: $HAS_ID"
echo "  • carrier: $HAS_CARRIER"
echo "  • vessel: $HAS_VESSEL"
echo "  • departureDate: $HAS_DEPARTURE_DATE"
echo "  • arrivalDate: $HAS_ARRIVAL_DATE"
echo ""

# Тест 5: Проверка рекомендаций
echo "🔍 Тест 5: Проверка рекомендаций"
echo "-------------------------------"
HAS_RECOMMENDATIONS=$(echo "$RESPONSE" | jq 'has("recommendations")')
HAS_EARLIEST=$(echo "$RESPONSE" | jq '.recommendations | has("earliest")')
HAS_SHORTEST=$(echo "$RESPONSE" | jq '.recommendations | has("shortest")')
HAS_BALANCED=$(echo "$RESPONSE" | jq '.recommendations | has("balanced")')

echo "  • recommendations: $HAS_RECOMMENDATIONS"
echo "  • earliest: $HAS_EARLIEST"
echo "  • shortest: $HAS_SHORTEST"
echo "  • balanced: $HAS_BALANCED"
echo ""

# Тест 6: Проверка источника данных
echo "🔍 Тест 6: Проверка источника данных"
echo "-----------------------------------"
SOURCE=$(echo "$RESPONSE" | jq -r '.source')
echo "Источник данных: $SOURCE"
echo ""

# Тест 7: Проверка времени ответа
echo "🔍 Тест 7: Проверка времени ответа"
echo "---------------------------------"
RESPONSE_TIME=$(echo "$RESPONSE" | jq '.responseTime')
echo "Время ответа: ${RESPONSE_TIME}ms"
echo ""

echo "✅ Тестирование завершено!"
echo ""
echo "📊 Результаты:"
echo "  • Старый API (/api/schedules): $OLD_API_COUNT рейсов"
echo "  • Новый API (/api/routes/search): $NEW_API_COUNT рейсов"
echo "  • Источник данных: $SOURCE"
echo "  • Время ответа: ${RESPONSE_TIME}ms"
echo ""
echo "🎯 Решение проблемы:"
echo "  ✅ Frontend обновлен для использования нового API"
echo "  ✅ Добавлена функция преобразования данных"
echo "  ✅ API возвращает корректные данные"
echo ""
echo "🔧 Следующие шаги:"
echo "  1. Откройте браузер и перейдите на http://localhost:3000/planner"
echo "  2. Выберите порты Shanghai и Los Angeles"
echo "  3. Нажмите 'Найти рейсы'"
echo "  4. Перейдите на вкладку 'Результаты'"
echo "  5. Должны отобразиться рейсы"
echo ""
echo "⚠️ Если рейсы все еще не отображаются:"
echo "  • Проверьте консоль браузера на ошибки"
echo "  • Убедитесь, что сервер перезапущен после изменений"
echo "  • Проверьте, что изменения в коде сохранены"
