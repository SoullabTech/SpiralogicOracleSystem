"use client";

import { useState, useEffect } from 'react';
import { Search, ArrowRight, Settings, Bell } from 'lucide-react';
import FeaturedServicesGrid from '@/components/services/FeaturedServicesGrid';

export default function HomePage() {
  const [greeting, setGreeting] = useState('');
  const [userId, setUserId] = useState<string>();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Set dynamic greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    // TODO: Get actual user data from auth context
    setUserId('user-demo-123');
    setIsAdmin(false);
  }, []);

  return (
    <div className="min-h-screen bg-bg-950">
      {/* Header */}
      <div className="bg-bg-900 border-b border-edge-700">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-ink-100">
                {greeting}
              </h1>
              <p className="text-ink-300">
                What wisdom would you like to explore today?
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-edge-800 rounded-lg transition-colors">
                <Search className="w-5 h-5 text-ink-300" />
              </button>
              <button className="p-2 hover:bg-edge-800 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-ink-300" />
              </button>
              <button className="p-2 hover:bg-edge-800 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-ink-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <QuickActionCard
              title="Start Oracle Session"
              description="Begin a conversation with deep wisdom"
              icon="💬"
              href="/oracle"
              primary
            />
            <QuickActionCard
              title="Record a Dream"
              description="Capture and weave your night visions"
              icon="🌙"
              href="/dreams/new"
            />
            <QuickActionCard
              title="Quick Capture"
              description="Save a thought, worry, or spark"
              icon="⚡"
              href="/dev/whispers"
            />
          </div>
        </div>

        {/* Featured Services */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-ink-100">
              Your Services
            </h2>
            <button
              onClick={() => window.location.href = '/services'}
              className="flex items-center gap-2 text-gold-400 hover:text-gold-300 transition-colors"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <FeaturedServicesGrid
            userId={userId}
            isAdmin={isAdmin}
            maxItems={8}
          />
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold text-ink-100 mb-6">
            Continue Your Journey
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActivityCard
              title="Recent Conversations"
              description="Pick up where you left off"
              action="View History"
              href="/oracle"
            />
            <ActivityCard
              title="Dream Journal"
              description="3 dreams awaiting your attention"
              action="Review Dreams"
              href="/dreams"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({ 
  title, 
  description, 
  icon, 
  href, 
  primary = false 
}: {
  title: string;
  description: string;
  icon: string;
  href: string;
  primary?: boolean;
}) {
  return (
    <button
      onClick={() => window.location.href = href}
      className={`
        text-left p-6 rounded-xl border transition-all group
        ${primary 
          ? 'border-gold-400/30 bg-gold-400/5 hover:bg-gold-400/10' 
          : 'border-edge-600 bg-bg-800 hover:border-gold-400/30 hover:bg-bg-750'
        }
      `}
    >
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-ink-100 mb-2">{title}</h3>
      <p className="text-sm text-ink-300">{description}</p>
      
      {primary && (
        <div className="flex items-center gap-2 mt-4 text-gold-400 group-hover:text-gold-300">
          Get started
          <ArrowRight className="w-4 h-4" />
        </div>
      )}
    </button>
  );
}

function ActivityCard({ 
  title, 
  description, 
  action, 
  href 
}: {
  title: string;
  description: string;
  action: string;
  href: string;
}) {
  return (
    <div className="p-6 rounded-xl border border-edge-600 bg-bg-800">
      <h3 className="text-lg font-semibold text-ink-100 mb-2">{title}</h3>
      <p className="text-sm text-ink-300 mb-4">{description}</p>
      
      <button
        onClick={() => window.location.href = href}
        className="flex items-center gap-2 text-gold-400 hover:text-gold-300 text-sm transition-colors"
      >
        {action}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}