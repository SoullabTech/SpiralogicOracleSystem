"use client";

import { useEffect, useState } from "react";
import { X, Award } from "lucide-react";

interface Badge {
  code: string;
  name: string;
  tagline: string;
  category: string;
  icon: string;
  color: string;
  awardedAt: string;
}

interface BadgeToastProps {
  badge: Badge | null;
  onClose: () => void;
  duration?: number;
}

export function BadgeToast({ badge, onClose, duration = 8000 }: BadgeToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (badge) {
      setIsVisible(true);
      setIsLeaving(false);
      
      // Auto-hide after duration
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [badge, duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!badge || !isVisible) return null;

  const colorMap: Record<string, string> = {
    emerald: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-300",
    violet: "from-violet-500/20 to-violet-600/10 border-violet-500/30 text-violet-300",
    sky: "from-sky-500/20 to-sky-600/10 border-sky-500/30 text-sky-300",
    amber: "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-300",
    rose: "from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-300",
    cyan: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-300",
    fuchsia: "from-fuchsia-500/20 to-fuchsia-600/10 border-fuchsia-500/30 text-fuchsia-300",
    zinc: "from-zinc-500/20 to-zinc-600/10 border-zinc-500/30 text-zinc-300",
    lime: "from-lime-500/20 to-lime-600/10 border-lime-500/30 text-lime-300",
  };

  const badgeColorClass = colorMap[badge.color] || colorMap.emerald;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div
        className={`
          bg-gradient-to-br ${badgeColorClass}
          backdrop-blur-sm border rounded-2xl p-4 shadow-xl
          transform transition-all duration-300 ease-out
          ${isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
          ${isVisible ? 'animate-in slide-in-from-right' : ''}
        `}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold mb-1">
                🎉 Badge Earned!
              </div>
              <div className="text-base font-semibold mb-1">
                {badge.name}
              </div>
              <div className="text-xs opacity-90 leading-relaxed">
                {badge.tagline}
              </div>
              <div className="text-xs opacity-70 mt-2 capitalize">
                {badge.category} • {new Date(badge.awardedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200"
            aria-label="Close notification"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white/30 rounded-full animate-badge-progress"
            style={{ 
              animation: `badgeProgress ${duration}ms linear forwards`
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes badgeProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

// Hook to manage badge toast state
export function useBadgeToast() {
  const [currentBadge, setCurrentBadge] = useState<Badge | null>(null);
  const [badgeQueue, setBadgeQueue] = useState<Badge[]>([]);

  const showBadge = (badge: Badge) => {
    if (currentBadge) {
      // Queue badge if one is already showing
      setBadgeQueue(prev => [...prev, badge]);
    } else {
      setCurrentBadge(badge);
    }
  };

  const hideBadge = () => {
    setCurrentBadge(null);
    
    // Show next badge in queue
    setTimeout(() => {
      if (badgeQueue.length > 0) {
        const nextBadge = badgeQueue[0];
        setBadgeQueue(prev => prev.slice(1));
        setCurrentBadge(nextBadge);
      }
    }, 500);
  };

  return {
    currentBadge,
    showBadge,
    hideBadge,
    queueLength: badgeQueue.length
  };
}