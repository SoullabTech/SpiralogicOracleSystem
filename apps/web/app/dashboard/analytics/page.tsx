"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  TrendingUp, 
  MessageSquare, 
  Clock, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AnalyticsData {
  weeklyConversations: number[];
  totalMinutes: number;
  averageSessionLength: number;
  mostActiveDay: string;
  topTopics: Array<{ topic: string; count: number; color: string }>;
  weeklyGrowth: number;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading analytics data
    setTimeout(() => {
      setAnalytics({
        weeklyConversations: [3, 5, 2, 8, 6, 4, 7],
        totalMinutes: 487,
        averageSessionLength: 12.3,
        mostActiveDay: 'Thursday',
        topTopics: [
          { topic: 'Life Direction', count: 15, color: 'bg-purple-500' },
          { topic: 'Relationships', count: 12, color: 'bg-orange-500' },
          { topic: 'Career Growth', count: 8, color: 'bg-green-500' },
          { topic: 'Creativity', count: 6, color: 'bg-blue-500' },
          { topic: 'Spirituality', count: 4, color: 'bg-pink-500' }
        ],
        weeklyGrowth: 23
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <BarChart3 className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-white">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxConversations = Math.max(...(analytics?.weeklyConversations || [1]));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-muted-foreground">Your Oracle interaction insights</p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-background/80 backdrop-blur-xl border-purple-500/20">
            <CardContent className="p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3"
              >
                <MessageSquare className="w-6 h-6 text-purple-400" />
              </motion.div>
              <p className="text-2xl font-bold text-white mb-1">42</p>
              <p className="text-sm text-muted-foreground">Total Conversations</p>
            </CardContent>
          </Card>

          <Card className="bg-background/80 backdrop-blur-xl border-orange-500/20">
            <CardContent className="p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3"
              >
                <Clock className="w-6 h-6 text-orange-400" />
              </motion.div>
              <p className="text-2xl font-bold text-white mb-1">{analytics?.totalMinutes}m</p>
              <p className="text-sm text-muted-foreground">Total Time</p>
            </CardContent>
          </Card>

          <Card className="bg-background/80 backdrop-blur-xl border-green-500/20">
            <CardContent className="p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3"
              >
                <Activity className="w-6 h-6 text-green-400" />
              </motion.div>
              <p className="text-2xl font-bold text-white mb-1">{analytics?.averageSessionLength}m</p>
              <p className="text-sm text-muted-foreground">Avg Session</p>
            </CardContent>
          </Card>

          <Card className="bg-background/80 backdrop-blur-xl border-blue-500/20">
            <CardContent className="p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3"
              >
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </motion.div>
              <p className="text-2xl font-bold text-white mb-1">+{analytics?.weeklyGrowth}%</p>
              <p className="text-sm text-muted-foreground">Weekly Growth</p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Activity Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-background/80 backdrop-blur-xl border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <span>Weekly Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {days.map((day, index) => {
                    const conversations = analytics?.weeklyConversations[index] || 0;
                    const width = (conversations / maxConversations) * 100;
                    
                    return (
                      <div key={day} className="flex items-center space-x-3">
                        <div className="w-12 text-sm text-muted-foreground font-medium">
                          {day}
                        </div>
                        <div className="flex-1 bg-background/50 rounded-full h-6 relative overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${width}%` }}
                            transition={{ delay: 0.3 + index * 0.1, duration: 0.8 }}
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                          />
                        </div>
                        <div className="w-8 text-sm text-white font-semibold">
                          {conversations}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Topics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-background/80 backdrop-blur-xl border-orange-500/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="w-5 h-5 text-orange-400" />
                  <span>Top Discussion Topics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.topTopics.map((topic, index) => (
                    <motion.div
                      key={topic.topic}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center space-x-3"
                    >
                      <div className={`w-3 h-3 rounded-full ${topic.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {topic.topic}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {topic.count}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Insights Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-background/80 backdrop-blur-xl border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <span>AI Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <h4 className="font-medium text-white mb-2">Most Active Time</h4>
                  <p className="text-sm text-muted-foreground">
                    You engage most deeply on {analytics?.mostActiveDay}s, suggesting this is when you&apos;re most 
                    receptive to guidance and reflection.
                  </p>
                </div>
                
                <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <h4 className="font-medium text-white mb-2">Growth Pattern</h4>
                  <p className="text-sm text-muted-foreground">
                    Your Oracle interactions have increased by {analytics?.weeklyGrowth}% this week, 
                    indicating growing trust and integration with your digital wisdom companion.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}