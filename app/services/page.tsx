"use client";

import { useState, useEffect } from 'react';
import { 
  MessageCircle, Moon, Feather, Upload, Zap, Activity, Orbit, Stars, Users,
  Crown, Layers, FileText, Brain, Search, Filter, ExternalLink, Lock,
  BookOpen, Compass, Focus, Link, Sparkles, MoreHorizontal, Shield
} from 'lucide-react';
import { 
  getServicesBySection, 
  getFeaturedServices, 
  getVisibleServicesForUser,
  SECTION_INFO, 
  ServiceEntry,
  Section 
} from '@/lib/config/services.catalog';

const ICONS: Record<string, any> = {
  MessageCircle, Moon, Feather, Upload, Zap, Activity, Orbit, Stars, Users,
  Crown, Layers, FileText, Brain, Search, Filter, ExternalLink, Lock,
  BookOpen, Compass, Focus, Link, Sparkles, MoreHorizontal, Shield, Mic: MessageCircle
};

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<Section | 'all'>('all');
  const [visibleServices, setVisibleServices] = useState<ServiceEntry[]>([]);
  const [servicesBySection, setServicesBySection] = useState<Record<Section, ServiceEntry[]>>({} as any);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // TODO: Get actual user ID and admin status from auth
    const userId = 'user-demo-123'; // Replace with actual user ID
    const adminStatus = false; // Replace with actual admin check
    
    setIsAdmin(adminStatus);
    setVisibleServices(getVisibleServicesForUser(userId, adminStatus));
    setServicesBySection(getServicesBySection());
  }, []);

  const filteredSections = Object.entries(servicesBySection).filter(([sectionKey, services]) => {
    const section = sectionKey as Section;
    
    // Filter by selected section
    if (selectedSection !== 'all' && section !== selectedSection) return false;
    
    // Filter by search query
    if (searchQuery) {
      const hasMatch = services.some(service => 
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (!hasMatch) return false;
    }
    
    // Filter by visibility
    const visibleServicesInSection = services.filter(service => 
      visibleServices.some(v => v.key === service.key)
    );
    
    return visibleServicesInSection.length > 0;
  });

  const getFilteredServicesInSection = (services: ServiceEntry[]) => {
    return services.filter(service => {
      // Visibility check
      if (!visibleServices.some(v => v.key === service.key)) return false;
      
      // Search query check
      if (searchQuery && !service.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !service.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  };

  return (
    <div className="min-h-screen bg-bg-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink-100 mb-2">Services Catalog</h1>
          <p className="text-ink-300 text-lg">
            Discover and access all available features and capabilities
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-bg-800 border border-edge-700 rounded-lg text-ink-100 placeholder-ink-400 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 focus:outline-none"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto">
            <FilterButton
              active={selectedSection === 'all'}
              onClick={() => setSelectedSection('all')}
            >
              All
            </FilterButton>
            {Object.entries(SECTION_INFO).map(([section, info]) => (
              <FilterButton
                key={section}
                active={selectedSection === section}
                onClick={() => setSelectedSection(section as Section)}
              >
                {info.name}
              </FilterButton>
            ))}
          </div>
        </div>

        {/* Services Grid by Section */}
        <div className="space-y-8">
          {filteredSections.map(([sectionKey, services]) => {
            const section = sectionKey as Section;
            const sectionInfo = SECTION_INFO[section];
            const filteredServices = getFilteredServicesInSection(services);
            
            if (filteredServices.length === 0) return null;

            return (
              <div key={section}>
                <div className="flex items-center gap-3 mb-4">
                  {ICONS[sectionInfo.icon] && (
                    <span className="text-gold-400">
                      {(() => {
                        const IconComponent = ICONS[sectionInfo.icon];
                        return <IconComponent className="w-5 h-5" />;
                      })()}
                    </span>
                  )}
                  <h2 className="text-xl font-semibold text-ink-100">
                    {sectionInfo.name}
                  </h2>
                  <span className="text-ink-400 text-sm">
                    ({filteredServices.length})
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredServices.map((service) => (
                    <ServiceCard key={service.key} service={service} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {filteredSections.length === 0 && (
          <div className="text-center py-12">
            <div className="text-ink-400 mb-4">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-ink-200 mb-2">No services found</h3>
            <p className="text-ink-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ServiceCard({ service }: { service: ServiceEntry }) {
  const IconComponent = ICONS[service.icon || 'MoreHorizontal'];
  const isDisabled = !service.defaultEnabled;
  
  const handleClick = () => {
    if (service.routes?.primary && !isDisabled) {
      window.location.href = service.routes.primary;
    }
  };

  return (
    <div 
      className={`
        rounded-xl border p-6 transition-all duration-200 cursor-pointer
        ${isDisabled 
          ? 'border-edge-700 bg-bg-900 opacity-60' 
          : 'border-edge-600 bg-bg-800 hover:border-gold-400/30 hover:bg-bg-750'
        }
      `}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`
            p-2 rounded-lg 
            ${isDisabled ? 'bg-edge-700' : 'bg-gold-400/10'}
          `}>
            <IconComponent className={`
              w-5 h-5 
              ${isDisabled ? 'text-ink-400' : 'text-gold-400'}
            `} />
          </div>
          
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
        </div>
        
        {isDisabled && <Lock className="w-4 h-4 text-ink-500" />}
        {service.routes?.primary && !isDisabled && (
          <ExternalLink className="w-4 h-4 text-ink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-ink-100 mb-2">
        {service.name}
      </h3>
      
      <p className="text-sm text-ink-300 mb-4 line-clamp-2">
        {service.description}
      </p>
      
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {service.perfCost && (
            <span className={`
              px-2 py-1 rounded
              ${service.perfCost === 'low' ? 'bg-green-500/20 text-green-400' :
                service.perfCost === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'}
            `}>
              {service.perfCost.toUpperCase()}
            </span>
          )}
          
          {service.audience === 'admin' && (
            <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400">
              ADMIN
            </span>
          )}
        </div>
        
        {service.entryPoints && (
          <div className="text-ink-500">
            {service.entryPoints.length} entry point{service.entryPoints.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
      
      {isDisabled && (
        <div className="mt-3 pt-3 border-t border-edge-700">
          <p className="text-xs text-ink-500">
            Service disabled by administrator
          </p>
        </div>
      )}
    </div>
  );
}

function FilterButton({ 
  children, 
  active, 
  onClick 
}: { 
  children: React.ReactNode; 
  active: boolean; 
  onClick: () => void; 
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
        ${active 
          ? 'bg-gold-400 text-bg-900' 
          : 'bg-bg-800 text-ink-300 hover:bg-bg-700 hover:text-ink-200'
        }
      `}
    >
      {children}
    </button>
  );
}