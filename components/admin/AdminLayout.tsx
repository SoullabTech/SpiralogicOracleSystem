"use client";

import { ReactNode, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Settings, 
  BarChart3, 
  Users, 
  Database, 
  Flag, 
  MessageSquare,
  Shield,
  Activity,
  Brain,
  Zap,
  Eye,
  AlertTriangle,
  Server,
  ChevronLeft,
  ChevronDown,
  FileText,
  Layers
} from "lucide-react";

const navSections = [
  {
    title: "System Control",
    items: [
      { icon: Layers, label: "Services", href: "/admin/services", badge: "Core" },
      { icon: Flag, label: "Feature Flags", href: "/admin/features", badge: "Legacy" },
      { icon: Settings, label: "System Settings", href: "/admin/settings", badge: null },
      { icon: Shield, label: "Security & RLS", href: "/admin/security", badge: "Critical" },
      { icon: FileText, label: "Docs", href: "/admin/docs", badge: "Review" },
    ]
  },
  {
    title: "Whispers & Memory",
    items: [
      { icon: Brain, label: "Whispers System", href: "/admin/whispers", badge: "New" },
      { icon: MessageSquare, label: "Memory Analytics", href: "/admin/memory", badge: null },
      { icon: Eye, label: "Ranking Debug", href: "/admin/ranking", badge: "Debug" },
    ]
  },
  {
    title: "Monitoring",
    items: [
      { icon: Activity, label: "System Health", href: "/admin/health", badge: "Live" },
      { icon: BarChart3, label: "Performance", href: "/admin/performance", badge: null },
      { icon: AlertTriangle, label: "Alerts & Logs", href: "/admin/alerts", badge: null },
      { icon: Server, label: "Infrastructure", href: "/admin/infrastructure", badge: null },
    ]
  },
  {
    title: "Users & Data",
    items: [
      { icon: Users, label: "User Management", href: "/admin/users", badge: null },
      { icon: Database, label: "Data Explorer", href: "/admin/data", badge: "SQL" },
      { icon: Zap, label: "API Analytics", href: "/admin/api", badge: null },
    ]
  }
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(["System Control", "Whispers & Memory"]);

  const toggleSection = (title: string) => {
    setExpandedSections(prev => 
      prev.includes(title) 
        ? prev.filter(s => s !== title)
        : [...prev, title]
    );
  };

  const getBadgeColor = (badge: string | null) => {
    switch (badge) {
      case "Core": return "bg-blue-500/20 text-blue-400";
      case "Critical": return "bg-red-500/20 text-red-400";
      case "New": return "bg-green-500/20 text-green-400";
      case "Debug": return "bg-purple-500/20 text-purple-400";
      case "Live": return "bg-yellow-500/20 text-yellow-400";
      case "SQL": return "bg-orange-500/20 text-orange-400";
      case "Review": return "bg-cyan-500/20 text-cyan-400";
      case "Legacy": return "bg-gray-500/20 text-gray-300";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-bg-950 flex">
      {/* Sidebar */}
      <div className={`${collapsed ? "w-16" : "w-72"} transition-all duration-300 bg-bg-900 border-r border-edge-700 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-edge-700 flex items-center justify-between">
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-ink-100">Admin Panel</h1>
              <p className="text-xs text-ink-400">Oracle System Control</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-edge-800 rounded-lg transition-colors"
          >
            <ChevronLeft className={`w-4 h-4 text-ink-300 transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-4">
            {navSections.map((section) => (
              <div key={section.title}>
                {!collapsed && (
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex items-center justify-between mb-2 px-2 py-1 text-xs font-medium text-ink-300 hover:text-ink-200 transition-colors"
                  >
                    {section.title}
                    <ChevronDown 
                      className={`w-3 h-3 transition-transform ${expandedSections.includes(section.title) ? "" : "-rotate-90"}`} 
                    />
                  </button>
                )}
                
                {(collapsed || expandedSections.includes(section.title)) && (
                  <ul className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      
                      return (
                        <li key={item.href}>
                          <button
                            onClick={() => router.push(item.href)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                              isActive 
                                ? "bg-gold-400/20 text-gold-400 border border-gold-400/30"
                                : "text-ink-300 hover:text-ink-200 hover:bg-edge-800"
                            }`}
                            title={collapsed ? item.label : undefined}
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            {!collapsed && (
                              <>
                                <span className="flex-1 text-left">{item.label}</span>
                                {item.badge && (
                                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getBadgeColor(item.badge)}`}>
                                    {item.badge}
                                  </span>
                                )}
                              </>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-edge-700">
          {!collapsed ? (
            <div className="text-xs text-ink-400 space-y-1">
              <div className="flex justify-between">
                <span>Environment:</span>
                <span className="text-gold-400">Development</span>
              </div>
              <div className="flex justify-between">
                <span>Version:</span>
                <span>v1.0.0</span>
              </div>
            </div>
          ) : (
            <div className="w-2 h-2 bg-green-400 rounded-full mx-auto" title="System Online" />
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-bg-900 border-b border-edge-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-ink-100">
                {navSections
                  .flatMap(s => s.items)
                  .find(item => item.href === pathname)?.label || "Admin Dashboard"}
              </h2>
              <p className="text-sm text-ink-400">
                Manage system configuration and monitor performance
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* System Status */}
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-green-400 font-medium">System Online</span>
              </div>
              
              {/* Quick Actions */}
              <button className="px-3 py-1 text-xs bg-edge-800 hover:bg-edge-700 text-ink-300 rounded-lg transition-colors">
                Export Logs
              </button>
              <button className="px-3 py-1 text-xs bg-gold-400 hover:bg-gold-300 text-bg-900 rounded-lg transition-colors">
                Emergency Stop
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}