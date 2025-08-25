#!/bin/bash

# Test Fixed Maersk API
# Тест исправленного Maersk API

echo "🚢 Testing Fixed Maersk API"
echo "==========================="
echo ""

# Проверяем, что сервер запущен
echo "🔍 Проверяем сервер..."
if curl -s http://localhost:3000/api/maersk-health > /dev/null; then
    echo "✅ Сервер запущен"
else
    echo "❌ Сервер не запущен"
    exit 1
fi

echo ""

# Тест 1: Прямой запрос к Maersk API
echo "🔍 Тест 1: Прямой запрос к Maersk API"
CONSUMER_KEY=$(grep MAERSK_CONSUMER_KEY apps/web/.env.local | cut -d'=' -f2)

response=$(curl -s -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Consumer-Key: $CONSUMER_KEY" \
  -H "User-Agent: SprutNet/1.0" \
  "https://api.maersk.com/products/ocean-products?origin=CNSHA&destination=USLAX&from=2025-01-01&to=2025-12-31&limit=10")

count=$(echo "$response" | jq '. | length')
echo "Найдено рейсов: $count"

if [ "$count" -gt 0 ]; then
    echo "✅ Maersk API возвращает данные"
    echo "Первый рейс:"
    echo "$response" | jq '.[0] | {origin: .originPort.code, destination: .destinationPort.code, departureDate: .departureDate, arrivalDate: .arrivalDate}'
else
    echo "❌ Maersk API не возвращает данные"
    echo "Ответ:"
    echo "$response" | jq '.'
fi

echo ""

# Тест 2: Через наш API
echo "🔍 Тест 2: Через наш API"
echo "Очищаем кэш..."
curl -s -X POST "http://localhost:3000/api/route-cache?action=clear-all" > /dev/null

echo "Делаем запрос..."
api_response=$(curl -s "http://localhost:3000/api/routes/search?originPortId=CNSHA&destinationPortId=USLAX&limit=1")

success=$(echo "$api_response" | jq -r '.success')
source=$(echo "$api_response" | jq -r '.source // "unknown"')
total=$(echo "$api_response" | jq -r '.total // 0')
error=$(echo "$api_response" | jq -r '.error // "no error"')

echo "Результат:"
echo "  Success: $success"
echo "  Source: $source"
echo "  Total: $total"
echo "  Error: $error"

if [ "$success" = "true" ] && [ "$source" = "maersk" ]; then
    echo "✅ Наш API работает с Maersk данными!"
else
    echo "❌ Проблема с нашим API"
    echo "Полный ответ:"
    echo "$api_response" | jq '.'
fi

echo ""

# Тест 3: Проверка портов
echo "🔍 Тест 3: Проверка портов"
ports_response=$(curl -s "http://localhost:3000/api/ports/search?query=Shanghai&limit=5")

ports_success=$(echo "$ports_response" | jq -r '.success')
ports_count=$(echo "$ports_response" | jq -r '.ports | length')

echo "Результат поиска портов:"
echo "  Success: $ports_success"
echo "  Found ports: $ports_count"

if [ "$ports_count" -gt 0 ]; then
    echo "✅ Поиск портов работает"
    echo "Первый порт:"
    echo "$ports_response" | jq '.ports[0]'
else
    echo "⚠️ Порт Shanghai не найден (это нормально для Maersk API)"
fi

echo ""

echo "📊 Итоговый отчет:"
echo "=================="

if [ "$success" = "true" ] && [ "$source" = "maersk" ]; then
    echo "🎉 УСПЕХ! Maersk API работает корректно!"
    echo "✅ Пользователи теперь видят настоящие рейсы"
    echo "✅ Источник данных: Maersk API"
    echo "✅ Fallback данные больше не используются"
else
    echo "❌ Проблема все еще есть"
    echo "🔧 Нужна дополнительная диагностика"
fi
