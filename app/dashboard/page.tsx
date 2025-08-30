"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Crown, 
  MessageCircle, 
  BarChart3, 
  Calendar, 
  Sparkles,
  TrendingUp,
  Clock,
  Target,
  Settings,
  User
} from 'lucide-react';

interface DashboardStats {
  conversations: number;
  insights: number;
  growth: string;
  sessions: number;
}

interface RecentActivity {
  time: string;
  action: string;
  type: 'chat' | 'astrology' | 'journal' | 'voice';
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    conversations: 0,
    insights: 0,
    growth: '+0%',
    sessions: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard data
    setTimeout(() => {
      setStats({
        conversations: 42,
        insights: 127,
        growth: '+23%',
        sessions: 18
      });
      setRecentActivity([
        { time: '2 hours ago', action: 'Oracle conversation about life direction', type: 'chat' },
        { time: '1 day ago', action: 'Completed astrology reading', type: 'astrology' },
        { time: '2 days ago', action: 'Journal entry: Morning reflections', type: 'journal' },
        { time: '3 days ago', action: 'Voice session with Maya', type: 'voice' }
      ]);
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
            className="w-16 h-16 bg-gradient-to-br from-purple-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Crown className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-white">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-muted-foreground">Your Oracle journey overview</p>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/oracle/settings">
                <Button variant="outline" size="sm" className="border-purple-500/20 hover:bg-purple-500/10">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" size="sm" className="border-orange-500/20 hover:bg-orange-500/10">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-background/80 backdrop-blur-xl border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversations</p>
                  <motion.p 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="text-2xl font-bold text-white"
                  >
                    {stats.conversations}
                  </motion.p>
                </div>
                <MessageCircle className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/80 backdrop-blur-xl border-orange-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Insights</p>
                  <motion.p 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="text-2xl font-bold text-white"
                  >
                    {stats.insights}
                  </motion.p>
                </div>
                <Sparkles className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/80 backdrop-blur-xl border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Growth</p>
                  <motion.p 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="text-2xl font-bold text-white"
                  >
                    {stats.growth}
                  </motion.p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/80 backdrop-blur-xl border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sessions</p>
                  <motion.p 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                    className="text-2xl font-bold text-white"
                  >
                    {stats.sessions}
                  </motion.p>
                </div>
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Recent Activity */}
          <Card className="lg:col-span-2 bg-background/80 backdrop-blur-xl border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-purple-400" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      item.type === 'chat' ? 'bg-purple-400' :
                      item.type === 'astrology' ? 'bg-orange-400' :
                      item.type === 'journal' ? 'bg-green-400' :
                      'bg-blue-400'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm text-white">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-background/80 backdrop-blur-xl border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-purple-400" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href="/oracle">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600">
                    <Crown className="w-4 h-4 mr-2" />
                    Chat with Oracle
                  </Button>
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href="/dashboard/astrology">
                  <Button variant="outline" className="w-full border-orange-500/20 hover:bg-orange-500/10">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Astrology Reading
                  </Button>
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href="/journal">
                  <Button variant="outline" className="w-full border-green-500/20 hover:bg-green-500/10">
                    <Calendar className="w-4 h-4 mr-2" />
                    Write Journal
                  </Button>
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href="/dashboard/analytics">
                  <Button variant="outline" className="w-full border-blue-500/20 hover:bg-blue-500/10">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}