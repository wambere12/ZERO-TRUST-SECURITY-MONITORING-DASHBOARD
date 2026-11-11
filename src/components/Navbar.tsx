import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Zap, 
  UserCheck, 
  RefreshCw,
  Bell,
  Cpu
} from 'lucide-react';
import { SystemMetrics } from '../types';

interface NavbarProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
  metrics: SystemMetrics | null;
  onSimulate: (scenario: 'BRUTE_FORCE' | 'IMPOSSIBLE_TRAVEL' | 'NON_COMPLIANT_ACCESS') => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  metrics,
  onSimulate,
  onRefresh,
  isLoading,
}) => {
  const riskScore = metrics?.overallRiskScore ?? 42;
  const riskColor = riskScore > 70 ? 'text-red-400 bg-red-950/50 border-red-800' :
                    riskScore > 40 ? 'text-amber-400 bg-amber-950/50 border-amber-800' :
                    'text-emerald-400 bg-emerald-950/50 border-emerald-800';

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Zero-Trust State */}
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-900/30 border border-cyan-400/30">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold tracking-wider text-slate-100 text-sm lg:text-base font-mono">DEFENSE-ZERO</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-widest bg-cyan-950 text-cyan-400 border border-cyan-800/80 uppercase">
              ZTSMD v1.0
            </span>
          </div>
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-emerald-400 font-medium">PEP/PDP ENFORCING</span>
            <span className="text-slate-600">|</span>
            <span className="hidden sm:inline text-slate-400">Never Trust, Always Verify</span>
          </div>
        </div>
      </div>

      {/* Center/Right Controls: Risk Dial, Simulators, Role Switcher */}
      <div className="flex items-center space-x-3">
        {/* Composite Org Risk Pill */}
        <div className={`hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-medium ${riskColor}`}>
          <Cpu className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '8s' }} />
          <span>ORG RISK:</span>
          <span className="font-bold text-sm">{riskScore}/100</span>
          <span className="text-[10px] uppercase font-semibold">({metrics?.riskLevel || 'HEALTHY'})</span>
        </div>

        {/* Threat Simulator Dropdown */}
        <div className="hidden lg:flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
          <span className="text-[11px] font-mono text-slate-400 px-2 flex items-center">
            <Zap className="h-3 w-3 mr-1 text-amber-400" />
            SIMULATE:
          </span>
          <button
            onClick={() => onSimulate('BRUTE_FORCE')}
            disabled={isLoading}
            className="px-2 py-1 bg-slate-800 hover:bg-red-950/80 hover:text-red-300 hover:border-red-700 text-slate-300 rounded border border-transparent transition text-xs font-medium cursor-pointer"
            title="Inject rapid failed login attack attempts"
          >
            Brute Force
          </button>
          <button
            onClick={() => onSimulate('IMPOSSIBLE_TRAVEL')}
            disabled={isLoading}
            className="px-2 py-1 bg-slate-800 hover:bg-amber-950/80 hover:text-amber-300 hover:border-amber-700 text-slate-300 rounded border border-transparent transition text-xs font-medium cursor-pointer"
            title="Inject concurrent cross-continent authentication telemetry"
          >
            Geo Anomaly
          </button>
          <button
            onClick={() => onSimulate('NON_COMPLIANT_ACCESS')}
            disabled={isLoading}
            className="px-2 py-1 bg-slate-800 hover:bg-cyan-950/80 hover:text-cyan-300 hover:border-cyan-700 text-slate-300 rounded border border-transparent transition text-xs font-medium cursor-pointer"
            title="Simulate unencrypted endpoint accessing critical infrastructure"
          >
            Posture Rejection
          </button>
        </div>

        {/* RBAC Role Switcher */}
        <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
          <UserCheck className="h-4 w-4 text-cyan-400" />
          <div className="flex flex-col text-left">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Testing Role:</span>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-200 outline-none cursor-pointer"
            >
              <option value="Super Administrator" className="bg-slate-900 text-slate-200">Super Administrator</option>
              <option value="Security Administrator" className="bg-slate-900 text-slate-200">Security Administrator</option>
              <option value="Security Analyst" className="bg-slate-900 text-slate-200">Security Analyst</option>
              <option value="IT Administrator" className="bg-slate-900 text-slate-200">IT Administrator</option>
              <option value="Employee" className="bg-slate-900 text-slate-200">Employee (Standard)</option>
            </select>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
          title="Refresh Telemetry Data"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>
    </header>
  );
};
