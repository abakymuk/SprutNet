#!/bin/bash

# Скрипт для добавления GitHub Secrets
# Использование: ./scripts/setup-github-secrets.sh

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Настройка GitHub Secrets для SprutNet${NC}"
echo "=================================="

# Проверка наличия gh CLI
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) не установлен${NC}"
    echo "Установите GitHub CLI: https://cli.github.com/"
    exit 1
fi

# Проверка аутентификации
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Не авторизован в GitHub CLI${NC}"
    echo "Выполните: gh auth login"
    exit 1
fi

# Получение репозитория
REPO="abakymuk/SprutNet"
echo -e "${YELLOW}📦 Репозиторий: $REPO${NC}"

# Секреты для добавления
declare -A secrets=(
    ["NEXT_PUBLIC_SUPABASE_URL"]="https://kzbtwgpedbojxnfiprsw.supabase.co"
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY"]="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6YnR3Z3BlZGJvanhuZmlwcnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NjcwMTYsImV4cCI6MjA3MTU0MzAxNn0.l3Oic3OTo0_Fus6NBYIUuuzL5vhCWGI5dol8AerrMzo"
    ["SUPABASE_SERVICE_ROLE_KEY"]="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6YnR3Z3BlZGJvanhuZmlwcnN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk2NzAxNiwiZXhwIjoyMDcxNTQzMDE2fQ.OP238r6fmI8NHNc4IujFu3BhWgiUGXw_12VTW1pMMO4"
    ["MAERSK_API_KEY"]="IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd"
    ["MAERSK_API_SECRET"]="CnIcg3YgUUtSp8a3"
    ["MAERSK_API_BASE_URL"]="https://api.maersk.com"
)

# Секреты, которые нужно добавить вручную
declare -A manual_secrets=(
    ["VERCEL_TOKEN"]="Получите из https://vercel.com/account/tokens"
    ["VERCEL_ORG_ID"]="Получите из настроек проекта Vercel"
    ["VERCEL_PROJECT_ID"]="Получите из настроек проекта Vercel"
)

echo -e "${YELLOW}🔐 Добавление автоматических секретов...${NC}"

# Добавление автоматических секретов
for secret_name in "${!secrets[@]}"; do
    secret_value="${secrets[$secret_name]}"
    
    echo -e "${YELLOW}📝 Добавление: $secret_name${NC}"
    
    if gh secret set "$secret_name" --repo "$REPO" --body "$secret_value"; then
        echo -e "${GREEN}✅ $secret_name добавлен${NC}"
    else
        echo -e "${RED}❌ Ошибка при добавлении $secret_name${NC}"
    fi
done

echo ""
echo -e "${YELLOW}🔐 Секреты для ручного добавления:${NC}"
echo "=================================="

# Вывод секретов для ручного добавления
for secret_name in "${!manual_secrets[@]}"; do
    secret_description="${manual_secrets[$secret_name]}"
    echo -e "${YELLOW}$secret_name:${NC} $secret_description"
done

echo ""
echo -e "${GREEN}✅ Настройка завершена!${NC}"
echo ""
echo -e "${YELLOW}📋 Следующие шаги:${NC}"
echo "1. Добавьте Vercel секреты вручную через GitHub UI"
echo "2. Создайте проект в Vercel"
echo "3. Проверьте CI/CD pipeline"
echo ""
echo -e "${YELLOW}🔗 Полезные ссылки:${NC}"
echo "- GitHub Secrets: https://github.com/$REPO/settings/secrets/actions"
echo "- Vercel Dashboard: https://vercel.com/dashboard"
echo "- CI/CD Setup Guide: .github/CICD_SETUP.md"
