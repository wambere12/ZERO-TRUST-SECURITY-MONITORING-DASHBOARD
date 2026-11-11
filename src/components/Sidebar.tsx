import React from 'react';
import {
  LayoutDashboard,
  Users,
  Laptop,
  KeyRound,
  Activity,
  Crosshair,
  AlertOctagon,
  Flame,
  FileCheck2,
  Sliders,
  BarChart3,
  BookOpen,
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'users'
  | 'devices'
  | 'access-control'
  | 'security-events'
  | 'threat-detection'
  | 'security-alerts'
  | 'incidents'
  | 'audit-logs'
  | 'security-policies'
  | 'reports'
  | 'phase1-architecture';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  criticalAlertCount: number;
  openIncidentCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  criticalAlertCount,
  openIncidentCount,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ElementType; badge?: number; badgeColor?: string }[] = [
    { id: 'overview', label: '1. Overview', icon: LayoutDashboard },
    { id: 'users', label: '2. Users & IAM', icon: Users },
    { id: 'devices', label: '3. Devices & Endpoints', icon: Laptop },
    { id: 'access-control', label: '4. Zero-Trust Access', icon: KeyRound },
    { id: 'security-events', label: '5. Security Events', icon: Activity },
    { id: 'threat-detection', label: '6. Threat Detection', icon: Crosshair },
    { 
      id: 'security-alerts', 
      label: '7. Security Alerts', 
      icon: AlertOctagon,
      badge: criticalAlertCount > 0 ? criticalAlertCount : undefined,
      badgeColor: 'bg-red-500 text-white'
    },
    { 
      id: 'incidents', 
      label: '8. Incidents', 
      icon: Flame,
      badge: openIncidentCount > 0 ? openIncidentCount : undefined,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold'
    },
    { id: 'audit-logs', label: '9. Audit Logs', icon: FileCheck2 },
    { id: 'security-policies', label: '10. Security Policies', icon: Sliders },
    { id: 'reports', label: '11. Reports & Analytics', icon: BarChart3 },
    { id: 'phase1-architecture', label: '12. Phase 1 Architecture', icon: BookOpen },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col shrink-0 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="p-3">
        <div className="px-3 py-2 text-[10px] font-mono tracking-wider uppercase text-slate-400 font-bold">
          Zero-Trust Security Suite
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/80 shadow-sm shadow-cyan-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Zero-Trust Architecture Badge & Status in footer */}
      <div className="mt-auto p-4 border-t border-slate-800/80 bg-slate-900/40">
        <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 text-xs font-mono space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400">FRAMEWORK</span>
            <span className="text-[10px] text-cyan-400 font-semibold">NIST SP 800-207</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400">ISOLATION</span>
            <span className="text-[10px] text-emerald-400 font-semibold">Postgres RLS</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400">HASH INTEGRITY</span>
            <span className="text-[10px] text-indigo-400 font-semibold">SHA-256 Valid</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
