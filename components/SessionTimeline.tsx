'use client';

import { useEffect, useState } from 'react';
import { Soulprint, SoulJourneyMilestone } from '@/lib/beta/SoulprintTracking';

interface TimelineEvent {
  id: string;
  timestamp: Date;
  type: 'milestone' | 'symbol' | 'phase' | 'archetype' | 'ritual';
  title: string;
  description: string;
  significance?: 'minor' | 'major' | 'pivotal';
  element?: string;
  icon: string;
  color: string;
}

interface SessionTimelineProps {
  soulprint: Soulprint;
  maxEvents?: number;
  showFilters?: boolean;
}

export function SessionTimeline({ soulprint, maxEvents = 50, showFilters = true }: SessionTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<TimelineEvent[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const allEvents = buildTimelineEvents(soulprint);
    setEvents(allEvents);
    setFilteredEvents(allEvents);
  }, [soulprint]);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(e => e.type === filter));
    }
  }, [filter, events]);

  const buildTimelineEvents = (sp: Soulprint): TimelineEvent[] => {
    const timeline: TimelineEvent[] = [];

    // Milestones
    sp.milestones.forEach((m, i) => {
      timeline.push({
        id: `milestone-${i}`,
        timestamp: m.timestamp,
        type: 'milestone',
        title: `${m.type}`,
        description: m.description,
        significance: m.significance,
        element: m.element,
        icon: getMilestoneIcon(m.type),
        color: getSignificanceColor(m.significance)
      });
    });

    // Phase transitions
    sp.phaseHistory.forEach((p, i) => {
      if (i > 0) {
        timeline.push({
          id: `phase-${i}`,
          timestamp: p.startedAt,
          type: 'phase',
          title: `Entered ${p.phase}`,
          description: `Phase transition: ${sp.phaseHistory[i-1].phase} → ${p.phase}`,
          icon: '🌀',
          color: 'text-purple-600'
        });
      }
    });

    // Archetype shifts
    sp.archetypeHistory.forEach((a, i) => {
      timeline.push({
        id: `archetype-${i}`,
        timestamp: a.timestamp,
        type: 'archetype',
        title: `${a.toArchetype} emerges`,
        description: a.trigger || `Archetype shift: ${a.fromArchetype || 'unknown'} → ${a.toArchetype}`,
        icon: '🎭',
        color: a.shadowWork ? 'text-gray-800' : 'text-blue-600'
      });
    });

    // New symbols (first appearance only)
    sp.activeSymbols.forEach((s, i) => {
      timeline.push({
        id: `symbol-${i}`,
        timestamp: s.firstAppeared,
        type: 'symbol',
        title: s.symbol,
        description: s.context[0] || 'New symbol emerged',
        element: s.elementalResonance,
        icon: getElementIcon(s.elementalResonance),
        color: 'text-teal-600'
      });
    });

    // Rituals
    sp.ritualsCompleted.forEach((r, i) => {
      timeline.push({
        id: `ritual-${i}`,
        timestamp: r.completedAt,
        type: 'ritual',
        title: r.ritual,
        description: `Ritual completed with ${(r.depth * 100).toFixed(0)}% depth`,
        element: r.element,
        icon: '🔥',
        color: 'text-orange-600'
      });
    });

    // Breakthrough moments
    sp.breakthroughMoments.forEach((b, i) => {
      timeline.push({
        id: `breakthrough-${i}`,
        timestamp: b.timestamp,
        type: 'milestone',
        title: 'Breakthrough',
        description: b.description,
        significance: 'major',
        icon: '✨',
        color: 'text-yellow-500'
      });
    });

    // Sort by timestamp (newest first)
    return timeline.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, maxEvents);
  };

  const getMilestoneIcon = (type: string): string => {
    const icons: Record<string, string> = {
      breakthrough: '⚡',
      threshold: '🚪',
      integration: '🔗',
      'shadow-encounter': '🌑',
      awakening: '🌅'
    };
    return icons[type] || '🌟';
  };

  const getSignificanceColor = (sig: string): string => {
    const colors: Record<string, string> = {
      minor: 'text-gray-500',
      major: 'text-blue-600',
      pivotal: 'text-purple-700'
    };
    return colors[sig] || 'text-gray-600';
  };

  const getElementIcon = (element?: string): string => {
    const icons: Record<string, string> = {
      fire: '🔥',
      water: '💧',
      earth: '🌍',
      air: '💨',
      aether: '✨'
    };
    return element ? icons[element] : '🔮';
  };

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Journey Timeline</h2>
          <p className="text-sm text-gray-500">
            {events.length} events • {soulprint.phaseHistory.length} phases
          </p>
        </div>

        {showFilters && (
          <div className="flex gap-2">
            <FilterButton label="All" value="all" current={filter} onClick={setFilter} />
            <FilterButton label="Milestones" value="milestone" current={filter} onClick={setFilter} />
            <FilterButton label="Symbols" value="symbol" current={filter} onClick={setFilter} />
            <FilterButton label="Phases" value="phase" current={filter} onClick={setFilter} />
            <FilterButton label="Archetypes" value="archetype" current={filter} onClick={setFilter} />
            <FilterButton label="Rituals" value="ritual" current={filter} onClick={setFilter} />
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-300 via-blue-300 to-teal-300" />

        {/* Events */}
        <div className="space-y-6">
          {filteredEvents.map((event, index) => (
            <div key={event.id} className="relative pl-12">
              {/* Icon */}
              <div className="absolute left-0 w-8 h-8 bg-white rounded-full border-2 border-purple-300 flex items-center justify-center shadow-sm">
                <span className="text-lg">{event.icon}</span>
              </div>

              {/* Content */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold ${event.color}`}>{event.title}</h3>
                      {event.element && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                          {event.element}
                        </span>
                      )}
                      {event.significance && (
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          event.significance === 'pivotal' ? 'bg-purple-100 text-purple-700' :
                          event.significance === 'major' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {event.significance}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{event.description}</p>
                  </div>

                  <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                    {formatTimestamp(event.timestamp)}
                  </span>
                </div>

                {/* Type badge */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 text-xs rounded bg-gray-50 text-gray-600 border border-gray-200">
                    {event.type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No {filter === 'all' ? '' : filter} events found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterButton({
  label,
  value,
  current,
  onClick
}: {
  label: string;
  value: string;
  current: string;
  onClick: (value: string) => void;
}) {
  const isActive = current === value;

  return (
    <button
      onClick={() => onClick(value)}
      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
        isActive
          ? 'bg-purple-100 border-purple-300 text-purple-700 font-medium'
          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}