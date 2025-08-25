#!/bin/bash

# Скрипт для тестирования UC1: Поиск рейса (Find Route)
# JTBD: «Мне нужно быстро понять, каким рейсом я могу отправить груз»

set -e

echo "🚢 ТЕСТИРОВАНИЕ UC1: ПОИСК РЕЙСА (FIND ROUTE)"
echo "============================================="
echo "JTBD: «Мне нужно быстро понять, каким рейсом я могу отправить груз»"
echo ""

# Проверяем, что сервер запущен
if ! curl -s http://localhost:3000/api/maersk-health > /dev/null; then
    echo "❌ Ошибка: Сервер не запущен. Запустите: npm run dev"
    exit 1
fi

echo "✅ Сервер запущен"
echo ""

# Тест 1: Поиск рейсов Shanghai -> Los Angeles
echo "🔍 Тест 1: Поиск рейсов Shanghai -> Los Angeles"
echo "------------------------------------------------"
echo "Поиск рейсов с рекомендациями:"
curl -s "http://localhost:3000/api/routes/search?originPortId=CNSHA&destinationPortId=USLAX&departureDateFrom=2024-12-01&departureDateTo=2024-12-31&limit=5" | jq .
echo ""

# Тест 2: Поиск рейсов New York -> Rotterdam
echo "🔍 Тест 2: Поиск рейсов New York -> Rotterdam"
echo "---------------------------------------------"
echo "Поиск рейсов с рекомендациями:"
curl -s "http://localhost:3000/api/routes/search?originPortId=USNYC&destinationPortId=NLRTM&departureDateFrom=2024-12-01&departureDateTo=2024-12-31&limit=5" | jq .
echo ""

# Тест 3: Поиск рейсов Singapore -> Hamburg
echo "🔍 Тест 3: Поиск рейсов Singapore -> Hamburg"
echo "--------------------------------------------"
echo "Поиск рейсов с рекомендациями:"
curl -s "http://localhost:3000/api/routes/search?originPortId=SGSIN&destinationPortId=DEHAM&departureDateFrom=2024-12-01&departureDateTo=2024-12-31&limit=5" | jq .
echo ""

# Тест 4: POST запрос с JSON body
echo "🔍 Тест 4: POST запрос с JSON body"
echo "---------------------------------"
echo "Поиск рейсов через POST:"
curl -s -X POST "http://localhost:3000/api/routes/search" \
  -H "Content-Type: application/json" \
  -d '{
    "originPortId": "CNSHA",
    "destinationPortId": "USLAX",
    "departureDateFrom": "2024-12-01",
    "departureDateTo": "2024-12-31",
    "limit": 3
  }' | jq .
echo ""

# Тест 5: Проверка рекомендаций
echo "🔍 Тест 5: Проверка рекомендаций"
echo "--------------------------------"
echo "Проверяем структуру рекомендаций:"
RESPONSE=$(curl -s "http://localhost:3000/api/routes/search?originPortId=CNSHA&destinationPortId=USLAX&departureDateFrom=2024-12-01&departureDateTo=2024-12-31&limit=1")

echo "Рекомендации в ответе:"
echo "$RESPONSE" | jq '.recommendations'
echo ""

# Тест 6: Проверка валидации
echo "🔍 Тест 6: Проверка валидации"
echo "-----------------------------"
echo "Тест без обязательных параметров:"
curl -s "http://localhost:3000/api/routes/search" | jq .
echo ""

echo "Тест только с originPortId:"
curl -s "http://localhost:3000/api/routes/search?originPortId=CNSHA" | jq .
echo ""

# Тест 7: Проверка производительности
echo "🔍 Тест 7: Проверка производительности"
echo "-------------------------------------"
echo "Измеряем время ответа:"
time curl -s "http://localhost:3000/api/routes/search?originPortId=CNSHA&destinationPortId=USLAX&departureDateFrom=2024-12-01&departureDateTo=2024-12-31&limit=1" > /dev/null
echo ""

echo "✅ Тестирование UC1 завершено!"
echo ""
echo "📊 Результаты анализа:"
echo "  • Если 'source': 'maersk' - используются реальные данные"
echo "  • Если 'source': 'fallback' - используются fallback данные"
echo "  • Если 'source': 'cache' - данные получены из кэша"
echo "  • Если 'source': 'error' - есть проблемы с API"
echo ""
echo "🎯 Проверьте рекомендации:"
echo "  • 'earliest' - самый ранний рейс"
echo "  • 'shortest' - самый короткий рейс"
echo "  • 'balanced' - лучший по общему скору"
echo ""
echo "🔧 Для включения режима только реальных данных добавьте в .env.local:"
echo "   FEATURE_REAL_DATA_ONLY=true"
