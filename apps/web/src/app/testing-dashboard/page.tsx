"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Play,
  Download,
  BarChart3,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

interface TestResult {
  endpoint: string;
  method: string;
  status: number;
  responseTime: number;
  success: boolean;
  hasData: boolean;
  error?: string;
}

interface TestSummary {
  total: number;
  successful: number;
  failed: number;
  successRate: number;
  avgResponseTime: number;
  slowRequests: number;
}

interface PerformanceData {
  totalRequests: number;
  averageResponseTime: number;
  successRate: number;
  errorRate: number;
  cacheHitRate: number;
  uniqueEndpoints: number;
}

export default function TestingDashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testSummary, setTestSummary] = useState<TestSummary | null>(null);
  const [performanceData, setPerformanceData] =
    useState<PerformanceData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Загружаем данные производительности при монтировании
  useEffect(() => {
    loadPerformanceData();
  }, []);

  const runTests = async () => {
    setIsRunning(true);
    setError(null);

    try {
      const response = await fetch("/api/testing?action=run");
      const data = await response.json();

      if (data.success) {
        setTestResults(data.data.results);
        setTestSummary(data.data.summary);
      } else {
        setError(data.error || "Failed to run tests");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsRunning(false);
    }
  };

  const loadPerformanceData = async () => {
    try {
      const response = await fetch("/api/performance?action=overview");
      const data = await response.json();

      if (data.success) {
        setPerformanceData(data.data.overall);
      }
    } catch (err) {
      console.error("Failed to load performance data:", err);
    }
  };

  const exportResults = async () => {
    try {
      const response = await fetch("/api/testing?action=run&export=true");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "api-test-results.json";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError("Failed to export results");
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-green-500";
    if (status >= 400 && status < 500) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getResponseTimeColor = (time: number) => {
    if (time < 500) return "text-green-600";
    if (time < 1000) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Testing Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive API testing and performance monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runTests} disabled={isRunning}>
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Tests
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={exportResults}
            disabled={testResults.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Results
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tests">Test Results</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Test Summary */}
            {testSummary && (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Tests
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {testSummary.total}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {testSummary.successful} successful, {testSummary.failed}{" "}
                      failed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Success Rate
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {testSummary.successRate?.toFixed(1) || "0.0"}%
                    </div>
                    <Progress
                      value={testSummary.successRate || 0}
                      className="mt-2"
                    />
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
                      {testSummary.avgResponseTime}ms
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {testSummary.slowRequests} slow requests
                    </p>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Performance Summary */}
            {performanceData && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    API Performance
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {performanceData.totalRequests}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {performanceData.successRate?.toFixed(1) || "0.0"}% success
                    rate
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {testResults.length === 0 && !isRunning && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Play className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Test Results</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Run the API tests to see detailed results and performance
                  metrics.
                </p>
                <Button onClick={runTests}>
                  <Play className="mr-2 h-4 w-4" />
                  Run Tests
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          {testResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Test Results</h3>
                <Badge
                  variant={
                    testSummary?.successRate === 100 ? "default" : "secondary"
                  }
                >
                  {testSummary?.successful}/{testSummary?.total} passed
                </Badge>
              </div>

              <div className="grid gap-4">
                {testResults.map((result, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-3 h-3 rounded-full ${getStatusColor(result.status)}`}
                          />
                          <div>
                            <p className="font-medium">{result.endpoint}</p>
                            <p className="text-sm text-muted-foreground">
                              {result.method} • Status: {result.status}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-medium ${getResponseTimeColor(result.responseTime)}`}
                          >
                            {result.responseTime}ms
                          </p>
                          <Badge
                            variant={result.success ? "default" : "destructive"}
                          >
                            {result.success ? "Success" : "Failed"}
                          </Badge>
                        </div>
                      </div>
                      {result.error && (
                        <p className="text-sm text-red-600 mt-2">
                          {result.error}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {performanceData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                  <CardDescription>
                    Real-time API performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Requests</span>
                    <span className="font-medium">
                      {performanceData.totalRequests}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate</span>
                    <span className="font-medium">
                      {performanceData.successRate?.toFixed(1) || "0.0"}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Error Rate</span>
                    <span className="font-medium">
                      {performanceData.errorRate?.toFixed(1) || "0.0"}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cache Hit Rate</span>
                    <span className="font-medium">
                      {performanceData.cacheHitRate?.toFixed(1) || "0.0"}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Response Time</span>
                    <span className="font-medium">
                      {performanceData.averageResponseTime}ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unique Endpoints</span>
                    <span className="font-medium">
                      {performanceData.uniqueEndpoints}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Charts</CardTitle>
                  <CardDescription>Visual performance metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Success Rate</span>
                      <span>
                        {performanceData.successRate?.toFixed(1) || "0.0"}%
                      </span>
                    </div>
                    <Progress
                      value={performanceData.successRate || 0}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Cache Hit Rate</span>
                      <span>
                        {performanceData.cacheHitRate?.toFixed(1) || "0.0"}%
                      </span>
                    </div>
                    <Progress
                      value={performanceData.cacheHitRate || 0}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Response Time</span>
                      <span>{performanceData.averageResponseTime}ms</span>
                    </div>
                    <Progress
                      value={Math.min(
                        (performanceData.averageResponseTime / 1000) * 100,
                        100
                      )}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={loadPerformanceData} variant="outline">
              <Activity className="mr-2 h-4 w-4" />
              Refresh Data
            </Button>
            <Button asChild variant="outline">
              <a href="/performance-dashboard" target="_blank">
                <BarChart3 className="mr-2 h-4 w-4" />
                Detailed Performance
              </a>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
