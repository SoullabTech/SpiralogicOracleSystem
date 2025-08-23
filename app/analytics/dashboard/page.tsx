"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IntegrationAuthService } from "@/lib/auth/integrationAuth";
import {
  UserDevelopmentMetrics,
  PlatformAnalytics,
  ResearchInsights,
  ElementalArchetype,
  AnalyticsData,
} from "../../../frontend/lib/types";

// AnalyticsData interface is now imported from types

export default function AnalyticsDashboardPage() {
  const router = useRouter();
  const authService = new IntegrationAuthService();

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [timeframe, setTimeframe] = useState<
    "week" | "month" | "quarter" | "year"
  >("month");
  const [analyticsType, setAnalyticsType] = useState<
    "user" | "platform" | "research"
  >("user");
  const [showPrivacyDetails, setShowPrivacyDetails] = useState(false);
  const [analyticsPreferences, setAnalyticsPreferences] = useState({
    includeWellbeingData: true,
    includeCommunityData: true,
    includeContentData: true,
    anonymousResearchParticipation: false,
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [timeframe, analyticsType]);

  const loadAnalyticsData = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        router.push("/auth/signin");
        return;
      }

      setCurrentUser(user);

      const params = new URLSearchParams({
        timeframe,
        type: analyticsType,
      });

      const response = await fetch(`/api/analytics/dashboard?${params}`);

      if (response.status === 204) {
        // Insufficient data for analytics
        setAnalyticsData(null);
        return;
      }

      if (response.status === 403) {
        // Insufficient permissions
        setAnalyticsType("user"); // Fall back to user analytics
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error("Analytics loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateAnalyticsPreferences = async () => {
    try {
      const response = await fetch("/api/analytics/dashboard", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analyticsPreferences }),
      });

      if (response.ok) {
        await loadAnalyticsData(); // Refresh data with new preferences
      }
    } catch (error) {
      console.error("Preferences update error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Development Analytics
              </h1>
              <p className="text-sm text-gray-600">
                Privacy-focused insights into your integration journey
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowPrivacyDetails(!showPrivacyDetails)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Privacy Details
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="text-gray-500 hover:text-gray-700"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Privacy Notice */}
      <div className="bg-blue-50 border-b border-blue-200 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start space-x-3">
            <span className="text-blue-600 text-sm">🔒</span>
            <div className="text-sm text-blue-800">
              <strong>Privacy-First Analytics:</strong> All data is processed
              with your privacy settings. Platform and research analytics use
              only anonymized, aggregated data with minimum cohort sizes.
              {showPrivacyDetails && analyticsData?.privacyReport && (
                <PrivacyDetails report={analyticsData.privacyReport} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border-b p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Analytics Type
                </label>
                <select
                  value={analyticsType}
                  onChange={(e) => setAnalyticsType(e.target.value as any)}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">Personal Development</option>
                  {currentUser?.accountType === "admin" && (
                    <option value="platform">Platform Analytics</option>
                  )}
                  {currentUser?.accountType === "researcher" && (
                    <option value="research">Research Insights</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timeframe
                </label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value as any)}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                  <option value="quarter">Past Quarter</option>
                  <option value="year">Past Year</option>
                </select>
              </div>
            </div>

            <button
              onClick={loadAnalyticsData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!analyticsData ? (
          <InsufficientDataMessage />
        ) : (
          <>
            {analyticsData.userMetrics && (
              <UserMetricsView
                metrics={analyticsData.userMetrics}
                preferences={analyticsPreferences}
                onUpdatePreferences={setAnalyticsPreferences}
                onSavePreferences={updateAnalyticsPreferences}
              />
            )}

            {analyticsData.platformAnalytics && (
              <PlatformAnalyticsView
                analytics={analyticsData.platformAnalytics}
              />
            )}

            {analyticsData.researchInsights && (
              <ResearchInsightsView insights={analyticsData.researchInsights} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

const PrivacyDetails: React.FC<{ report: any }> = ({ report }) => (
  <div className="mt-4 p-4 bg-white border border-blue-200 rounded-lg">
    <h4 className="font-medium text-blue-900 mb-3">Your Data & Privacy</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      <div>
        <h5 className="font-medium text-blue-800 mb-2">Data We Collect:</h5>
        <ul className="space-y-1 text-blue-700">
          {report.dataCollected.map((item: string, index: number) => (
            <li key={index}>• {item}</li>
          ))}
        </ul>
      </div>
      <div>
        <h5 className="font-medium text-blue-800 mb-2">Your Rights:</h5>
        <ul className="space-y-1 text-blue-700">
          {report.userRights.slice(0, 3).map((right: string, index: number) => (
            <li key={index}>• {right}</li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

const InsufficientDataMessage: React.FC = () => (
  <div className="text-center py-12">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <span className="text-2xl">📊</span>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      Insufficient Data for Analytics
    </h3>
    <p className="text-gray-600 mb-6">
      Analytics require minimum data thresholds to protect user privacy.
      Continue your integration journey to unlock insights.
    </p>
    <div className="text-sm text-gray-500">
      <p>Platform analytics require minimum 10 users</p>
      <p>Research insights require minimum 50 participants</p>
    </div>
  </div>
);

const UserMetricsView: React.FC<{
  metrics: UserDevelopmentMetrics;
  preferences: any;
  onUpdatePreferences: (prefs: any) => void;
  onSavePreferences: () => void;
}> = ({ metrics, preferences, onUpdatePreferences, onSavePreferences }) => (
  <div className="space-y-6">
    {/* Integration Progress */}
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Integration Progress</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-semibold text-blue-600">
            {metrics.integrationProgress.gatesCompleted}
          </div>
          <div className="text-sm text-blue-800">Gates Completed</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-semibold text-green-600">
            {metrics.integrationProgress.consistencyScore}/10
          </div>
          <div className="text-sm text-green-800">Consistency Score</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-semibold text-purple-600">
            {metrics.integrationProgress.spiralDepth}
          </div>
          <div className="text-sm text-purple-800">Spiral Depth</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-semibold text-orange-600">
            {metrics.integrationProgress.averageIntegrationTime}
          </div>
          <div className="text-sm text-orange-800">Avg Integration Days</div>
        </div>
      </div>
    </div>

    {/* Elemental Balance */}
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">
        Elemental Development Balance
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(metrics.elementalBalance).map(([archetype, data]) => (
          <ElementalBalanceCard
            key={archetype}
            archetype={archetype as ElementalArchetype}
            data={data}
          />
        ))}
      </div>
    </div>

    {/* Bypassing Prevention */}
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Integration Support</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <div className="text-lg font-medium text-gray-900">
            {metrics.bypassingPrevention.alertsTriggered}
          </div>
          <div className="text-sm text-gray-600">Support Alerts</div>
        </div>
        <div>
          <div className="text-lg font-medium text-gray-900">
            {metrics.bypassingPrevention.interventionsAccepted}
          </div>
          <div className="text-sm text-gray-600">Interventions Accepted</div>
        </div>
        <div>
          <div className="text-lg font-medium text-gray-900">
            +{metrics.bypassingPrevention.communityEngagementIncrease}%
          </div>
          <div className="text-sm text-gray-600">
            Community Engagement Increase
          </div>
        </div>
      </div>
    </div>

    {/* Community Engagement */}
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Community Participation</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900">
            {metrics.communityEngagement.realityCheckRequests}
          </div>
          <div className="text-sm text-gray-600">Reality Check Requests</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900">
            {metrics.communityEngagement.supportOffered}
          </div>
          <div className="text-sm text-gray-600">Support Offered</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900">
            {metrics.communityEngagement.vulnerabilityShared}
          </div>
          <div className="text-sm text-gray-600">Vulnerable Shares</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900">
            {metrics.communityEngagement.bypassingConcernsRaised}
          </div>
          <div className="text-sm text-gray-600">Bypassing Concerns Raised</div>
        </div>
      </div>
    </div>

    {/* Privacy Preferences */}
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Analytics Preferences</h3>
      <div className="space-y-3">
        {Object.entries(preferences).map(([key, value]) => (
          <label key={key} className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={value as boolean}
              onChange={(e) =>
                onUpdatePreferences({
                  ...preferences,
                  [key]: e.target.checked,
                })
              }
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              {key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
            </span>
          </label>
        ))}
      </div>
      <button
        onClick={onSavePreferences}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
      >
        Save Preferences
      </button>
    </div>
  </div>
);

const ElementalBalanceCard: React.FC<{
  archetype: ElementalArchetype;
  data: any;
}> = ({ archetype, data }) => {
  const getArchetypeIcon = (archetype: ElementalArchetype) => {
    switch (archetype) {
      case ElementalArchetype.FIRE:
        return "🔥";
      case ElementalArchetype.WATER:
        return "🌊";
      case ElementalArchetype.EARTH:
        return "🌍";
      case ElementalArchetype.AIR:
        return "💨";
    }
  };

  return (
    <div className="text-center p-4 border border-gray-200 rounded-lg">
      <div className="text-2xl mb-2">{getArchetypeIcon(archetype)}</div>
      <div className="text-sm font-medium text-gray-900 mb-1">
        {archetype.toUpperCase()}
      </div>
      <div className="text-xs text-gray-600">
        {data.contentEngaged} content engaged
      </div>
      <div className="text-xs text-gray-600">
        {Math.round(data.integrationRate * 100)}% integration rate
      </div>
    </div>
  );
};

const PlatformAnalyticsView: React.FC<{ analytics: PlatformAnalytics }> = ({
  analytics,
}) => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Platform Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-semibold text-blue-600">
            {analytics.totalUsers}
          </div>
          <div className="text-sm text-blue-800">Total Users</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-semibold text-green-600">
            {analytics.activeUsers}
          </div>
          <div className="text-sm text-green-800">Active Users</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-semibold text-purple-600">
            {Math.round(analytics.retentionRates.month1 * 100)}%
          </div>
          <div className="text-sm text-purple-800">30-Day Retention</div>
        </div>
      </div>
    </div>
  </div>
);

const ResearchInsightsView: React.FC<{ insights: ResearchInsights }> = ({
  insights,
}) => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Research Insights</h3>
      <div className="text-sm text-gray-600 mb-4">
        Based on anonymized data from consenting participants
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            Development Patterns
          </h4>
          <ul className="space-y-2 text-sm text-gray-700">
            {insights.developmentPatterns.commonProgressionPaths.map(
              (pattern, index) => (
                <li key={index}>• {pattern}</li>
              ),
            )}
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            Effective Interventions
          </h4>
          <ul className="space-y-2 text-sm text-gray-700">
            {insights.bypassingPatterns.effectiveInterventions.map(
              (intervention, index) => (
                <li key={index}>• {intervention}</li>
              ),
            )}
          </ul>
        </div>
      </div>
    </div>
  </div>
);
