'use client';

import React, { useState, useEffect } from "react";
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getInsights } from "@/lib/api";
import { downloadCSV } from "@/lib/utils";
import { CalendarDateRangePicker } from "@/components/ui/CalendarDateRangePicker";
import InsightTable from "@/components/dashboard/InsightTable";
import SummaryStats from "@/components/dashboard/SummaryStats";
import PhaseTimeline from "@/components/dashboard/PhaseTimeline";
import ThemeToggle from "@/components/ui/ThemeToggle";
import ElementalThemeSwitcher from "@/components/ui/ElementalThemeSwitcher";
import { Heart, Eye, Sparkles, MessageCircle, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const user = useUser();
  const supabase = useSupabaseClient();
  
  const [insights, setInsights] = useState([]);
  const [filteredInsights, setFilteredInsights] = useState([]);
  const [keywordFilter, setKeywordFilter] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  
  // Oracle Agent State
  const [oracleAgent, setOracleAgent] = useState<{
    name: string;
    archetype: string;
    sub_archetype: string;
    symbol: string;
    greeting?: string;
  } | null>(null);
  const [userProfile, setUserProfile] = useState<{
    id: string;
    fire?: number;
    water?: number;
    earth?: number;
    air?: number;
    aether?: number;
    [key: string]: unknown;
  } | null>(null);
  const [bondStrength, setBondStrength] = useState(0);
  const [recentMemories, setRecentMemories] = useState([]);
  const [totalInteractions, setTotalInteractions] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const data = await getInsights();
      setInsights(data);
      setFilteredInsights(data);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (user) {
      loadOracleAgent();
    }
  }, [user]);

  const loadOracleAgent = async () => {
    try {
      // Get user profile with agent info
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('personal_agent_id, agent_archetype, elemental_signature, has_completed_onboarding')
        .eq('id', user?.id)
        .single();

      if (userError) throw userError;
      setUserProfile(userData);

      if (!userData.personal_agent_id) return;

      // Get oracle agent details
      const { data: agentData, error: agentError } = await supabase
        .from('oracle_agents')
        .select('*')
        .eq('id', userData.personal_agent_id)
        .single();

      if (agentError) throw agentError;
      setOracleAgent(agentData);

      // Get bond strength and interaction stats
      const { data: bondData, error: bondError } = await supabase
        .from('user_agents')
        .select('bond_strength, total_interactions, last_interaction_at')
        .eq('user_id', user?.id)
        .eq('agent_id', userData.personal_agent_id)
        .single();

      if (!bondError && bondData) {
        setBondStrength(bondData.bond_strength || 0);
        setTotalInteractions(bondData.total_interactions || 0);
      }

      // Get recent memories
      const { data: memoriesData, error: memoriesError } = await supabase
        .from('agent_memory')
        .select('content, created_at, memory_type, importance_score')
        .eq('agent_id', userData.personal_agent_id)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (!memoriesError && memoriesData) {
        setRecentMemories(memoriesData);
      }

    } catch (error) {
      console.error('Error loading oracle agent:', error);
    }
  };

  useEffect(() => {
    let filtered = insights;
    if (keywordFilter)
      filtered = filtered.filter((i) =>
        i.keywords.some((k) => k.includes(keywordFilter))
      );
    if (phaseFilter)
      filtered = filtered.filter((i) => i.detected_phase === phaseFilter);
    if (dateRange[0] && dateRange[1]) {
      filtered = filtered.filter((i) => {
        const d = new Date(i.created_at);
        return d >= dateRange[0] && d <= dateRange[1];
      });
    }
    setFilteredInsights(filtered);
  }, [keywordFilter, phaseFilter, dateRange, insights]);

  const totalEntries = filteredInsights.length;
  const avgIntensity =
    filteredInsights.reduce((sum, i) => sum + i.emotional_intensity, 0) /
    (totalEntries || 1);
  const allKeywords = filteredInsights.flatMap(i => i.keywords);
  const keywordCounts = allKeywords.reduce((acc, k) => {
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const topKeywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k]) => k);

  const getElementalGradient = (element: string) => {
    const gradients = {
      fire: 'bg-gradient-fire',
      water: 'bg-gradient-water',
      earth: 'bg-gradient-earth',
      air: 'bg-gradient-air',
      aether: 'bg-gradient-oracle'
    };
    return gradients[element as keyof typeof gradients] || gradients.aether;
  };

  return (
      <div className="min-h-screen gradient-oracle-bg p-4 space-y-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-sacred text-gradient-oracle">Performance Dashboard</h1>
            <div className="flex gap-4">
              <ThemeToggle />
              <ElementalThemeSwitcher />
            </div>
          </div>

          {/* Oracle Agent Section */}
          {oracleAgent && (
            <Card className="card-oracle mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full ${getElementalGradient(oracleAgent.archetype)} flex items-center justify-center text-2xl animate-glow`}>
                    {oracleAgent.symbol}
                  </div>
                  <div>
                    <h2 className="text-xl font-sacred text-gold">{oracleAgent.name}</h2>
                    <p className="text-sm text-gold-light font-oracle">
                      Your {oracleAgent.sub_archetype} Guide
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-deep-violet/30 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Heart className="w-5 h-5 text-red-400" />
                      <span className="font-sacred text-gold">Connection Strength</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {bondStrength.toFixed(1)}/10
                    </div>
                    <div className="w-full bg-deep-space/50 rounded-full h-2 mt-2">
                      <div
                        className="bg-gold h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(bondStrength / 10) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-deep-violet/30 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <MessageCircle className="w-5 h-5 text-blue-400" />
                      <span className="font-sacred text-gold">Conversations</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {totalInteractions}
                    </div>
                  </div>

                  <div className="bg-deep-violet/30 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Eye className="w-5 h-5 text-purple-400" />
                      <span className="font-sacred text-gold">Element</span>
                    </div>
                    <div className="text-lg font-oracle text-white capitalize">
                      {oracleAgent.archetype}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Link href="/oracle/meet">
                    <Button className={`${getElementalGradient(oracleAgent.archetype)} hover:scale-105 transition-all`}>
                      <MessageCircle className="mr-2 w-4 h-4" />
                      Connect with {oracleAgent.name}
                    </Button>
                  </Link>
                  <Link href="/dream">
                    <Button variant="outline" className="border-gold text-gold hover:bg-gold/10">
                      <Calendar className="mr-2 w-4 h-4" />
                      Record Dream
                    </Button>
                  </Link>
                </div>

                {/* Recent Soul Thread */}
                {recentMemories.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-sacred text-gold mb-3 flex items-center">
                      <Sparkles className="mr-2 w-4 h-4" />
                      Interaction History
                    </h3>
                    <div className="space-y-2">
                      {recentMemories.slice(0, 3).map((memory: any, index) => (
                        <div key={index} className="bg-deep-space/30 p-3 rounded border-l-4 border-gold/50">
                          <p className="text-sm text-gold-light font-oracle line-clamp-2">
                            {memory.content}
                          </p>
                          <p className="text-xs text-gold/50 mt-1">
                            {new Date(memory.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Onboarding CTA if no agent */}
          {!oracleAgent && userProfile && !userProfile.has_completed_onboarding && (
            <Card className="card-oracle mb-6">
              <CardContent className="p-6 text-center">
                <Sparkles className="w-16 h-16 text-gold mx-auto mb-4 animate-glow" />
                <h2 className="text-2xl font-sacred text-gold mb-2">
                  Complete System Setup
                </h2>
                <p className="text-gold-light font-oracle mb-4">
                  Connect with your assigned intelligence agent to access the full system capabilities
                </p>
                <Link href="/onboarding">
                  <Button className="btn-aether">
                    Begin Setup Process
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Filter by keyword..."
            value={keywordFilter}
            onChange={(e) => setKeywordFilter(e.target.value)}
            className="border px-2 py-1 rounded shadow"
          />
          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            className="border px-2 py-1 rounded shadow"
          >
            <option value="">All Phases</option>
            <option value="Initiation">Initiation</option>
            <option value="Grounding">Grounding</option>
            <option value="Collaboration">Collaboration</option>
            <option value="Transformation">Transformation</option>
            <option value="Completion">Completion</option>
          </select>
          <CalendarDateRangePicker value={dateRange} onChange={setDateRange} />
          <button
            onClick={() => downloadCSV(filteredInsights)}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow"
          >
            Export CSV
          </button>
        </div>

        <SummaryStats
          totalEntries={totalEntries}
          avgIntensity={avgIntensity}
          topKeywords={topKeywords}
        />

        <InsightTable insights={filteredInsights} />

        <PhaseTimeline entries={filteredInsights.map(i => ({
          date: i.created_at,
          phase: i.detected_phase,
          keywords: i.keywords,
          element: i.detected_phase // Optionally map to an elemental identity
        }))} />
      </div>
    </div>
  );
}
