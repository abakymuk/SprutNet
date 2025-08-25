import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  createTelemetryEvent, 
  getSessionId, 
  resetSessionId,
  generateSessionId,
  getContext,
  TELEMETRY_EVENTS 
} from '../telemetry/events';
import { 
  telemetryLogger,
  logSearchStarted,
  logSearchSuccess,
  logSearchError,
  logDeadlineOpened,
  logCacheHit,
  logApiRetry 
} from '../telemetry/logger';

// Мокаем console.log
const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('Telemetry Events System', () => {
  beforeEach(() => {
    consoleSpy.mockClear();
    resetSessionId();
  });

  describe('createTelemetryEvent', () => {
    it('should create a valid telemetry event', () => {
      const event = createTelemetryEvent('search_started', { test: 'data' });
      
      expect(event.event).toBe('search_started');
      expect(event.timestamp).toBeTypeOf('number');
      expect(event.sessionId).toBeTypeOf('string');
      expect(event.data).toEqual({ test: 'data' });
      expect(event.context).toBeDefined();
    });

    it('should include session ID', () => {
      const event = createTelemetryEvent('search_success');
      expect(event.sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
    });

    it('should include timestamp', () => {
      const before = Date.now();
      const event = createTelemetryEvent('search_error');
      const after = Date.now();
      
      expect(event.timestamp).toBeGreaterThanOrEqual(before);
      expect(event.timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('getSessionId', () => {
    it('should return consistent session ID', () => {
      const sessionId1 = getSessionId();
      const sessionId2 = getSessionId();
      
      expect(sessionId1).toBe(sessionId2);
    });

    it('should generate new session ID after reset', () => {
      const sessionId1 = getSessionId();
      resetSessionId();
      const sessionId2 = getSessionId();
      
      expect(sessionId1).not.toBe(sessionId2);
    });
  });

  describe('generateSessionId', () => {
    it('should generate unique session IDs', () => {
      const id1 = generateSessionId();
      const id2 = generateSessionId();
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^session_\d+_[a-z0-9]+$/);
    });
  });

  describe('getContext', () => {
    it('should return context object', () => {
      const context = getContext();
      expect(context).toBeDefined();
    });
  });

  describe('TELEMETRY_EVENTS', () => {
    it('should contain all required event types', () => {
      const requiredEvents = [
        'search_started',
        'search_success', 
        'search_error',
        'deadline_opened',
        'deadline_error',
        'cache_hit',
        'api_retry'
      ];
      
      requiredEvents.forEach(eventType => {
        expect(TELEMETRY_EVENTS).toHaveProperty(eventType.toUpperCase().replace(/-/g, '_'));
      });
    });
  });
});

describe('Telemetry Logger', () => {
  beforeEach(() => {
    consoleSpy.mockClear();
    telemetryLogger.clearEvents();
  });

  describe('telemetryLogger', () => {
    it('should log events', () => {
      const event = createTelemetryEvent('search_started', { test: 'data' });
      telemetryLogger.log(event);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TELEMETRY] search_started'),
        expect.objectContaining({
          event: 'search_started',
          data: { test: 'data' }
        })
      );
    });

    it('should store events in memory', () => {
      const event = createTelemetryEvent('search_success', { count: 5 });
      telemetryLogger.log(event);
      
      const events = telemetryLogger.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].event).toBe('search_success');
      expect(events[0].data).toEqual({ count: 5 });
    });

    it('should clear events', () => {
      telemetryLogger.logEvent('search_started');
      expect(telemetryLogger.getEvents()).toHaveLength(1);
      
      telemetryLogger.clearEvents();
      expect(telemetryLogger.getEvents()).toHaveLength(0);
    });

    it('should export events as JSON', () => {
      telemetryLogger.logEvent('search_started', { test: 'data' });
      const exportData = telemetryLogger.exportEvents();
      
      expect(exportData).toBeTypeOf('string');
      const parsed = JSON.parse(exportData);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].event).toBe('search_started');
    });
  });

  describe('Convenience functions', () => {
    it('should log search started', () => {
      logSearchStarted({
        originPort: 'CNSHA',
        destinationPort: 'NLRTM',
        departureDateFrom: '2024-01-01',
        departureDateTo: '2024-01-31'
      });
      
      const events = telemetryLogger.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].event).toBe('search_started');
      expect(events[0].data).toEqual({
        originPort: 'CNSHA',
        destinationPort: 'NLRTM',
        departureDateFrom: '2024-01-01',
        departureDateTo: '2024-01-31'
      });
    });

    it('should log search success', () => {
      logSearchSuccess(10, { dataSource: 'maersk' });
      
      const events = telemetryLogger.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].event).toBe('search_success');
      expect(events[0].data).toEqual({
        resultCount: 10,
        dataSource: 'maersk'
      });
    });

    it('should log search error', () => {
      logSearchError('API timeout', { endpoint: '/schedules' });
      
      const events = telemetryLogger.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].event).toBe('search_error');
      expect(events[0].data).toEqual({
        error: 'API timeout',
        endpoint: '/schedules'
      });
    });

    it('should log deadline opened', () => {
      logDeadlineOpened('sailing-123', { vesselImo: '1234567' });
      
      const events = telemetryLogger.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].event).toBe('deadline_opened');
      expect(events[0].data).toEqual({
        sailingId: 'sailing-123',
        vesselImo: '1234567'
      });
    });

    it('should log cache hit', () => {
      logCacheHit('/schedules', { latency: 5 });
      
      const events = telemetryLogger.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].event).toBe('cache_hit');
      expect(events[0].data).toEqual({
        endpoint: '/schedules',
        latency: 5
      });
    });

    it('should log API retry', () => {
      logApiRetry('/schedules', 2, { delay: 1000 });
      
      const events = telemetryLogger.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].event).toBe('api_retry');
      expect(events[0].data).toEqual({
        endpoint: '/schedules',
        attempt: 2,
        delay: 1000
      });
    });
  });

  describe('Memory management', () => {
    it('should limit memory usage', () => {
      // Добавляем больше событий чем MAX_EVENTS
      for (let i = 0; i < 1100; i++) {
        telemetryLogger.logEvent('search_started', { index: i });
      }
      
      const events = telemetryLogger.getEvents();
      expect(events.length).toBeLessThanOrEqual(1000);
      expect(events.length).toBeGreaterThan(0);
      expect(events[events.length - 1]!.data?.index).toBe(1099);
    });
  });
});
