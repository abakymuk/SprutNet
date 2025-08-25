#!/bin/bash

# Скрипт для полной очистки базы данных и применения миграций
# ВНИМАНИЕ: Этот скрипт удалит ВСЕ данные из базы данных!

set -e

echo "🧹 НАЧИНАЕМ ПОЛНУЮ ОЧИСТКУ БАЗЫ ДАННЫХ SUPABASE"
echo "⚠️  ВНИМАНИЕ: Все данные будут удалены!"
echo ""

read -p "Вы уверены, что хотите продолжить? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Операция отменена"
    exit 1
fi

echo "🚀 Начинаем процесс очистки..."

# Проверяем, что мы в корневой директории проекта
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Ошибка: supabase/config.toml не найден. Убедитесь, что вы находитесь в корневой директории проекта."
    exit 1
fi

# Проверяем, что Supabase CLI установлен
if ! command -v supabase &> /dev/null; then
    echo "❌ Ошибка: Supabase CLI не установлен. Установите его: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI найден: $(supabase --version)"

# Проверяем статус подключения
echo "🔗 Проверяем подключение к Supabase..."
if ! supabase status &> /dev/null; then
    echo "⚠️  Проект не подключен. Выполняем подключение..."
    echo "Введите пароль от базы данных Supabase:"
    supabase link --project-ref kzbtwgpedbojxnfiprsw
fi

# Очищаем историю миграций
echo "🗑️  Очищаем историю миграций..."
echo "Введите пароль от базы данных Supabase:"
supabase migration repair --status reverted 20250101000000
supabase migration repair --status reverted 20250101000001
supabase migration repair --status reverted 20250101000002
supabase migration repair --status reverted 20250101000003
supabase migration repair --status reverted 20250101000004
supabase migration repair --status reverted 20250101000005
supabase migration repair --status reverted 20250101000006

# Применяем миграцию очистки
echo "🧹 Применяем миграцию очистки..."
echo "Введите пароль от базы данных Supabase:"
supabase db push --include-all

# Проверяем статус миграций
echo "📊 Проверяем статус миграций..."
supabase migration list

echo "✅ Очистка и миграции завершены успешно!"

# Показываем команды для мониторинга
echo ""
echo "📋 Полезные команды для мониторинга:"
echo "  • supabase migration list - список миграций"
echo "  • supabase db diff - показать различия"
echo "  • supabase status - статус подключения"
echo ""
echo "🌐 Доступ к Supabase Dashboard:"
echo "  https://supabase.com/dashboard/project/kzbtwgpedbojxnfiprsw"
