-- Supabase Schema для SprutNet Shipping Planner
-- Выполните этот скрипт в SQL Editor вашего Supabase проекта

-- Включение расширений
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Кэш результатов API
CREATE TABLE IF NOT EXISTS api_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL,
  params JSONB NOT NULL,
  response JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Индекс для быстрого поиска по endpoint и параметрам
CREATE INDEX IF NOT EXISTS idx_api_cache_endpoint_params ON api_cache(endpoint, params);
CREATE INDEX IF NOT EXISTS idx_api_cache_expires_at ON api_cache(expires_at);

-- Напоминания пользователей
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  sailing_id TEXT NOT NULL,
  deadline_type TEXT NOT NULL,
  deadline_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notify_before_hours INTEGER DEFAULT 24,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для reminders
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_deadline_date ON reminders(deadline_date);
CREATE INDEX IF NOT EXISTS idx_reminders_is_active ON reminders(is_active);

-- Избранные маршруты пользователей
CREATE TABLE IF NOT EXISTS favorite_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  pol TEXT NOT NULL,
  pod TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, pol, pod)
);

-- Индекс для избранных маршрутов
CREATE INDEX IF NOT EXISTS idx_favorite_routes_user_id ON favorite_routes(user_id);

-- История поисков
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  pol TEXT NOT NULL,
  pod TEXT NOT NULL,
  search_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индекс для истории поисков
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_date ON search_history(search_date);

-- RLS (Row Level Security) политики
ALTER TABLE api_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Политики для api_cache (публичный доступ для чтения)
CREATE POLICY "api_cache_select_policy" ON api_cache
  FOR SELECT USING (true);

CREATE POLICY "api_cache_insert_policy" ON api_cache
  FOR INSERT WITH CHECK (true);

-- Политики для reminders (только для авторизованных пользователей)
CREATE POLICY "reminders_select_policy" ON reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "reminders_insert_policy" ON reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reminders_update_policy" ON reminders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "reminders_delete_policy" ON reminders
  FOR DELETE USING (auth.uid() = user_id);

-- Политики для favorite_routes
CREATE POLICY "favorite_routes_select_policy" ON favorite_routes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "favorite_routes_insert_policy" ON favorite_routes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favorite_routes_delete_policy" ON favorite_routes
  FOR DELETE USING (auth.uid() = user_id);

-- Политики для search_history
CREATE POLICY "search_history_select_policy" ON search_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "search_history_insert_policy" ON search_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Функция для очистки устаревшего кэша
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM api_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Создание cron job для автоматической очистки кэша (если доступно)
-- SELECT cron.schedule('cleanup-cache', '0 2 * * *', 'SELECT cleanup_expired_cache();');

-- Комментарии к таблицам
COMMENT ON TABLE api_cache IS 'Кэш результатов API для снижения нагрузки на внешние сервисы';
COMMENT ON TABLE reminders IS 'Напоминания пользователей о дедлайнах';
COMMENT ON TABLE favorite_routes IS 'Избранные маршруты пользователей';
COMMENT ON TABLE search_history IS 'История поисков пользователей';
