#!/bin/bash

# Скрипт для синхронизации с Supabase
# Автоматизирует процесс применения миграций и синхронизации

set -e

echo "🚀 Начинаем синхронизацию с Supabase..."

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

# Применяем миграции
echo "📦 Применяем миграции..."
echo "Введите пароль от базы данных Supabase:"
supabase db push

# Проверяем статус миграций
echo "📊 Проверяем статус миграций..."
supabase migration list

# Синхронизируем схему
echo "🔄 Синхронизируем схему..."
echo "Введите пароль от базы данных Supabase:"
supabase db pull

echo "✅ Синхронизация завершена успешно!"

# Показываем команды для мониторинга
echo ""
echo "📋 Полезные команды для мониторинга:"
echo "  • supabase migration list - список миграций"
echo "  • supabase db diff - показать различия"
echo "  • supabase db reset - сбросить базу данных (осторожно!)"
echo "  • supabase status - статус подключения"
echo ""
echo "🌐 Доступ к Supabase Dashboard:"
echo "  https://supabase.com/dashboard/project/kzbtwgpedbojxnfiprsw"
