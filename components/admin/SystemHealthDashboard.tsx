"use client";

import { useState, useEffect } from "react";
import { Activity, Database, Server, Zap, AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react";

type HealthMetric = {
  name: string;
  status: "healthy" | "warning" | "critical";
  value: string | number;
  trend?: "up" | "down" | "stable";
  description: string;
  lastUpdated: string;
};

type SystemService = {
  name: string;
  status: "online" | "degraded" | "offline";
  uptime: string;
  responseTime: number;
  errorRate: number;
  description: string;
};

export default function SystemHealthDashboard() {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [services, setServices] = useState<SystemService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchHealthData = async () => {
    setLoading(true);
    
    // Simulate API calls - replace with real endpoints
    const mockMetrics: HealthMetric[] = [
      {
        name: "API Response Time",
        status: "healthy",
        value: "145ms",
        trend: "stable",
        description: "Average response time across all endpoints",
        lastUpdated: new Date().toISOString()
      },
      {
        name: "Database Connections",
        status: "healthy", 
        value: "23/100",
        trend: "up",
        description: "Active database connections",
        lastUpdated: new Date().toISOString()
      },
      {
        name: "Memory Usage",
        status: "warning",
        value: "78%",
        trend: "up",
        description: "Server memory utilization",
        lastUpdated: new Date().toISOString()
      },
      {
        name: "Error Rate",
        status: "healthy",
        value: "0.02%",
        trend: "down",
        description: "Errors per total requests (24h)",
        lastUpdated: new Date().toISOString()
      },
      {
        name: "Active Users",
        status: "healthy",
        value: "1,247",
        trend: "up", 
        description: "Users active in last 24 hours",
        lastUpdated: new Date().toISOString()
      },
      {
        name: "Whispers Ranking",
        status: "healthy",
        value: "98.5ms",
        trend: "stable",
        description: "Average whispers ranking time",
        lastUpdated: new Date().toISOString()
      }
    ];

    const mockServices: SystemService[] = [
      {
        name: "API Server",
        status: "online",
        uptime: "99.98%",
        responseTime: 145,
        errorRate: 0.02,
        description: "Main application server"
      },
      {
        name: "Supabase Database", 
        status: "online",
        uptime: "100%",
        responseTime: 23,
        errorRate: 0,
        description: "Primary PostgreSQL database"
      },
      {
        name: "Whispers Service",
        status: "online", 
        uptime: "99.95%",
        responseTime: 98,
        errorRate: 0.01,
        description: "Contextual memory ranking system"
      },
      {
        name: "Voice Processing",
        status: "degraded",
        uptime: "97.80%", 
        responseTime: 340,
        errorRate: 2.1,
        description: "Speech-to-text and Maya voice"
      },
      {
        name: "File Storage",
        status: "online",
        uptime: "100%",
        responseTime: 89,
        errorRate: 0,
        description: "Document and media storage"
      },
      {
        name: "CDN",
        status: "online",
        uptime: "99.99%",
        responseTime: 12,
        errorRate: 0,
        description: "Content delivery network"
      }
    ];

    setMetrics(mockMetrics);
    setServices(mockServices);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "online": return "text-green-400 bg-green-500/10";
      case "warning":  
      case "degraded": return "text-yellow-400 bg-yellow-500/10";
      case "critical":
      case "offline": return "text-red-400 bg-red-500/10";
      default: return "text-gray-400 bg-gray-500/10";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "online": return <CheckCircle className="w-4 h-4" />;
      case "warning":
      case "degraded": return <AlertTriangle className="w-4 h-4" />;
      case "critical": 
      case "offline": return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend: string | undefined) => {
    if (trend === "up") return <TrendingUp className="w-3 h-3 text-green-400" />;
    if (trend === "down") return <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />;
    return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
  };

  const overallStatus = services.every(s => s.status === "online") ? "healthy" :
                       services.some(s => s.status === "offline") ? "critical" : "warning";

  return (
    <div className="p-6 space-y-6">
      {/* Overall Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 p-6 rounded-2xl border border-edge-700 bg-bg-900">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-full ${getStatusColor(overallStatus)}`}>
              {getStatusIcon(overallStatus)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-ink-100">System Status</h2>
              <p className={`text-sm capitalize ${getStatusColor(overallStatus).split(" ")[0]}`}>
                All systems {overallStatus}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">99.98%</div>
              <div className="text-xs text-ink-400">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-ink-100">1,247</div>
              <div className="text-xs text-ink-400">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-ink-100">145ms</div>
              <div className="text-xs text-ink-400">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">0.02%</div>
              <div className="text-xs text-ink-400">Error Rate</div>
            </div>
          </div>
        </div>
        
        <div className="p-6 rounded-2xl border border-edge-700 bg-bg-900">
          <h3 className="font-medium text-ink-100 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button className="w-full p-2 text-sm bg-edge-800 hover:bg-edge-700 text-ink-300 rounded-lg transition-colors">
              View Full Logs
            </button>
            <button className="w-full p-2 text-sm bg-edge-800 hover:bg-edge-700 text-ink-300 rounded-lg transition-colors">
              Run Diagnostics
            </button>
            <button className="w-full p-2 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors">
              Emergency Mode
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-ink-100 mb-4">Key Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map(metric => (
            <div key={metric.name} className="p-4 rounded-xl border border-edge-700 bg-bg-900">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-ink-100">{metric.name}</h4>
                <div className="flex items-center gap-2">
                  {getTrendIcon(metric.trend)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                    {metric.status}
                  </span>
                </div>
              </div>
              <div className="text-2xl font-bold text-ink-100 mb-1">
                {metric.value}
              </div>
              <p className="text-xs text-ink-400 mb-2">{metric.description}</p>
              <div className="text-xs text-ink-500">
                Updated {new Date(metric.lastUpdated).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Services Status */}
      <div>
        <h3 className="text-lg font-semibold text-ink-100 mb-4">Service Status</h3>
        <div className="grid gap-4">
          {services.map(service => (
            <div key={service.name} className="p-4 rounded-xl border border-edge-700 bg-bg-900">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <h4 className="font-medium text-ink-100">{service.name}</h4>
                    <p className="text-sm text-ink-300">{service.description}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(service.status)}`}>
                  {service.status}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-ink-400">Uptime</div>
                  <div className="font-medium text-ink-100">{service.uptime}</div>
                </div>
                <div>
                  <div className="text-ink-400">Response Time</div>
                  <div className="font-medium text-ink-100">{service.responseTime}ms</div>
                </div>
                <div>
                  <div className="text-ink-400">Error Rate</div>
                  <div className="font-medium text-ink-100">{service.errorRate}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Alerts */}
      <div>
        <h3 className="text-lg font-semibold text-ink-100 mb-4">Recent Alerts</h3>
        <div className="space-y-2">
          <div className="p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
            <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
              <AlertTriangle className="w-4 h-4" />
              Memory usage approaching 80% threshold
            </div>
            <div className="text-xs text-ink-400 mt-1">2 minutes ago</div>
          </div>
          <div className="p-3 rounded-lg border border-green-500/30 bg-green-500/10">
            <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Voice processing service recovered
            </div>
            <div className="text-xs text-ink-400 mt-1">15 minutes ago</div>
          </div>
        </div>
      </div>
    </div>
  );
}