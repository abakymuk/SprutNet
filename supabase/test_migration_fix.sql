-- Тестовый скрипт для проверки исправления синтаксиса
-- Проверяем, что исправленный синтаксис работает

-- Создаем тестовую таблицу с правильным синтаксисом
CREATE TABLE IF NOT EXISTS test_user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    favorite_type VARCHAR(50) NOT NULL,
    favorite_data JSONB NOT NULL,
    name VARCHAR(100),
    notes TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем правильный уникальный индекс
CREATE UNIQUE INDEX IF NOT EXISTS test_idx_user_favorites_unique 
ON test_user_favorites(user_id, favorite_type, (favorite_data->>'id'));

-- Проверяем, что индекс создался
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'test_user_favorites';

-- Удаляем тестовую таблицу
DROP TABLE IF EXISTS test_user_favorites CASCADE;

-- Сообщение об успехе
DO $$
BEGIN
    RAISE NOTICE '✅ Синтаксис исправлен успешно!';
    RAISE NOTICE 'Теперь можно применять основную миграцию.';
END $$;
