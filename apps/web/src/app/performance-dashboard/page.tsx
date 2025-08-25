"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Activity,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Database,
  Zap,
  BarChart3,
} from "lucide-react";

interface PerformanceStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  throughput: number;
}

interface CachePerformance {
  hitRate: number;
  missRate: number;
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
}

interface PerformanceData {
  overall: PerformanceStats;
  endpoints: Record<string, PerformanceStats>;
  cache: CachePerformance;
  timestamp: string;
}

export default function PerformanceDashboard() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeWindow, setTimeWindow] = useState("3600000"); // 1 hour default

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/performance?action=overview&timeWindow=${timeWindow}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch performance data");
      }
      const result = await response.json();
      setData(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeWindow]);

  const getStatusColor = (rate: number) => {
    if (rate >= 95) return "text-green-600";
    if (rate >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusIcon = (rate: number) => {
    if (rate >= 95) return <CheckCircle className="h-4 w-4" />;
    if (rate >= 80) return <AlertTriangle className="h-4 w-4" />;
    return <XCircle className="h-4 w-4" />;
  };

  if (loading && !data) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading performance data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading performance data: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>No performance data available</AlertDescription>
        </Alert>
      </div>
    );
  }

  const { overall, endpoints, cache } = data;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of Maersk API performance
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeWindow}
            onChange={(e) => setTimeWindow(e.target.value)}
            className="border rounded px-3 py-1"
          >
            <option value="300000">Last 5 minutes</option>
            <option value="900000">Last 15 minutes</option>
            <option value="3600000">Last hour</option>
            <option value="86400000">Last 24 hours</option>
          </select>
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requests
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overall.totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              {overall.throughput.toFixed(2)} req/min
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overall.totalRequests > 0
                ? (
                    (overall.successfulRequests / overall.totalRequests) *
                    100
                  ).toFixed(1)
                : "0"}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {overall.successfulRequests} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Response Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overall.averageResponseTime}ms
            </div>
            <p className="text-xs text-muted-foreground">
              {overall.minResponseTime}-{overall.maxResponseTime}ms range
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cache Hit Rate
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overall.cacheHitRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {cache.cacheHits} hits, {cache.cacheMisses} misses
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="cache">Cache Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Success Rate</span>
                    <span
                      className={getStatusColor(
                        (overall.successfulRequests / overall.totalRequests) *
                          100
                      )}
                    >
                      {overall.totalRequests > 0
                        ? (
                            (overall.successfulRequests /
                              overall.totalRequests) *
                            100
                          ).toFixed(1)
                        : "0"}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      overall.totalRequests > 0
                        ? (overall.successfulRequests / overall.totalRequests) *
                          100
                        : 0
                    }
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Cache Hit Rate</span>
                    <span className={getStatusColor(overall.cacheHitRate)}>
                      {overall.cacheHitRate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={overall.cacheHitRate} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Error Rate</span>
                    <span className={getStatusColor(100 - overall.errorRate)}>
                      {overall.errorRate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={overall.errorRate} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Response Time Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Response Time Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {overall.minResponseTime}ms
                    </div>
                    <div className="text-sm text-muted-foreground">Min</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {overall.averageResponseTime}ms
                    </div>
                    <div className="text-sm text-muted-foreground">Average</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {overall.maxResponseTime}ms
                    </div>
                    <div className="text-sm text-muted-foreground">Max</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Throughput</span>
                    <span className="font-medium">
                      {overall.throughput.toFixed(2)} req/min
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Requests</span>
                    <span className="font-medium">{overall.totalRequests}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Failed Requests</span>
                    <span className="font-medium text-red-600">
                      {overall.failedRequests}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Endpoint Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(endpoints).length === 0 ? (
                <p className="text-muted-foreground">
                  No endpoint data available
                </p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(endpoints).map(([endpoint, stats]) => (
                    <div key={endpoint} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{endpoint}</h3>
                        <Badge
                          variant={
                            stats.errorRate > 10 ? "destructive" : "default"
                          }
                        >
                          {stats.errorRate.toFixed(1)}% error
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Requests:
                          </span>
                          <span className="ml-1 font-medium">
                            {stats.totalRequests}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Avg Time:
                          </span>
                          <span className="ml-1 font-medium">
                            {stats.averageResponseTime}ms
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Cache Hit:
                          </span>
                          <span className="ml-1 font-medium">
                            {stats.cacheHitRate.toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Throughput:
                          </span>
                          <span className="ml-1 font-medium">
                            {stats.throughput.toFixed(2)}/min
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Cache Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {cache.cacheHits}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Cache Hits
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {cache.cacheMisses}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Cache Misses
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {cache.totalRequests}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Requests
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Hit Rate</span>
                    <span className={getStatusColor(cache.hitRate)}>
                      {cache.hitRate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={cache.hitRate} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Miss Rate</span>
                    <span className="text-red-600">
                      {cache.missRate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={cache.missRate} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Last updated:{" "}
        {data.timestamp ? new Date(data.timestamp).toLocaleString() : "Never"}
      </div>
    </div>
  );
}
