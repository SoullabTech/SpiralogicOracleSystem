"use client";

import { useState, useEffect } from 'react';
import { ExternalLink, Plus, MoreHorizontal } from 'lucide-react';
import { getFeaturedServices, ServiceEntry } from '@/lib/config/services.catalog';
import ServicesDrawer from './ServicesDrawer';

const ICONS = {
  MessageCircle: '💬', Moon: '🌙', Feather: '🪶', Upload: '📤', 
  Zap: '⚡', Activity: '📊', Orbit: '🪐', Stars: '⭐', Users: '👥',
  Crown: '👑', Layers: '📋', FileText: '📄', Brain: '🧠', Mic: '🎤'
};

interface FeaturedServicesGridProps {
  userId?: string;
  isAdmin?: boolean;
  maxItems?: number;
}

export default function FeaturedServicesGrid({ 
  userId, 
  isAdmin = false, 
  maxItems = 8 
}: FeaturedServicesGridProps) {
  const [featuredServices, setFeaturedServices] = useState<ServiceEntry[]>([]);
  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    setFeaturedServices(getFeaturedServices(userId, isAdmin));
  }, [userId, isAdmin]);

  const displayServices = featuredServices.slice(0, maxItems - 1); // Reserve one spot for "More"

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayServices.map(service => (
          <FeaturedServiceCard key={service.key} service={service} />
        ))}
        
        {/* More Services Card */}
        <div
          onClick={() => setShowDrawer(true)}
          className="p-6 rounded-xl border border-edge-600 bg-bg-800 hover:border-gold-400/30 hover:bg-bg-750 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-lg bg-gold-400/10 group-hover:bg-gold-400/20 transition-colors">
              <MoreHorizontal className="w-6 h-6 text-gold-400" />
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-ink-100 text-center mb-2">
            More Services
          </h3>
          
          <p className="text-sm text-ink-300 text-center">
            Discover additional features and capabilities
          </p>
        </div>
      </div>

      <ServicesDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        userId={userId}
        isAdmin={isAdmin}
      />
    </>
  );
}

function FeaturedServiceCard({ service }: { service: ServiceEntry }) {
  const icon = ICONS[service.icon as keyof typeof ICONS] || '🔧';
  const isDisabled = !service.defaultEnabled;
  
  const handleClick = () => {
    // Track usage
    fetch('/api/services/usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        serviceKey: service.key, 
        action: 'click',
        metadata: { source: 'featured_grid' }
      })
    }).catch(() => {}); // Silent fail for analytics

    if (service.routes?.primary && !isDisabled) {
      window.location.href = service.routes.primary;
    }
  };

  const handleRequestAccess = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch('/api/services/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          serviceKey: service.key,
          serviceName: service.name 
        })
      });
      // Could show toast notification here
      console.log(`Access requested for ${service.name}`);
    } catch (error) {
      console.error('Failed to request access:', error);
    }
  };

  return (
    <div 
      className={`
        p-6 rounded-xl border transition-all group cursor-pointer
        ${isDisabled 
          ? 'border-edge-700 bg-bg-900 opacity-60' 
          : 'border-edge-600 bg-bg-800 hover:border-gold-400/30 hover:bg-bg-750'
        }
      `}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-3xl">{icon}</div>
        
        <div className="flex items-center gap-2">
          {service.visibilityHint && (
            <span className={`
              px-2 py-1 rounded text-xs font-medium
              ${service.visibilityHint === 'beta' ? 'bg-blue-500/20 text-blue-400' :
                service.visibilityHint === 'experimental' ? 'bg-purple-500/20 text-purple-400' :
                'bg-green-500/20 text-green-400'}
            `}>
              {service.visibilityHint.toUpperCase()}
            </span>
          )}
          
          {service.routes?.primary && !isDisabled && (
            <ExternalLink className="w-4 h-4 text-ink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-ink-100 mb-2">
        {service.name}
      </h3>
      
      <p className="text-sm text-ink-300 line-clamp-2">
        {service.description}
      </p>
      
      {isDisabled && (
        <div className="mt-3 pt-3 border-t border-edge-700 flex items-center justify-between">
          <p className="text-xs text-ink-500">
            Service disabled
          </p>
          {service.visibilityHint === 'experimental' && (
            <button
              onClick={handleRequestAccess}
              className="text-xs text-gold-400 hover:text-gold-300 underline"
            >
              Request Access
            </button>
          )}
        </div>
      )}
    </div>
  );
}