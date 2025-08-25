-- ========================================
-- ADD TEST RESULTS TABLE
-- ========================================

-- Таблица для хранения результатов тестов API
CREATE TABLE IF NOT EXISTS test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_suite_name VARCHAR(100) NOT NULL,
    test_name VARCHAR(200) NOT NULL,
    endpoint VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER NOT NULL,
    success BOOLEAN NOT NULL,
    has_data BOOLEAN NOT NULL,
    error_message TEXT,
    test_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица для хранения сводок тестов
CREATE TABLE IF NOT EXISTS test_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id VARCHAR(100) UNIQUE NOT NULL,
    total_tests INTEGER NOT NULL,
    successful_tests INTEGER NOT NULL,
    failed_tests INTEGER NOT NULL,
    success_rate DECIMAL(5,2) NOT NULL,
    avg_response_time INTEGER NOT NULL,
    slow_requests INTEGER NOT NULL,
    test_suites JSONB NOT NULL,
    environment_info JSONB,
    duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_test_results_endpoint ON test_results(endpoint);
CREATE INDEX IF NOT EXISTS idx_test_results_success ON test_results(success);
CREATE INDEX IF NOT EXISTS idx_test_results_created_at ON test_results(created_at);
CREATE INDEX IF NOT EXISTS idx_test_results_suite_name ON test_results(test_suite_name);
CREATE INDEX IF NOT EXISTS idx_test_summaries_created_at ON test_summaries(created_at);
CREATE INDEX IF NOT EXISTS idx_test_summaries_success_rate ON test_summaries(success_rate);

-- RLS политики
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_summaries ENABLE ROW LEVEL SECURITY;

-- Политики для чтения (только для аутентифицированных пользователей)
CREATE POLICY "Allow authenticated read access to test results" ON test_results
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access to test summaries" ON test_summaries
    FOR SELECT TO authenticated USING (true);

-- Политики для записи (только для service role)
CREATE POLICY "Allow service role insert to test results" ON test_results
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role insert to test summaries" ON test_summaries
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Представление для статистики тестов
CREATE OR REPLACE VIEW test_stats AS
SELECT 
    DATE_TRUNC('day', created_at) as test_date,
    COUNT(*) as total_runs,
    AVG(success_rate) as avg_success_rate,
    AVG(avg_response_time) as avg_response_time,
    SUM(total_tests) as total_tests,
    SUM(successful_tests) as total_successful,
    SUM(failed_tests) as total_failed
FROM test_summaries
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY test_date DESC;

-- Представление для последних результатов тестов
CREATE OR REPLACE VIEW recent_test_results AS
SELECT 
    tr.test_suite_name,
    tr.test_name,
    tr.endpoint,
    tr.method,
    tr.status_code,
    tr.response_time_ms,
    tr.success,
    tr.created_at,
    ts.success_rate as run_success_rate
FROM test_results tr
JOIN test_summaries ts ON tr.created_at::date = ts.created_at::date
WHERE tr.created_at > NOW() - INTERVAL '7 days'
ORDER BY tr.created_at DESC;

-- Функция для очистки старых результатов тестов
CREATE OR REPLACE FUNCTION cleanup_old_test_results(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM test_results 
    WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    DELETE FROM test_summaries 
    WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
    
    RAISE NOTICE 'Cleaned up % old test results', deleted_count;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER trigger_update_test_results_updated_at
    BEFORE UPDATE ON test_results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_test_summaries_updated_at
    BEFORE UPDATE ON test_summaries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Сообщение об успешном создании
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'TEST RESULTS TABLES CREATED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '  - test_results';
    RAISE NOTICE '  - test_summaries';
    RAISE NOTICE 'Views created:';
    RAISE NOTICE '  - test_stats';
    RAISE NOTICE '  - recent_test_results';
    RAISE NOTICE 'Indexes created: 6';
    RAISE NOTICE 'Policies created: 6';
    RAISE NOTICE 'Functions created: 1';
    RAISE NOTICE 'Triggers created: 2';
    RAISE NOTICE '========================================';
END $$;
