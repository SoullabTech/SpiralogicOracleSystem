'use client';

import { useEffect, useState } from 'react';
import { Badge, CheckCircle2, Compass, Users, Sparkles, ArrowRight } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface StarterStep {
  key: string;
  label: string;
  completed: boolean;
}

export default function BetaJoinPage() {
  const { data: status, mutate } = useSWR('/api/beta/status', fetcher);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setMsg(null);
  }, [code]);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    
    try {
      const res = await fetch('/api/beta/join', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code: code.trim() })
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json?.error || 'Join failed');
      }
      
      setMsg({ 
        text: json.message || 'Welcome to the Soullab Beta! Pioneer badge unlocked ✨', 
        type: 'success' 
      });
      mutate();
    } catch (err: any) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setBusy(false);
    }
  }

  if (!status) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-sm text-zinc-400">Loading…</div>
      </div>
    );
  }

  const authed = status.user_id && status.status !== 'anon';
  const inBeta = status.status === 'beta';
  const graduated = status.status === 'graduated';

  const starterSteps: StarterStep[] = [
    { key: 'first_conversation', label: 'Say Hello to the Oracle', completed: !!status.flags?.first_conversation },
    { key: 'voice_play', label: 'Try a Voice Response', completed: !!status.flags?.voice_play },
    { key: 'soul_save', label: 'Save a Soul Memory', completed: !!status.flags?.soul_save },
    { key: 'weave_created', label: 'Weave a Thread', completed: !!status.flags?.weave_created },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-6">
        
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Compass className="w-8 h-8 text-emerald-400" />
            <h1 className="text-3xl font-bold">Join Soullab Beta</h1>
          </div>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
            Welcome to the consciousness revolution. Use your invite to unlock the Beta Starter Pack 
            and begin your journey with gamified badges that celebrate meaningful exploration.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Left Column - Join Process */}
          <div className="space-y-6">
            
            {/* Authentication Status */}
            {!authed && (
              <div className="rounded-2xl border border-zinc-800 p-6 bg-zinc-900/50">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Sign In Required
                </h3>
                <p className="text-zinc-400 mb-4">Please sign in to join the beta program.</p>
                <a
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 hover:bg-blue-400 transition font-medium"
                  href="/auth/signin"
                >
                  Sign In <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* Beta Status Cards */}
            {authed && graduated && (
              <div className="rounded-2xl border border-emerald-800/60 bg-emerald-900/20 p-6">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Beta Graduate
                </h3>
                <p className="text-emerald-300/80">
                  Congratulations! You've graduated from the beta program. Your account is now a regular profile.
                </p>
                <div className="mt-4">
                  <a
                    href="/oracle"
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 hover:bg-emerald-400 transition font-medium"
                  >
                    Continue to Oracle <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}

            {authed && inBeta && (
              <div className="rounded-2xl border border-emerald-800/60 bg-emerald-900/10 p-6">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Badge className="w-5 h-5 text-emerald-400" />
                  Welcome, Beta Tester!
                </h3>
                <p className="text-emerald-300/80 mb-3">
                  You're already in the beta program. Complete your Starter Pack to unlock more badges.
                </p>
                <div className="text-sm text-emerald-300/60">
                  Starter Pack: {status.starter_pack_complete ? 'Complete ✓' : 'In Progress'}
                </div>
                <div className="text-sm text-emerald-300/60">
                  Badges earned: {status.badges?.length || 0}
                </div>
              </div>
            )}

            {/* Join Form */}
            {authed && !inBeta && !graduated && (
              <form onSubmit={handleJoin} className="rounded-2xl border border-zinc-800 p-6 bg-zinc-900/50">
                <h3 className="text-lg font-semibold mb-4">Join with Invite Code</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-300">
                      Beta Invite Code
                    </label>
                    <input
                      className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-3 outline-none focus:border-emerald-400 transition font-mono"
                      placeholder="SLBETA-XXXX"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      disabled={busy}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-semibold hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    disabled={busy || !code.trim()}
                  >
                    {busy ? 'Joining…' : 'Join Beta Program'}
                  </button>
                  
                  {msg && (
                    <div className={`text-sm p-3 rounded-lg ${
                      msg.type === 'success' 
                        ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-800/50' 
                        : 'bg-red-900/30 text-red-300 border border-red-800/50'
                    }`}>
                      {msg.text}
                    </div>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Right Column - Starter Pack & Info */}
          <div className="space-y-6">
            
            {/* Starter Pack Progress */}
            <div className="rounded-2xl border border-zinc-800 p-6 bg-zinc-900/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-400" />
                Beta Starter Pack
              </h3>
              <div className="space-y-3">
                {starterSteps.map((step, index) => (
                  <div 
                    key={step.key} 
                    className={`flex items-center gap-3 p-3 rounded-lg transition ${
                      step.completed 
                        ? 'bg-emerald-900/30 border border-emerald-800/50' 
                        : 'bg-zinc-800/50 border border-zinc-700/50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      step.completed 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-zinc-700 text-zinc-400'
                    }`}>
                      {step.completed ? '✓' : index + 1}
                    </div>
                    <span className={step.completed ? 'text-emerald-300' : 'text-zinc-300'}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
              
              {authed && inBeta && (
                <div className="mt-6">
                  <a
                    href="/oracle"
                    className="inline-flex items-center gap-2 rounded-lg bg-violet-500 px-4 py-2 hover:bg-violet-400 transition font-medium w-full justify-center"
                  >
                    Continue Journey <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>

            {/* Badge Preview */}
            {status.badges && status.badges.length > 0 && (
              <div className="rounded-2xl border border-zinc-800 p-6 bg-zinc-900/50">
                <h3 className="text-lg font-semibold mb-4">Your Badges</h3>
                <div className="grid grid-cols-2 gap-3">
                  {status.badges.slice(0, 4).map((badge: any) => (
                    <div key={badge.id} className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800/50">
                      <span className="text-lg">{badge.emoji}</span>
                      <span className="text-sm font-medium">{badge.name}</span>
                    </div>
                  ))}
                </div>
                {status.badges.length > 4 && (
                  <div className="mt-3 text-center">
                    <a href="/beta/badges" className="text-sm text-violet-400 hover:text-violet-300">
                      View all {status.badges.length} badges →
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* What is Beta */}
            <div className="rounded-2xl border border-zinc-800 p-6 bg-zinc-900/50">
              <h3 className="text-lg font-semibold mb-4">Why Join Our Beta?</h3>
              <div className="space-y-3 text-sm text-zinc-300">
                <div className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>Early access to consciousness technology features</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>Gamified exploration with meaningful badges</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>Shape the future of AI-assisted consciousness work</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>Seamless graduation to regular account</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-zinc-800">
          <p className="text-sm text-zinc-500">
            Your beta progress will carry over when you graduate to a regular account.
          </p>
        </div>
      </div>
    </div>
  );
}