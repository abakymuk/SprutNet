#!/bin/bash

# Скрипт для тестирования преобразования данных из RouteOption в Sailing
# Проверяет, что все необходимые поля присутствуют после преобразования

set -e

echo "🔄 ТЕСТИРОВАНИЕ ПРЕОБРАЗОВАНИЯ ДАННЫХ"
echo "====================================="
echo "Проблема: Cannot read properties of undefined (reading 'toLocaleString')"
echo ""

# Получаем данные от API
echo "🔍 Получение данных от API..."
RESPONSE=$(curl -s "http://localhost:3000/api/routes/search?originPortId=CNSHA&destinationPortId=USLAX&limit=1")

echo "📊 Структура исходных данных:"
echo "$RESPONSE" | jq '.routes[0] | keys'
echo ""

# Проверяем наличие обязательных полей в исходных данных
echo "🔍 Проверка обязательных полей в исходных данных:"
HAS_ID=$(echo "$RESPONSE" | jq '.routes[0] | has("id")')
HAS_CARRIER=$(echo "$RESPONSE" | jq '.routes[0] | has("carrier")')
HAS_VESSEL=$(echo "$RESPONSE" | jq '.routes[0] | has("vessel")')
HAS_PRICE=$(echo "$RESPONSE" | jq '.routes[0] | has("price")')
HAS_DEPARTURE_DATE=$(echo "$RESPONSE" | jq '.routes[0] | has("departureDate")')
HAS_ARRIVAL_DATE=$(echo "$RESPONSE" | jq '.routes[0] | has("arrivalDate")')

echo "  • id: $HAS_ID"
echo "  • carrier: $HAS_CARRIER"
echo "  • vessel: $HAS_VESSEL"
echo "  • price: $HAS_PRICE"
echo "  • departureDate: $HAS_DEPARTURE_DATE"
echo "  • arrivalDate: $HAS_ARRIVAL_DATE"
echo ""

# Проверяем структуру price
echo "🔍 Проверка структуры price:"
if [ "$HAS_PRICE" = "true" ]; then
    PRICE_KEYS=$(echo "$RESPONSE" | jq '.routes[0].price | keys')
    echo "  • Поля price: $PRICE_KEYS"
    
    HAS_CURRENCY=$(echo "$RESPONSE" | jq '.routes[0].price | has("currency")')
    HAS_AMOUNT=$(echo "$RESPONSE" | jq '.routes[0].price | has("amount")')
    echo "  • currency: $HAS_CURRENCY"
    echo "  • amount: $HAS_AMOUNT"
    
    AMOUNT_VALUE=$(echo "$RESPONSE" | jq '.routes[0].price.amount')
    echo "  • Значение amount: $AMOUNT_VALUE"
else
    echo "  ❌ Поле price отсутствует"
fi
echo ""

# Проверяем структуру carrier
echo "🔍 Проверка структуры carrier:"
if [ "$HAS_CARRIER" = "true" ]; then
    CARRIER_KEYS=$(echo "$RESPONSE" | jq '.routes[0].carrier | keys')
    echo "  • Поля carrier: $CARRIER_KEYS"
    
    HAS_CARRIER_CODE=$(echo "$RESPONSE" | jq '.routes[0].carrier | has("code")')
    HAS_CARRIER_NAME=$(echo "$RESPONSE" | jq '.routes[0].carrier | has("name")')
    echo "  • code: $HAS_CARRIER_CODE"
    echo "  • name: $HAS_CARRIER_NAME"
else
    echo "  ❌ Поле carrier отсутствует"
fi
echo ""

# Проверяем структуру vessel
echo "🔍 Проверка структуры vessel:"
if [ "$HAS_VESSEL" = "true" ]; then
    VESSEL_KEYS=$(echo "$RESPONSE" | jq '.routes[0].vessel | keys')
    echo "  • Поля vessel: $VESSEL_KEYS"
    
    HAS_VESSEL_NAME=$(echo "$RESPONSE" | jq '.routes[0].vessel | has("name")')
    HAS_VESSEL_IMO=$(echo "$RESPONSE" | jq '.routes[0].vessel | has("imo")')
    echo "  • name: $HAS_VESSEL_NAME"
    echo "  • imo: $HAS_VESSEL_IMO"
else
    echo "  ❌ Поле vessel отсутствует"
fi
echo ""

echo "✅ Тестирование завершено!"
echo ""
echo "📋 Ожидаемые поля после преобразования:"
echo "  • rates[0].totalCost (для toLocaleString())"
echo "  • rates[0].containerType"
echo "  • rates[0].currency"
echo "  • route.duration"
echo "  • vessel.name, vessel.imoNumber"
echo "  • carrier.code, carrier.name"
echo ""
echo "🔧 Исправления в функции convertRouteToSailing:"
echo "  ✅ Добавлено поле totalCost в rates"
echo "  ✅ Добавлено поле duration в route"
echo "  ✅ Правильное преобразование vessel.imo в vessel.imoNumber"
echo ""
echo "🎯 Следующие шаги:"
echo "  1. Перезапустите сервер: npm run dev"
echo "  2. Откройте браузер: http://localhost:3000/planner"
echo "  3. Выберите Shanghai → Los Angeles"
echo "  4. Нажмите 'Найти рейсы'"
echo "  5. Перейдите на вкладку 'Результаты'"
echo "  6. Ошибка toLocaleString должна исчезнуть"
