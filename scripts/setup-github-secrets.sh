#!/opt/homebrew/bin/bash

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

# Секреты для добавления (совместимость с bash 3.2)
echo -e "${YELLOW}🔐 Добавление автоматических секретов...${NC}"

# Supabase Secrets
echo -e "${YELLOW}📝 Добавление: NEXT_PUBLIC_SUPABASE_URL${NC}"
if gh secret set "NEXT_PUBLIC_SUPABASE_URL" --repo "$REPO" --body "https://kzbtwgpedbojxnfiprsw.supabase.co"; then
    echo -e "${GREEN}✅ NEXT_PUBLIC_SUPABASE_URL добавлен${NC}"
else
    echo -e "${RED}❌ Ошибка при добавлении NEXT_PUBLIC_SUPABASE_URL${NC}"
fi

echo -e "${YELLOW}📝 Добавление: NEXT_PUBLIC_SUPABASE_ANON_KEY${NC}"
if gh secret set "NEXT_PUBLIC_SUPABASE_ANON_KEY" --repo "$REPO" --body "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6YnR3Z3BlZGJvanhuZmlwcnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NjcwMTYsImV4cCI6MjA3MTU0MzAxNn0.l3Oic3OTo0_Fus6NBYIUuuzL5vhCWGI5dol8AerrMzo"; then
    echo -e "${GREEN}✅ NEXT_PUBLIC_SUPABASE_ANON_KEY добавлен${NC}"
else
    echo -e "${RED}❌ Ошибка при добавлении NEXT_PUBLIC_SUPABASE_ANON_KEY${NC}"
fi

echo -e "${YELLOW}📝 Добавление: SUPABASE_SERVICE_ROLE_KEY${NC}"
if gh secret set "SUPABASE_SERVICE_ROLE_KEY" --repo "$REPO" --body "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6YnR3Z3BlZGJvanhuZmlwcnN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk2NzAxNiwiZXhwIjoyMDcxNTQzMDE2fQ.OP238r6fmI8NHNc4IujFu3BhWgiUGXw_12VTW1pMMO4"; then
    echo -e "${GREEN}✅ SUPABASE_SERVICE_ROLE_KEY добавлен${NC}"
else
    echo -e "${RED}❌ Ошибка при добавлении SUPABASE_SERVICE_ROLE_KEY${NC}"
fi

# Maersk API Secrets
echo -e "${YELLOW}📝 Добавление: MAERSK_API_KEY${NC}"
if gh secret set "MAERSK_API_KEY" --repo "$REPO" --body "IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd"; then
    echo -e "${GREEN}✅ MAERSK_API_KEY добавлен${NC}"
else
    echo -e "${RED}❌ Ошибка при добавлении MAERSK_API_KEY${NC}"
fi

echo -e "${YELLOW}📝 Добавление: MAERSK_API_SECRET${NC}"
if gh secret set "MAERSK_API_SECRET" --repo "$REPO" --body "CnIcg3YgUUtSp8a3"; then
    echo -e "${GREEN}✅ MAERSK_API_SECRET добавлен${NC}"
else
    echo -e "${RED}❌ Ошибка при добавлении MAERSK_API_SECRET${NC}"
fi

echo -e "${YELLOW}📝 Добавление: MAERSK_API_BASE_URL${NC}"
if gh secret set "MAERSK_API_BASE_URL" --repo "$REPO" --body "https://api.maersk.com"; then
    echo -e "${GREEN}✅ MAERSK_API_BASE_URL добавлен${NC}"
else
    echo -e "${RED}❌ Ошибка при добавлении MAERSK_API_BASE_URL${NC}"
fi

echo ""
echo -e "${YELLOW}🔐 Секреты для ручного добавления:${NC}"
echo "=================================="
echo -e "${YELLOW}VERCEL_TOKEN:${NC} Получите из https://vercel.com/account/tokens"
echo -e "${YELLOW}VERCEL_ORG_ID:${NC} Получите из настроек проекта Vercel"
echo -e "${YELLOW}VERCEL_PROJECT_ID:${NC} Получите из настроек проекта Vercel"

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
