import { createClient } from '@supabase/supabase-js';

// Интерфейсы для работы с базой данных
export interface PerformanceMetricDB {
  id?: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number;
  data_size_bytes?: number;
  cache_hit?: boolean;
  retries?: number;
  error_message?: string;
  error_code?: string;
  user_agent?: string;
  ip_address?: string;
  session_id?: string;
  user_id?: string;
  api_provider?: string;
  endpoint_type?: string;
  created_at?: string;
}

export interface CacheMetricDB {
  id?: string;
  cache_key: string;
  endpoint: string;
  cache_type: string;
  hit: boolean;
  response_time_ms: number;
  data_size_bytes?: number;
  created_at?: string;
}

export class PerformanceMonitorDB {
  private supabase;
  private isConnected = false;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️ Supabase credentials not found. Performance monitoring will use in-memory storage.');
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.isConnected = true;
    console.log('✅ PerformanceMonitorDB connected to Supabase');
  }

  async recordMetric(metric: Omit<PerformanceMetricDB, 'id' | 'created_at'>): Promise<void> {
    if (!this.isConnected || !this.supabase) {
      console.warn('⚠️ PerformanceMonitorDB not connected. Metric not saved.');
      return;
    }

    try {
      const { error } = await this.supabase
        .from('performance_metrics')
        .insert({
          ...metric,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('❌ Error saving performance metric:', error);
      }
    } catch (error) {
      console.error('❌ Error recording performance metric:', error);
    }
  }

  async recordCacheMetric(metric: Omit<CacheMetricDB, 'id' | 'created_at'>): Promise<void> {
    if (!this.isConnected || !this.supabase) {
      console.warn('⚠️ PerformanceMonitorDB not connected. Cache metric not saved.');
      return;
    }

    try {
      const { error } = await this.supabase
        .from('api_cache')
        .insert({
          cache_key: metric.cache_key,
          endpoint: metric.endpoint,
          cache_type: metric.cache_type,
          hit: metric.hit,
          response_time_ms: metric.response_time_ms,
          data_size_bytes: metric.data_size_bytes,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('❌ Error saving cache metric:', error);
      }
    } catch (error) {
      console.error('❌ Error recording cache metric:', error);
    }
  }

  async getMetrics(timeWindow: number = 3600000): Promise<PerformanceMetricDB[]> {
    if (!this.isConnected || !this.supabase) {
      console.warn('⚠️ PerformanceMonitorDB not connected. Returning empty metrics.');
      return [];
    }

    try {
      const cutoffTime = new Date(Date.now() - timeWindow).toISOString();
      
      const { data, error } = await this.supabase
        .from('performance_metrics')
        .select('*')
        .gte('created_at', cutoffTime)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching performance metrics:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error getting performance metrics:', error);
      return [];
    }
  }

  async getEndpointStats(endpoint: string, timeWindow: number = 3600000): Promise<any> {
    const metrics = await this.getMetrics(timeWindow);
    const endpointMetrics = metrics.filter(m => m.endpoint === endpoint);

    if (endpointMetrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        successRate: 0,
        errorRate: 0,
        cacheHitRate: 0,
      };
    }

    const totalRequests = endpointMetrics.length;
    const successfulRequests = endpointMetrics.filter(m => m.status_code < 400).length;
    const cacheHits = endpointMetrics.filter(m => m.cache_hit === true).length;
    const averageResponseTime = endpointMetrics.reduce((sum, m) => sum + m.response_time_ms, 0) / totalRequests;

    return {
      totalRequests,
      averageResponseTime: Math.round(averageResponseTime),
      successRate: (successfulRequests / totalRequests) * 100,
      errorRate: ((totalRequests - successfulRequests) / totalRequests) * 100,
      cacheHitRate: cacheHits > 0 ? (cacheHits / totalRequests) * 100 : 0,
    };
  }

  async getOverallStats(timeWindow: number = 3600000): Promise<any> {
    const metrics = await this.getMetrics(timeWindow);

    if (metrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        successRate: 0,
        errorRate: 0,
        cacheHitRate: 0,
        uniqueEndpoints: 0,
      };
    }

    const totalRequests = metrics.length;
    const successfulRequests = metrics.filter(m => m.status_code < 400).length;
    const cacheHits = metrics.filter(m => m.cache_hit === true).length;
    const uniqueEndpoints = new Set(metrics.map(m => m.endpoint)).size;
    const averageResponseTime = metrics.reduce((sum, m) => sum + m.response_time_ms, 0) / totalRequests;

    return {
      totalRequests,
      averageResponseTime: Math.round(averageResponseTime),
      successRate: (successfulRequests / totalRequests) * 100,
      errorRate: ((totalRequests - successfulRequests) / totalRequests) * 100,
      cacheHitRate: cacheHits > 0 ? (cacheHits / totalRequests) * 100 : 0,
      uniqueEndpoints,
    };
  }

  async getEndpointsPerformance(timeWindow: number = 3600000): Promise<any[]> {
    const metrics = await this.getMetrics(timeWindow);
    const endpoints = new Set(metrics.map(m => m.endpoint));

    const performance = await Promise.all(
      Array.from(endpoints).map(async (endpoint) => {
        const stats = await this.getEndpointStats(endpoint, timeWindow);
        return {
          endpoint,
          ...stats,
        };
      })
    );

    return performance.sort((a, b) => b.totalRequests - a.totalRequests);
  }

  async getSlowestRequests(limit: number = 10): Promise<PerformanceMetricDB[]> {
    const metrics = await this.getMetrics();
    
    return metrics
      .sort((a, b) => b.response_time_ms - a.response_time_ms)
      .slice(0, limit);
  }

  async getFailedRequests(limit: number = 10): Promise<PerformanceMetricDB[]> {
    const metrics = await this.getMetrics();
    
    return metrics
      .filter(m => m.status_code >= 400)
      .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
      .slice(0, limit);
  }

  async getCachePerformance(timeWindow: number = 3600000): Promise<any> {
    if (!this.isConnected || !this.supabase) {
      return {
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        hitRate: 0,
        averageResponseTime: 0,
      };
    }

    try {
      const cutoffTime = new Date(Date.now() - timeWindow).toISOString();
      
      const { data, error } = await this.supabase
        .from('api_cache')
        .select('*')
        .gte('created_at', cutoffTime);

      if (error) {
        console.error('❌ Error fetching cache metrics:', error);
        return {
          totalRequests: 0,
          cacheHits: 0,
          cacheMisses: 0,
          hitRate: 0,
          averageResponseTime: 0,
        };
      }

      const cacheMetrics = data || [];
      const totalRequests = cacheMetrics.length;
      const cacheHits = cacheMetrics.filter(m => m.hit).length;
      const cacheMisses = totalRequests - cacheHits;
      const averageResponseTime = cacheMetrics.reduce((sum, m) => sum + m.response_time_ms, 0) / totalRequests;

      return {
        totalRequests,
        cacheHits,
        cacheMisses,
        hitRate: totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0,
        averageResponseTime: Math.round(averageResponseTime),
      };
    } catch (error) {
      console.error('❌ Error getting cache performance:', error);
      return {
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        hitRate: 0,
        averageResponseTime: 0,
      };
    }
  }

  async clearOldMetrics(daysToKeep: number = 30): Promise<void> {
    if (!this.isConnected || !this.supabase) {
      console.warn('⚠️ PerformanceMonitorDB not connected. Cannot clear old metrics.');
      return;
    }

    try {
      const cutoffTime = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000).toISOString();
      
      const { error } = await this.supabase
        .from('performance_metrics')
        .delete()
        .lt('created_at', cutoffTime);

      if (error) {
        console.error('❌ Error clearing old performance metrics:', error);
      } else {
        console.log(`✅ Cleared performance metrics older than ${daysToKeep} days`);
      }
    } catch (error) {
      console.error('❌ Error clearing old metrics:', error);
    }
  }

  async exportMetrics(): Promise<PerformanceMetricDB[]> {
    return await this.getMetrics(30 * 24 * 60 * 60 * 1000); // Last 30 days
  }
}

// Создаем глобальный экземпляр
export const performanceMonitorDB = new PerformanceMonitorDB();
