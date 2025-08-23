import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// TODO: Добавить серверный клиент после настройки middleware
// export function createServerSupabaseClient() {
//   // Реализация будет добавлена позже
// }
