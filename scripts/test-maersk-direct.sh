#!/bin/bash

# Direct Maersk API Test
# Прямое тестирование Maersk API

echo "🚢 Direct Maersk API Test"
echo "========================="
echo ""

# Проверяем переменные окружения
echo "📋 Проверка переменных окружения:"
echo "FEATURE_MAERSK: $(grep FEATURE_MAERSK apps/web/.env.local | cut -d'=' -f2)"
echo "FEATURE_REAL_DATA_ONLY: $(grep FEATURE_REAL_DATA_ONLY apps/web/.env.local | cut -d'=' -f2 || echo 'not set')"
echo ""

# Тест 1: Проверка Maersk Health
echo "🔍 Тест 1: Maersk Health API"
response=$(curl -s "http://localhost:3000/api/maersk-health")
echo "$response" | jq '.'
echo ""

# Тест 2: Проверка поиска портов
echo "🔍 Тест 2: Поиск портов"
response=$(curl -s "http://localhost:3000/api/ports/search?query=Shanghai&limit=3")
echo "$response" | jq '.ports | length'
echo ""

# Тест 3: Проверка поиска маршрутов с принудительным режимом реальных данных
echo "🔍 Тест 3: Поиск маршрутов (режим реальных данных)"
response=$(curl -s "http://localhost:3000/api/routes/search?originPortId=CNSHA&destinationPortId=USLAX&limit=1")
echo "$response" | jq '.success, .source, .error // "no error"'
echo ""

# Тест 4: Проверка логов (если доступны)
echo "🔍 Тест 4: Проверка логов сервера"
echo "Проверьте консоль сервера на наличие ошибок Maersk API"
echo ""

echo "📊 Результаты тестирования:"
echo "Если source=fallback, то Maersk API недоступен"
echo "Если source=maersk, то API работает"
echo "Если есть error, то API возвращает ошибку"
