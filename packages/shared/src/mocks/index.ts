/**
 * @sprutnet/shared/mocks - Моковые данные для SprutNet
 * 
 * Этот модуль содержит все моковые данные для разработки и тестирования:
 * - Порты: основные мировые порты
 * - Расписания: примеры рейсов между портами
 * - Дедлайны: примеры дедлайнов для грузовых операций
 */

// Экспортируем все моки
export * from './ports';
export * from './sailings';
export * from './deadlines';

// Re-export mock data
export { mockPorts, searchPorts, getPortById, getPortsByCountry } from './ports';
export { mockSailings, searchSailings, getSailingById, getSailingsByCarrier } from './sailings';
export { mockDeadlines, searchDeadlines, getDeadlineById, getDeadlinesBySailing, getDeadlinesByPort, getDeadlinesByType } from './deadlines';
