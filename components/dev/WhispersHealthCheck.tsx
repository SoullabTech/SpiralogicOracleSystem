"use client";

import { useState, useEffect } from "react";
import { features } from "@/lib/config/features";

type HealthStatus = "loading" | "healthy" | "warning" | "error";

type HealthCheck = {
  name: string;
  status: HealthStatus;
  message: string;
  details?: any;
};

export default function WhispersHealthCheck() {
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runHealthChecks();
  }, []);

  const runHealthChecks = async () => {
    setLoading(true);
    const results: HealthCheck[] = [];

    // Feature flags check
    results.push({
      name: "Feature Flags",
      status: features.whispers.enabled ? "healthy" : "warning",
      message: features.whispers.enabled ? "Whispers enabled" : "Whispers disabled",
      details: {
        enabled: features.whispers.enabled,
        contextRanking: features.whispers.contextRanking,
        maxItems: features.whispers.maxItems
      }
    });

    // API connectivity check
    try {
      const response = await fetch('/api/whispers/weights', { method: 'GET' });
      const data = await response.json();
      
      results.push({
        name: "API Connectivity",
        status: response.ok ? "healthy" : "error",
        message: response.ok ? "API responding" : `API error: ${response.status}`,
        details: { status: response.status, source: data.source }
      });
    } catch (error: any) {
      results.push({
        name: "API Connectivity",
        status: "error",
        message: `API unreachable: ${error.message}`,
        details: { error: error.message }
      });
    }

    // Context ranking check
    try {
      const testPayload = {
        recapBuckets: [{ element: "fire", keywords: ["test"] }],
        limit: 3
      };
      
      const start = Date.now();
      const response = await fetch('/api/whispers/context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
      });
      const duration = Date.now() - start;
      const data = await response.json();
      
      results.push({
        name: "Context Ranking",
        status: duration > 200 ? "warning" : "healthy",
        message: `Ranking completed in ${duration}ms`,
        details: { 
          duration, 
          whisperCount: data.whispers?.length ?? 0,
          threshold: "200ms"
        }
      });
    } catch (error: any) {
      results.push({
        name: "Context Ranking",
        status: "error",
        message: `Ranking failed: ${error.message}`,
        details: { error: error.message }
      });
    }

    // Local storage check
    try {
      const testKey = "__whispers_test__";
      localStorage.setItem(testKey, "test");
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      results.push({
        name: "Local Storage",
        status: retrieved === "test" ? "healthy" : "warning",
        message: retrieved === "test" ? "localStorage working" : "localStorage failed",
        details: { available: !!window.localStorage }
      });
    } catch (error: any) {
      results.push({
        name: "Local Storage",
        status: "warning",
        message: "localStorage unavailable",
        details: { error: error.message }
      });
    }

    // Browser compatibility
    const compatibility = {
      fetch: !!window.fetch,
      localStorage: !!window.localStorage,
      urlSearchParams: !!window.URLSearchParams,
      promise: !!window.Promise
    };
    
    const missingFeatures = Object.entries(compatibility)
      .filter(([_, supported]) => !supported)
      .map(([feature]) => feature);
    
    results.push({
      name: "Browser Compatibility",
      status: missingFeatures.length === 0 ? "healthy" : "warning",
      message: missingFeatures.length === 0 
        ? "All features supported" 
        : `Missing: ${missingFeatures.join(', ')}`,
      details: compatibility
    });

    setChecks(results);
    setLoading(false);
  };

  const getStatusColor = (status: HealthStatus) => {
    switch (status) {
      case "healthy": return "text-green-400";
      case "warning": return "text-yellow-400";
      case "error": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  const getStatusIcon = (status: HealthStatus) => {
    switch (status) {
      case "healthy": return "✅";
      case "warning": return "⚠️";
      case "error": return "❌";
      case "loading": return "⏳";
      default: return "❔";
    }
  };

  const overallStatus = loading ? "loading" :
    checks.some(c => c.status === "error") ? "error" :
    checks.some(c => c.status === "warning") ? "warning" : "healthy";

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-ink-100">
          {getStatusIcon(overallStatus)} Whispers Health Check
        </h1>
        <p className="text-ink-300">
          System diagnostics and connectivity verification
        </p>
        <button
          onClick={runHealthChecks}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-gold-400 text-bg-900 font-medium hover:bg-gold-300 disabled:opacity-50"
        >
          {loading ? "Running checks..." : "Refresh"}
        </button>
      </header>

      <div className="grid gap-4">
        {checks.map((check, i) => (
          <div key={i} className="p-4 rounded-lg border border-edge-700 bg-bg-900">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-ink-100">
                {getStatusIcon(check.status)} {check.name}
              </h3>
              <span className={`text-sm ${getStatusColor(check.status)}`}>
                {check.status.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-ink-300 mb-3">{check.message}</p>
            {check.details && (
              <details className="text-xs">
                <summary className="cursor-pointer text-ink-400 hover:text-ink-300">
                  Show details
                </summary>
                <pre className="mt-2 p-2 rounded bg-bg-800 overflow-x-auto">
                  {JSON.stringify(check.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>

      {!loading && (
        <div className="text-center text-sm text-ink-400">
          Last checked: {new Date().toLocaleString()}
        </div>
      )}
    </div>
  );
}