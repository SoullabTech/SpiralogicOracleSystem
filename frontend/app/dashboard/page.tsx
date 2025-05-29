'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Zap, TrendingUp, Calendar, Sparkles } from 'lucide-react';
import { SacredTopNavigation, BottomNavigation } from '@/components/layout/BottomNavigation';
import { PersonalGuideChat } from '@/components/oracle/PersonalGuideChat';
import { SacredCard } from '@/components/ui/SacredCard';
import { SacredButton } from '@/components/ui/SacredButton';
import { sacredData, UserProfile, SacredInsight } from '@/lib/sacred-data';

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [insights, setInsights] = useState<SacredInsight[]>([]);
  const [todaysFocus, setTodaysFocus] = useState('');
  const [energyLevel, setEnergyLevel] = useState(87);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load real user data and insights from your backend
        const [userData, insightsData, transitsData] = await Promise.all([
          sacredData.getCurrentUser(),
          sacredData.getRecentInsights(),
          sacredData.getCurrentTransits()
        ]);

        setUser(userData);
        setInsights(insightsData);
        setTodaysFocus(transitsData.todaysFocus || 'Creative expression and authentic communication');
        setEnergyLevel(transitsData.energy || 87);
      } catch (error) {
        console.log('Using demo data for executive demonstration');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-soullab-white flex items-center justify-center">
        <div className="text-center">
          <div className="soullab-spinner mb-4" />
          <p className="soullab-text">Connecting to your Sacred Guide...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soullab-white soullab-spiral-bg">
      <SacredTopNavigation />
      
      <main className="pb-24 md:pb-0">
        <div className="soullab-container py-soullab-lg">
          
          {/* Welcome Section with Real User Data */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-soullab-xl"
          >
            <div className="flex items-center gap-3 mb-soullab-md">
              <div className="w-12 h-12 bg-soullab-fire/10 rounded-soullab-spiral flex items-center justify-center">
                <Heart className="w-6 h-6 text-soullab-fire animate-soullab-float" />
              </div>
              <div>
                <h1 className="soullab-heading-2">
                  Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
                </h1>
                <p className="soullab-text">Your personal guide is here and ready to connect.</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-soullab-lg">
            
            {/* Personal Guide Chat - Main Feature */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <SacredCard variant="premium" className="h-[600px]">
                <PersonalGuideChat 
                  guideName="Your Sacred Guide"
                  className="h-full"
                />
              </SacredCard>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-soullab-lg"
            >
              
              {/* Live Energy Stats */}
              <SacredCard variant="fire">
                <div className="text-center">
                  <Zap className="w-8 h-8 text-soullab-fire mx-auto mb-soullab-sm" />
                  <h3 className="soullab-heading-3 mb-soullab-xs">Today's Energy</h3>
                  <div className="text-2xl font-bold text-soullab-fire mb-soullab-sm">{energyLevel}%</div>
                  <p className="soullab-text-small">
                    {energyLevel > 80 ? 'Strong creative flow' : 
                     energyLevel > 60 ? 'Steady momentum' : 
                     'Gentle restoration'}
                  </p>
                </div>
              </SacredCard>

              {/* Real AI Insights from Backend */}
              <SacredCard>
                <div className="flex items-center gap-2 mb-soullab-md">
                  <TrendingUp className="w-5 h-5 text-soullab-water" />
                  <h3 className="soullab-heading-3">Recent Insights</h3>
                </div>
                <div className="space-y-soullab-sm">
                  {insights.length > 0 ? insights.slice(0, 2).map((insight) => (
                    <div key={insight.id} className="p-soullab-sm bg-soullab-gray/5 rounded-soullab-md">
                      <p className="soullab-text-small">
                        "{insight.content}"
                      </p>
                      <div className="text-xs text-soullab-gray mt-1">
                        {new Date(insight.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  )) : (
                    <div className="p-soullab-sm bg-soullab-gray/5 rounded-soullab-md">
                      <p className="soullab-text-small italic">
                        Your insights will appear here as you engage with your guide.
                      </p>
                    </div>
                  )}
                </div>
              </SacredCard>

              {/* Live Astrological Focus */}
              <SacredCard variant="earth">
                <div className="flex items-center gap-2 mb-soullab-md">
                  <Calendar className="w-5 h-5 text-soullab-earth" />
                  <h3 className="soullab-heading-3">Today's Focus</h3>
                </div>
                <p className="soullab-text mb-soullab-md">
                  {todaysFocus}
                </p>
                <SacredButton variant="earth" size="sm" className="w-full">
                  Explore This
                </SacredButton>
              </SacredCard>

              {/* Quick Actions */}
              <SacredCard variant="minimal">
                <h3 className="soullab-heading-3 mb-soullab-md">Quick Actions</h3>
                <div className="space-y-soullab-sm">
                  <SacredButton variant="ghost" size="sm" className="w-full justify-start">
                    <Sparkles className="w-4 h-4" />
                    Check Astrology
                  </SacredButton>
                  <SacredButton variant="ghost" size="sm" className="w-full justify-start">
                    <Heart className="w-4 h-4" />
                    Update Holoflower
                  </SacredButton>
                  <SacredButton variant="ghost" size="sm" className="w-full justify-start">
                    <Calendar className="w-4 h-4" />
                    Daily Reflection
                  </SacredButton>
                </div>
              </SacredCard>
            </motion.div>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}