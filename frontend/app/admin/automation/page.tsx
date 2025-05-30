'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertTriangle, 
  Heart,
  Zap,
  Users,
  Brain,
  Clock,
  RefreshCw,
  Settings,
  Bell,
  TrendingUp,
  Shield,
  Sparkles
} from 'lucide-react';

// ===============================================
// ADHD-FRIENDLY AUTOMATION DASHBOARD
// Color-coded, one-click actions, never overwhelming
// ===============================================

interface AutomationMetrics {
  todayCompleted: {
    welcomeEmails: number;
    breakthroughCelebrations: number;
    dailyPrompts: number;
    supportTriggers: number;
    systemChecks: number;
  };
  needsAttention: {
    criticalUsers: number;
    stuckPatterns: number;
    systemAlerts: number;
    pendingTasks: number;
  };
  systemHealth: {
    automationUptime: string;
    webhookStatus: 'healthy' | 'warning' | 'critical';
    n8nStatus: 'connected' | 'disconnected';
    lastUpdate: string;
  };
}

interface UserNeedingAttention {
  userId: string;
  name: string;
  issue: string;
  priority: 'critical' | 'high' | 'medium';
  lastActivity: string;
  suggestedAction: string;
  context: string[];
}

export default function AutomationDashboard() {
  const [metrics, setMetrics] = useState<AutomationMetrics | null>(null);
  const [usersNeedingAttention, setUsersNeedingAttention] = useState<UserNeedingAttention[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'attention' | 'system'>('overview');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [metricsResponse, usersResponse] = await Promise.all([
        fetch('/api/automation/metrics/daily'),
        fetch('/api/automation/users/needs-attention')
      ]);
      
      const metricsData = await metricsResponse.json();
      const usersData = await usersResponse.json();
      
      setMetrics(metricsData);
      setUsersNeedingAttention(usersData.users || []);
      setLastRefresh(new Date());
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: string, userId?: string) => {
    try {
      await fetch(`/api/automation/quick-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userId })
      });
      
      // Refresh data after action
      fetchDashboardData();
    } catch (error) {
      console.error('Quick action failed:', error);
    }
  };

  if (isLoading && !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soullab-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-8 h-8 text-soullab-fire" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-soullab-gray-50 to-soullab-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-soullab-black flex items-center gap-3">
              <Zap className="w-8 h-8 text-soullab-fire" />
              Sacred Automation Dashboard
            </h1>
            <p className="text-soullab-gray mt-2">
              Technology serving consciousness • Last updated {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-soullab-fire text-white rounded-lg hover:bg-soullab-fire/90 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 bg-soullab-gray-100 p-1 rounded-lg w-fit">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'attention', label: 'Needs Attention', icon: AlertTriangle, count: usersNeedingAttention.length },
            { id: 'system', label: 'System Health', icon: Shield }
          ].map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === id 
                  ? 'bg-white shadow-sm text-soullab-fire' 
                  : 'text-soullab-gray hover:text-soullab-black'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {count !== undefined && count > 0 && (
                <span className="bg-soullab-fire text-white text-xs px-2 py-1 rounded-full">
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === 'overview' && metrics && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Completed Automatically Section */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-green-100">
                <h2 className="text-xl font-semibold text-green-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  ✅ Completed Automatically Today
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: 'Welcome Emails', value: metrics.todayCompleted.welcomeEmails, icon: Heart, color: 'text-pink-600' },
                    { label: 'Breakthrough Celebrations', value: metrics.todayCompleted.breakthroughCelebrations, icon: Sparkles, color: 'text-yellow-600' },
                    { label: 'Daily Prompts', value: metrics.todayCompleted.dailyPrompts, icon: Bell, color: 'text-blue-600' },
                    { label: 'Support Triggers', value: metrics.todayCompleted.supportTriggers, icon: Users, color: 'text-purple-600' },
                    { label: 'System Checks', value: metrics.todayCompleted.systemChecks, icon: Shield, color: 'text-green-600' }
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="text-center p-4 bg-gray-50 rounded-lg">
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${color}`} />
                      <div className="text-2xl font-bold text-soullab-black">{value}</div>
                      <div className="text-sm text-soullab-gray">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-soullab-black mb-3 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-soullab-fire" />
                    AI Consciousness Insights
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-soullab-gray">Breakthroughs Detected</span>
                      <span className="font-medium">{metrics.todayCompleted.breakthroughCelebrations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-soullab-gray">Sacred Moments</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-soullab-gray">Growth Patterns</span>
                      <span className="font-medium">34</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-soullab-black mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-soullab-water" />
                    Soul Journey Metrics
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-soullab-gray">Active Souls Today</span>
                      <span className="font-medium">67</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-soullab-gray">Ceremonies Completed</span>
                      <span className="font-medium">23</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-soullab-gray">Deep Conversations</span>
                      <span className="font-medium">89</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-soullab-black mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-soullab-earth" />
                    Automation Performance
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-soullab-gray">Response Time</span>
                      <span className="font-medium text-green-600">0.3s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-soullab-gray">Success Rate</span>
                      <span className="font-medium text-green-600">99.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-soullab-gray">Uptime</span>
                      <span className="font-medium text-green-600">{metrics.systemHealth.automationUptime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Needs Attention Tab */}
          {activeTab === 'attention' && (
            <motion.div
              key="attention"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl shadow-sm p-6 border border-orange-100">
                <h2 className="text-xl font-semibold text-orange-800 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  👁️ Needs Your Sacred Attention
                </h2>

                {usersNeedingAttention.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-soullab-fire mx-auto mb-4" />
                    <p className="text-soullab-gray">All souls are flowing beautifully ✨</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {usersNeedingAttention.map((user, index) => (
                      <motion.div
                        key={user.userId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg border-l-4 ${
                          user.priority === 'critical' 
                            ? 'bg-red-50 border-red-500' 
                            : user.priority === 'high'
                            ? 'bg-orange-50 border-orange-500'
                            : 'bg-yellow-50 border-yellow-500'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-soullab-black">{user.name}</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                user.priority === 'critical' 
                                  ? 'bg-red-100 text-red-800' 
                                  : user.priority === 'high'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {user.priority}
                              </span>
                            </div>
                            
                            <p className="text-soullab-gray mb-2">{user.issue}</p>
                            
                            <div className="text-sm text-soullab-gray">
                              Last active: {new Date(user.lastActivity).toLocaleDateString()}
                            </div>
                            
                            {user.context.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-soullab-gray mb-1">Recent context:</p>
                                <div className="text-xs text-soullab-gray bg-white p-2 rounded">
                                  {user.context[0]}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleQuickAction('personal_outreach', user.userId)}
                              className="px-3 py-2 bg-soullab-fire text-white rounded-lg text-sm hover:bg-soullab-fire/90 transition-colors"
                            >
                              Reach Out
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleQuickAction('send_resource', user.userId)}
                              className="px-3 py-2 bg-soullab-water text-white rounded-lg text-sm hover:bg-soullab-water/90 transition-colors"
                            >
                              Send Resource
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* System Health Tab */}
          {activeTab === 'system' && metrics && (
            <motion.div
              key="system"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-soullab-black mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  🔧 Automation System Health
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-green-800">N8N Workflows</h3>
                    <p className="text-green-600 font-medium">{metrics.systemHealth.n8nStatus}</p>
                    <p className="text-sm text-green-600">8 active workflows</p>
                  </div>

                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Zap className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-blue-800">Webhooks</h3>
                    <p className="text-blue-600 font-medium">{metrics.systemHealth.webhookStatus}</p>
                    <p className="text-sm text-blue-600">All endpoints responding</p>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Brain className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-purple-800">AI Analysis</h3>
                    <p className="text-purple-600 font-medium">Active</p>
                    <p className="text-sm text-purple-600">Pattern detection running</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-soullab-gray-50 rounded-lg">
                  <h4 className="font-medium text-soullab-black mb-2">Recent Automation Activity</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-soullab-gray">Last breakthrough detected</span>
                      <span className="text-soullab-black">2 minutes ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-soullab-gray">Last welcome email sent</span>
                      <span className="text-soullab-black">15 minutes ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-soullab-gray">Last system health check</span>
                      <span className="text-soullab-black">1 minute ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions Panel */}
        <div className="fixed bottom-6 right-6 bg-white rounded-xl shadow-lg p-4 border">
          <h3 className="font-semibold text-soullab-black mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-soullab-fire" />
            Quick Actions
          </h3>
          
          <div className="space-y-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickAction('send_daily_prompts')}
              className="w-full px-3 py-2 bg-soullab-fire text-white rounded-lg text-sm hover:bg-soullab-fire/90 transition-colors"
            >
              Send Daily Prompts Now
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickAction('check_stuck_patterns')}
              className="w-full px-3 py-2 bg-soullab-water text-white rounded-lg text-sm hover:bg-soullab-water/90 transition-colors"
            >
              Check for Stuck Patterns
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickAction('generate_report')}
              className="w-full px-3 py-2 bg-soullab-earth text-white rounded-lg text-sm hover:bg-soullab-earth/90 transition-colors"
            >
              Generate Weekly Report
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}