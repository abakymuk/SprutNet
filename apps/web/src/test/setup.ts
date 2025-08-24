import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Мокаем fetch глобально
global.fetch = vi.fn();

// Мокаем console.log для тестов
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
};
