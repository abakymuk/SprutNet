#!/bin/bash

# Script to check if all required secrets are set in GitHub repository
# Run this locally to verify secrets are configured

echo "🔍 Checking required secrets for SprutNet project..."

# List of required secrets
REQUIRED_SECRETS=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
  "MAERSK_API_KEY"
  "MAERSK_API_SECRET"
  "MAERSK_API_BASE_URL"
  "VERCEL_TOKEN"
  "VERCEL_ORG_ID"
  "VERCEL_PROJECT_ID"
)

echo "📋 Required secrets:"
for secret in "${REQUIRED_SECRETS[@]}"; do
  echo "  - $secret"
done

echo ""
echo "✅ To verify these secrets are set:"
echo "1. Go to https://github.com/abakymuk/SprutNet/settings/secrets/actions"
echo "2. Check that all secrets listed above are present"
echo "3. Ensure they have correct values"
echo ""
echo "🔧 To add missing secrets:"
echo "1. Go to Settings > Secrets and variables > Actions"
echo "2. Click 'New repository secret'"
echo "3. Add each missing secret with its value"
echo ""
echo "📝 Current .env values (for reference):"
if [ -f ".env" ]; then
  grep -E "^(NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY|SUPABASE_SERVICE_ROLE_KEY|MAERSK_API_KEY|MAERSK_API_SECRET|MAERSK_API_BASE_URL|VERCEL_TOKEN|VERCEL_ORG_ID|VERCEL_PROJECT_ID)=" .env | sed 's/=.*/=***/' || echo "  No .env file found or no matching variables"
else
  echo "  No .env file found"
fi
