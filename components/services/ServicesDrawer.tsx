"use client";

import { useState, useEffect } from 'react';
import { X, ExternalLink, Lock, Search } from 'lucide-react';
import { 
  getServicesInMore, 
  getServicesBySection, 
  ServiceEntry,
  SECTION_INFO 
} from '@/lib/config/services.catalog';

const ICONS = {
  MessageCircle: '💬', Moon: '🌙', Feather: '🪶', Upload: '📤', 
  Zap: '⚡', Activity: '📊', Orbit: '🪐', Stars: '⭐', Users: '👥',
  Crown: '👑', Layers: '📋', FileText: '📄', Brain: '🧠', Mic: '🎤'
};

interface ServicesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  isAdmin?: boolean;
}

export default function ServicesDrawer({ isOpen, onClose, userId, isAdmin = false }: ServicesDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [moreServices, setMoreServices] = useState<ServiceEntry[]>([]);
  const [servicesBySection, setServicesBySection] = useState<Record<string, ServiceEntry[]>>({});

  useEffect(() => {
    if (isOpen) {
      setMoreServices(getServicesInMore(userId, isAdmin));
      setServicesBySection(getServicesBySection());
    }
  }, [isOpen, userId, isAdmin]);

  const filteredServices = moreServices.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedServices = filteredServices.reduce((acc, service) => {
    if (!acc[service.section]) acc[service.section] = [];
    acc[service.section].push(service);
    return acc;
  }, {} as Record<string, ServiceEntry[]>);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-bg-900 border-l border-edge-700 z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-edge-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-ink-100">More Services</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-edge-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-ink-300" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              placeholder="Search additional services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-bg-800 border border-edge-700 rounded-lg text-ink-100 placeholder-ink-400 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 focus:outline-none"
            />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {Object.keys(groupedServices).length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-lg font-medium text-ink-200 mb-2">All caught up!</h3>
              <p className="text-ink-400 text-sm">
                You have access to all available services. Check back later for new features.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedServices).map(([section, services]) => {
                const sectionInfo = SECTION_INFO[section as keyof typeof SECTION_INFO];
                if (!sectionInfo) return null;
                
                return (
                  <div key={section}>
                    <h3 className="text-sm font-medium text-ink-300 mb-3 uppercase tracking-wide">
                      {sectionInfo.name}
                    </h3>
                    <div className="space-y-2">
                      {services.map(service => (
                        <ServiceDrawerCard key={service.key} service={service} onClose={onClose} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-edge-700">
          <button
            onClick={() => {
              window.location.href = '/services';
              onClose();
            }}
            className="w-full px-4 py-2 bg-gold-400 hover:bg-gold-300 text-bg-900 rounded-lg font-medium transition-colors"
          >
            View Full Catalog
          </button>
        </div>
      </div>
    </>
  );
}

function ServiceDrawerCard({ service, onClose }: { service: ServiceEntry; onClose: () => void }) {
  const isDisabled = !service.defaultEnabled;
  const icon = ICONS[service.icon as keyof typeof ICONS] || '🔧';
  
  const handleClick = () => {
    if (service.routes?.primary && !isDisabled) {
      window.location.href = service.routes.primary;
      onClose();
    }
  };

  return (
    <div 
      className={`
        p-4 rounded-lg border cursor-pointer transition-all
        ${isDisabled 
          ? 'border-edge-700 bg-bg-800 opacity-60' 
          : 'border-edge-600 bg-bg-800 hover:border-gold-400/30 hover:bg-bg-750'
        }
      `}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{icon}</div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-ink-100 truncate">{service.name}</h4>
            
            {service.visibilityHint && (
              <span className={`
                px-1.5 py-0.5 rounded text-xs font-medium
                ${service.visibilityHint === 'beta' ? 'bg-blue-500/20 text-blue-400' :
                  service.visibilityHint === 'experimental' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-green-500/20 text-green-400'}
              `}>
                {service.visibilityHint.toUpperCase()}
              </span>
            )}
            
            {isDisabled && <Lock className="w-3 h-3 text-ink-500" />}
            {service.routes?.primary && !isDisabled && (
              <ExternalLink className="w-3 h-3 text-ink-400" />
            )}
          </div>
          
          <p className="text-sm text-ink-300 line-clamp-2">
            {service.description}
          </p>
          
          {isDisabled && (
            <p className="text-xs text-ink-500 mt-2">
              Service disabled by administrator
            </p>
          )}
        </div>
      </div>
    </div>
  );
}