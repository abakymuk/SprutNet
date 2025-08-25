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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Activity,
  Server,
  Database,
  Globe,
  Clock,
  AlertCircle,
} from "lucide-react";

interface DiagnosticResult {
  timestamp: string;
  status: "healthy" | "degraded" | "unhealthy";
  checks?: any;
  recommendations?: string[];
  error?: string;
  maerskStatus?: any;
}

interface ApiTestResult {
  name: string;
  path: string;
  status: number;
  duration: number;
  success: boolean;
  hasData?: boolean;
  error?: string;
}

interface LogEvent {
  timestamp: string;
  event: string;
  data: any;
  sessionId: string;
}

export default function DiagnosticsPage() {
  const [healthCheck, setHealthCheck] = useState<DiagnosticResult | null>(null);
  const [apiStatus, setApiStatus] = useState<DiagnosticResult | null>(null);
  const [apiTests, setApiTests] = useState<ApiTestResult[]>([]);
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const runHealthCheck = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/diagnostics?action=health");
      const data = await response.json();
      setHealthCheck(data);
    } catch (error) {
      setHealthCheck({
        timestamp: new Date().toISOString(),
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
    setIsLoading(false);
  };

  const runApiStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/diagnostics?action=api-status");
      const data = await response.json();
      setApiStatus(data);
    } catch (error) {
      setApiStatus({
        timestamp: new Date().toISOString(),
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
    setIsLoading(false);
  };

  const runApiTests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/diagnostics?action=test-endpoints");
      const data = await response.json();
      setApiTests(data.results || []);
    } catch (error) {
      console.error("API tests failed:", error);
    }
    setIsLoading(false);
  };

  const getLogs = async () => {
    try {
      const response = await fetch("/api/diagnostics?action=logs");
      const data = await response.json();
      setLogs(data.recentEvents || []);
    } catch (error) {
      console.error("Failed to get logs:", error);
    }
  };

  const runAllDiagnostics = async () => {
    setIsLoading(true);
    await Promise.all([
      runHealthCheck(),
      runApiStatus(),
      runApiTests(),
      getLogs(),
    ]);
    setLastUpdate(new Date());
    setIsLoading(false);
  };

  useEffect(() => {
    runAllDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "unhealthy":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return (
          <Badge variant="default" className="bg-green-500">
            Healthy
          </Badge>
        );
      case "degraded":
        return (
          <Badge variant="secondary" className="bg-yellow-500">
            Degraded
          </Badge>
        );
      case "unhealthy":
        return <Badge variant="destructive">Unhealthy</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Diagnostics</h1>
          <p className="text-muted-foreground">
            Comprehensive system health and troubleshooting tools
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdate && (
            <p className="text-sm text-muted-foreground">
              Last update: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
          <Button
            onClick={runAllDiagnostics}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="health">Health Check</TabsTrigger>
          <TabsTrigger value="api">API Status</TabsTrigger>
          <TabsTrigger value="tests">API Tests</TabsTrigger>
          <TabsTrigger value="logs">Recent Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  System Health
                </CardTitle>
                {healthCheck && getStatusIcon(healthCheck.status)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {healthCheck
                    ? getStatusBadge(healthCheck.status)
                    : "Loading..."}
                </div>
                <p className="text-xs text-muted-foreground">
                  Overall system status
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  API Status
                </CardTitle>
                {apiStatus && getStatusIcon(apiStatus.status)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {apiStatus ? getStatusBadge(apiStatus.status) : "Loading..."}
                </div>
                <p className="text-xs text-muted-foreground">
                  Maersk API connectivity
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Tests</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {apiTests.length > 0 ? (
                    <span className="text-green-600">
                      {apiTests.filter((t) => t.success).length}/
                      {apiTests.length}
                    </span>
                  ) : (
                    "Loading..."
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Endpoints tested
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Recent Events
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{logs.length}</div>
                <p className="text-xs text-muted-foreground">
                  Telemetry events
                </p>
              </CardContent>
            </Card>
          </div>

          {healthCheck?.recommendations &&
            healthCheck.recommendations.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Recommendations</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {healthCheck.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                System Health Check
              </CardTitle>
              <CardDescription>
                Comprehensive system health assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {healthCheck ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(healthCheck.status)}
                    <span className="font-medium">
                      Status: {healthCheck.status}
                    </span>
                  </div>

                  {healthCheck.checks && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">System Info</h4>
                        <div className="text-sm space-y-1">
                          <p>
                            Uptime:{" "}
                            {Math.floor(healthCheck.checks.system?.uptime || 0)}
                            s
                          </p>
                          <p>
                            Node Version:{" "}
                            {healthCheck.checks.system?.nodeVersion}
                          </p>
                          <p>
                            Environment:{" "}
                            {healthCheck.checks.environment?.NODE_ENV}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Telemetry</h4>
                        <div className="text-sm space-y-1">
                          <p>
                            Total Events:{" "}
                            {healthCheck.checks.telemetry?.totalEvents}
                          </p>
                          <p>
                            Recent Errors:{" "}
                            {healthCheck.checks.telemetry?.recentErrors
                              ?.length || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {healthCheck.error && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{healthCheck.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <p>Loading health check...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                API Status
              </CardTitle>
              <CardDescription>
                Maersk API connectivity and configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              {apiStatus ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(apiStatus.status)}
                    <span className="font-medium">
                      API Status: {apiStatus.status}
                    </span>
                  </div>

                  {apiStatus.maerskStatus && (
                    <div>
                      <h4 className="font-medium mb-2">Maersk API Details</h4>
                      <div className="text-sm space-y-2">
                        <p>
                          Success:{" "}
                          {apiStatus.maerskStatus.success ? "Yes" : "No"}
                        </p>
                        {apiStatus.maerskStatus.message && (
                          <p>Message: {apiStatus.maerskStatus.message}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {apiStatus.recommendations &&
                    apiStatus.recommendations.length > 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Recommendations</AlertTitle>
                        <AlertDescription>
                          <ul className="list-disc list-inside space-y-1">
                            {apiStatus.recommendations.map((rec, index) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}

                  {apiStatus.error && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{apiStatus.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <p>Loading API status...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                API Endpoint Tests
              </CardTitle>
              <CardDescription>
                Test results for all API endpoints
              </CardDescription>
            </CardHeader>
            <CardContent>
              {apiTests.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-2">
                    {apiTests.map((test, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {test.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium">{test.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {test.path}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {test.success ? "Success" : `Error ${test.status}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {test.duration}ms
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span>
                      Success Rate:{" "}
                      {Math.round(
                        (apiTests.filter((t) => t.success).length /
                          apiTests.length) *
                          100
                      )}
                      %
                    </span>
                    <span>
                      Average Response:{" "}
                      {Math.round(
                        apiTests.reduce((sum, t) => sum + t.duration, 0) /
                          apiTests.length
                      )}
                      ms
                    </span>
                  </div>
                </div>
              ) : (
                <p>Loading API tests...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Telemetry Events
              </CardTitle>
              <CardDescription>Latest system events and logs</CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {logs.map((event, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {event.event}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {event.sessionId.slice(-8)}
                        </span>
                      </div>
                      {event.data && Object.keys(event.data).length > 0 && (
                        <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-x-auto">
                          {JSON.stringify(event.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No recent events found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
