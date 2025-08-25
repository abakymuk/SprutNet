#!/bin/bash

# Скрипт для тестирования работы с реальными данными от Maersk API
# Убедитесь, что сервер запущен: npm run dev

set -e

echo "🧪 ТЕСТИРОВАНИЕ РАБОТЫ С РЕАЛЬНЫМИ ДАННЫМИ"
echo "=========================================="
echo ""

# Проверяем, что сервер запущен
if ! curl -s http://localhost:3000/api/maersk-health > /dev/null; then
    echo "❌ Ошибка: Сервер не запущен. Запустите: npm run dev"
    exit 1
fi

echo "✅ Сервер запущен"
echo ""

# Тест 1: Проверка здоровья Maersk API
echo "🔍 Тест 1: Проверка здоровья Maersk API"
echo "----------------------------------------"
curl -s "http://localhost:3000/api/maersk-health" | jq .
echo ""

# Тест 2: Поиск портов (реальные данные)
echo "🔍 Тест 2: Поиск портов (реальные данные)"
echo "------------------------------------------"
echo "Поиск портов с названием 'Shanghai':"
curl -s "http://localhost:3000/api/ports/search?q=Shanghai&limit=5" | jq .
echo ""

# Тест 3: Информация о судне (реальные данные)
echo "🚢 Тест 3: Информация о судне (реальные данные)"
echo "-----------------------------------------------"
echo "Поиск судна с IMO 1234567:"
curl -s "http://localhost:3000/api/vessels/1234567" | jq .
echo ""

# Тест 4: Поиск расписаний (реальные данные)
echo "📅 Тест 4: Поиск расписаний (реальные данные)"
echo "---------------------------------------------"
echo "Поиск расписаний Shanghai -> Los Angeles:"
curl -s "http://localhost:3000/api/schedules?originPortId=CNSHA&destinationPortId=USLAX&departureDateFrom=2024-12-01&departureDateTo=2024-12-31&resultCount=5" | jq .
echo ""

# Тест 5: Статистика кэша
echo "💾 Тест 5: Статистика кэша"
echo "-------------------------"
curl -s "http://localhost:3000/api/route-cache?action=stats" | jq .
echo ""

# Тест 6: Популярные маршруты
echo "⭐ Тест 6: Популярные маршруты"
echo "-----------------------------"
curl -s "http://localhost:3000/api/route-cache?action=popular" | jq .
echo ""

echo "✅ Тестирование завершено!"
echo ""
echo "📊 Результаты:"
echo "  • Если все тесты показывают 'source': 'maersk' - реальные данные работают"
echo "  • Если показывают 'source': 'error' - есть проблемы с API"
echo "  • Если показывают 'source': 'fallback' - используется fallback (не должно быть в режиме реальных данных)"
echo ""
echo "🔧 Для включения режима только реальных данных добавьте в .env.local:"
echo "   FEATURE_REAL_DATA_ONLY=true"
