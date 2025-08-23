"use client";

import { useEffect, useState } from "react";
import type { AdminTrainingMetrics } from "@/lib/training/types";

export default function TrainingDashboard() {
  const [data, setData] = useState<AdminTrainingMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchMetrics() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/metrics/training");
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Failed to fetch training metrics:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMetrics();
    const id = setInterval(fetchMetrics, 30_000);
    return () => clearInterval(id);
  }, []);

  if (loading || !data) {
    return <div className="p-6 text-sm text-zinc-400">Loading training metrics…</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Training Metrics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Tile title="Sampled (1h)" value={data.throughput.sampled_1h} />
        <Tile title="Sampled (24h)" value={data.throughput.sampled_24h} />
        <Tile title="Avg Quality (24h)" value={(data.quality.avg_total_24h*100).toFixed(0) + "%"} />
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Quality Dimensions">
          <ul className="text-sm space-y-2">
            {Object.entries(data.quality.dims).map(([k,v]) => (
              <li key={k} className="flex items-center justify-between">
                <span className="capitalize">{k}</span>
                <Bar value={v} />
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Guardrails">
          <div className="text-sm space-y-2">
            <div className="flex justify-between"><span>Violations (24h)</span><span>{data.guardrails.violations_24h}</span></div>
            <div className="flex justify-between"><span>Access Level (avg)</span><span>{data.guardrails.access_level_avg.toFixed(1)}</span></div>
            <div className="text-xs text-zinc-400 mt-3">All training is summary-based and privacy-safe.</div>
          </div>
        </Card>
      </section>

      <Card title="Agent Scorecards">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.agents.map((a) => (
            <div key={a.agent} className="rounded-xl border border-zinc-800 p-4">
              <div className="text-sm text-zinc-400 capitalize">{a.agent}</div>
              <div className="text-2xl font-semibold">{(a.avg_total*100).toFixed(0)}%</div>
              <div className="text-xs text-zinc-500">{a.n} evals</div>
              <GradBadge agent={a.agent} score={a.avg_total} />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Graduation Readiness">
        <div className="space-y-3">
          {data.agents.map((a) => (
            <GradProgress key={a.agent} agent={a.agent} score={a.avg_total} count={a.n} />
          ))}
        </div>
      </Card>

      <div className="text-xs text-zinc-500">Updated {new Date(data.updated_at).toLocaleTimeString()}</div>
    </div>
  );
}

function Tile({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-zinc-800 p-4">
      <div className="text-xs text-zinc-400">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-zinc-800 p-5 bg-black/30">
      <h2 className="text-sm font-semibold mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Bar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
  return (
    <div className="flex items-center gap-2">
      <div className="w-32 h-2 bg-zinc-900 rounded-full overflow-hidden">
        <div 
          className="h-2 rounded-full transition-all duration-300" 
          style={{ 
            width: `${pct}%`, 
            background: pct >= 85 ? "#22d3ee" : pct >= 75 ? "#a78bfa" : "#f59e0b"
          }} 
        />
      </div>
      <span className="text-xs text-zinc-400 w-8">{pct}%</span>
    </div>
  );
}

function GradBadge({ agent, score }: { agent: string; score: number }) {
  const minAvg = 0.88;
  const minDims = 0.85;
  const minWindow = 200;
  
  const status = score >= minAvg ? 'ready' : score >= minDims ? 'close' : 'training';
  const colors = {
    ready: 'bg-green-500/20 text-green-400 border-green-500/30',
    close: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    training: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  };
  
  return (
    <div className={`text-xs px-2 py-1 rounded border mt-2 ${colors[status]}`}>
      {status === 'ready' ? '🎓 Ready' : status === 'close' ? '📈 Close' : '📚 Training'}
    </div>
  );
}

function GradProgress({ agent, score, count }: { agent: string; score: number; count: number }) {
  const minAvg = 0.88;
  const minWindow = 200;
  
  const avgProgress = Math.min(100, (score / minAvg) * 100);
  const countProgress = Math.min(100, (count / minWindow) * 100);
  const overallProgress = Math.min(avgProgress, countProgress);
  
  const blockedReasons = [];
  if (score < minAvg) blockedReasons.push(`Score ${(score * 100).toFixed(0)}% < 88%`);
  if (count < minWindow) blockedReasons.push(`Need ${minWindow - count} more evals`);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm capitalize font-medium">{agent}</span>
        <span className="text-xs text-zinc-400">{overallProgress.toFixed(0)}% ready</span>
      </div>
      
      <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
        <div 
          className="h-2 rounded-full transition-all duration-500"
          style={{ 
            width: `${overallProgress}%`,
            background: overallProgress >= 100 ? "#22d3ee" : overallProgress >= 80 ? "#a78bfa" : "#f59e0b"
          }}
        />
      </div>
      
      {blockedReasons.length > 0 && (
        <div className="text-xs text-zinc-500">
          Blocked: {blockedReasons.join(', ')}
        </div>
      )}
    </div>
  );
}