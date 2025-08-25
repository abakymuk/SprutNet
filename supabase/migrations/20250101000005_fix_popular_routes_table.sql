-- Простое исправление popular_routes
-- Удаляем таблицу и создаем заново

-- Удаляем существующую таблицу popular_routes
DROP TABLE IF EXISTS popular_routes CASCADE;

-- Создаем таблицу заново
CREATE TABLE popular_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    origin_port_id VARCHAR(10) NOT NULL,
    destination_port_id VARCHAR(10) NOT NULL,
    origin_port_name VARCHAR(100),
    destination_port_name VARCHAR(100),
    search_count INTEGER DEFAULT 0,
    last_searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT popular_routes_unique UNIQUE (origin_port_id, destination_port_id)
);

-- Создаем индексы
CREATE INDEX idx_popular_routes_search_count ON popular_routes(search_count DESC);
CREATE INDEX idx_popular_routes_priority ON popular_routes(priority DESC);
CREATE INDEX idx_popular_routes_active ON popular_routes(is_active);

-- Вставляем данные
INSERT INTO popular_routes (origin_port_id, destination_port_id, origin_port_name, destination_port_name, priority, search_count) VALUES
('CNSHA', 'USLAX', 'Shanghai', 'Los Angeles', 100, 0),
('CNSHA', 'USNYC', 'Shanghai', 'New York', 95, 0),
('SGSIN', 'USLAX', 'Singapore', 'Los Angeles', 90, 0),
('SGSIN', 'USNYC', 'Singapore', 'New York', 85, 0),
('NLRTM', 'USLAX', 'Rotterdam', 'Los Angeles', 80, 0),
('NLRTM', 'USNYC', 'Rotterdam', 'New York', 75, 0),
('DEHAM', 'USLAX', 'Hamburg', 'Los Angeles', 70, 0),
('DEHAM', 'USNYC', 'Hamburg', 'New York', 65, 0),
('USLAX', 'CNSHA', 'Los Angeles', 'Shanghai', 60, 0),
('USNYC', 'CNSHA', 'New York', 'Shanghai', 55, 0),
('USLAX', 'SGSIN', 'Los Angeles', 'Singapore', 50, 0),
('USNYC', 'SGSIN', 'New York', 'Singapore', 45, 0),
('USLAX', 'NLRTM', 'Los Angeles', 'Rotterdam', 40, 0),
('USNYC', 'NLRTM', 'New York', 'Rotterdam', 35, 0),
('USLAX', 'DEHAM', 'Los Angeles', 'Hamburg', 30, 0),
('USNYC', 'DEHAM', 'New York', 'Hamburg', 25, 0);

-- Включаем RLS
ALTER TABLE popular_routes ENABLE ROW LEVEL SECURITY;

-- Создаем политики
CREATE POLICY "Allow read access to popular routes" ON popular_routes FOR SELECT USING (TRUE);
CREATE POLICY "Allow insert access to popular routes" ON popular_routes FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow update access to popular routes" ON popular_routes FOR UPDATE USING (TRUE);
