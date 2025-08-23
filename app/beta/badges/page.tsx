"use client";

import { useEffect, useState } from "react";
import { Award, Calendar, Target, TrendingUp, Sparkles, ArrowRight } from "lucide-react";

interface Badge {
  code: string;
  name: string;
  tagline: string;
  category: string;
  icon: string;
  color: string;
  awardedAt: string;
}

interface BadgeProgress {
  code: string;
  name: string;
  progressPercent: number;
  description: string;
  completed: boolean;
}

interface BadgeData {
  badges: Badge[];
  progress: BadgeProgress[];
  total: number;
}

export default function BetaBadgesPage() {
  const [data, setData] = useState<BadgeData | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchBadges() {
    try {
      const res = await fetch("/api/beta/badges");
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Failed to fetch badges:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBadges();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-zinc-400">Loading badges...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-zinc-400">Failed to load badges</div>
        </div>
      </div>
    );
  }

  const categoryGroups = data.badges.reduce((acc, badge) => {
    if (!acc[badge.category]) acc[badge.category] = [];
    acc[badge.category].push(badge);
    return acc;
  }, {} as Record<string, Badge[]>);

  const progressByCategory = data.progress.reduce((acc, prog) => {
    const badge = data.badges.find(b => b.code === prog.code);
    const category = badge?.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(prog);
    return acc;
  }, {} as Record<string, BadgeProgress[]>);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-emerald-400" />
            <h1 className="text-3xl font-bold">Beta Tester Badges</h1>
          </div>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Recognition for exploring, caring, and helping shape the Oracle's growth. 
            These badges celebrate meaningful interactions, not just volume.
          </p>
          
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>{data.total} earned</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-violet-400" />
              <span>{data.progress.length} in progress</span>
            </div>
          </div>
        </div>

        {/* Earned Badges */}
        {data.total > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              Your Collection
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.badges.map((badge) => (
                <BadgeCard key={badge.code} badge={badge} />
              ))}
            </div>
          </section>
        )}

        {/* Progress Towards New Badges */}
        {data.progress.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-400" />
              In Progress
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.progress.map((prog) => (
                <ProgressCard key={prog.code} progress={prog} />
              ))}
            </div>
          </section>
        )}

        {/* Graduation Constellation Card */}
        {data.total >= 5 && !data.badges?.some(b => b.id === 'GRADUATED_PIONEER') && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              Your Constellation
            </h2>
            
            <div className="rounded-2xl border border-violet-800/60 bg-gradient-to-br from-violet-900/20 to-purple-900/10 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-violet-300 mb-2">
                    Ready for Graduation Ceremony
                  </h3>
                  <p className="text-violet-200/80 mb-4">
                    Your {data.total} badges have formed a constellation pattern. 
                    Experience a sacred ceremony to graduate from the beta program.
                  </p>
                  <div className="text-sm text-violet-300/60 mb-4">
                    ✨ Constellation weaving • Badge synthesis • Pioneer graduation
                  </div>
                </div>
                <div className="text-4xl ml-4">
                  🌟
                </div>
              </div>
              
              <a
                href="/beta/graduation"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg font-semibold text-white hover:from-violet-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                Begin Graduation Ceremony
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </section>
        )}

        {/* Graduated Pioneer Display */}
        {data.badges?.some(b => b.id === 'GRADUATED_PIONEER') && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              Graduated Pioneer
            </h2>
            
            <div className="rounded-2xl border border-emerald-800/60 bg-gradient-to-br from-emerald-900/20 to-green-900/10 p-6">
              <div className="flex items-center gap-4">
                <div className="text-5xl">🎓</div>
                <div>
                  <h3 className="text-lg font-semibold text-emerald-300 mb-2">
                    Constellation Complete
                  </h3>
                  <p className="text-emerald-200/80">
                    You have successfully completed your beta journey and graduated to pioneer status. 
                    Your constellation of {data.total} badges represents your unique path through consciousness exploration.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Empty State */}
        {data.total === 0 && data.progress.length === 0 && (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-zinc-900 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-300">Start Your Journey</h3>
            <p className="text-zinc-500 max-w-md mx-auto">
              Begin exploring the Oracle to start earning badges. Each meaningful interaction 
              brings you closer to recognition.
            </p>
          </div>
        )}

        {/* Categories Legend */}
        <div className="text-center space-y-2">
          <h3 className="text-sm font-semibold text-zinc-400">Badge Categories</h3>
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              exploration
            </span>
            <span className="px-2 py-1 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
              depth
            </span>
            <span className="px-2 py-1 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
              insight
            </span>
            <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              care
            </span>
            <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              systems
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

function BadgeCard({ badge }: { badge: Badge }) {
  const colorMap: Record<string, string> = {
    emerald: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30",
    violet: "from-violet-500/20 to-violet-600/10 border-violet-500/30",
    sky: "from-sky-500/20 to-sky-600/10 border-sky-500/30",
    amber: "from-amber-500/20 to-amber-600/10 border-amber-500/30",
    rose: "from-rose-500/20 to-rose-600/10 border-rose-500/30",
    cyan: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30",
    fuchsia: "from-fuchsia-500/20 to-fuchsia-600/10 border-fuchsia-500/30",
    zinc: "from-zinc-500/20 to-zinc-600/10 border-zinc-500/30",
    lime: "from-lime-500/20 to-lime-600/10 border-lime-500/30",
  };

  const gradientClass = colorMap[badge.color] || colorMap.emerald;

  return (
    <div className={`
      bg-gradient-to-br ${gradientClass}
      backdrop-blur-sm border rounded-2xl p-5 
      transform hover:scale-105 transition-all duration-200
    `}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
          <Award className="w-6 h-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm mb-1">{badge.name}</div>
          <div className="text-xs opacity-90 leading-relaxed mb-2">
            {badge.tagline}
          </div>
          <div className="flex items-center justify-between text-xs opacity-70">
            <span className="capitalize">{badge.category}</span>
            <span>
              <Calendar className="w-3 h-3 inline mr-1" />
              {new Date(badge.awardedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressCard({ progress }: { progress: BadgeProgress }) {
  return (
    <div className="border border-zinc-800 rounded-2xl p-5 bg-black/30">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-semibold text-sm">{progress.name}</div>
          <div className="text-xs text-zinc-400">{progress.description}</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold">{progress.progressPercent.toFixed(0)}%</div>
        </div>
      </div>
      
      <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
        <div 
          className="h-2 rounded-full transition-all duration-500"
          style={{ 
            width: `${progress.progressPercent}%`,
            background: progress.progressPercent >= 100 ? "#22d3ee" : 
                       progress.progressPercent >= 75 ? "#a78bfa" : "#f59e0b"
          }}
        />
      </div>
    </div>
  );
}