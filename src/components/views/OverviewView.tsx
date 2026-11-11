import React from 'react';
import {
  Users,
  Laptop,
  AlertTriangle,
  Flame,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  KeyRound,
  ShieldCheck,
  TrendingUp,
  Activity,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { SystemMetrics, SecurityEventItem, SecurityAlertItem } from '../../types';

interface OverviewViewProps {
  metrics: SystemMetrics | null;
  events: SecurityEventItem[];
  alerts: SecurityAlertItem[];
  onNavigate: (tab: any) => void;
  onSimulate: (scenario: 'BRUTE_FORCE' | 'IMPOSSIBLE_TRAVEL' | 'NON_COMPLIANT_ACCESS') => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  metrics,
  events,
  alerts,
  onNavigate,
  onSimulate,
}) => {
  const riskScore = metrics?.overallRiskScore ?? 42;
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL');

  // Chart data
  const activityData = [
    { time: '02:00', allowed: 120, denied: 4, mfa: 18, risk: 22 },
    { time: '06:00', allowed: 240, denied: 14, mfa: 42, risk: 38 },
    { time: '10:00', allowed: 780, denied: 19, mfa: 110, risk: 35 },
    { time: '14:00', allowed: 890, denied: 32, mfa: 135, risk: 48 },
    { time: '18:00', allowed: 620, denied: 28, mfa: 90, risk: 44 },
    { time: '22:00', allowed: 310, denied: 45, mfa: 60, risk: 52 },
  ];

  const severityData = [
    { name: 'Critical', count: alerts.filter(a => a.severity === 'CRITICAL').length, color: '#ef4444' },
    { name: 'High', count: alerts.filter(a => a.severity === 'HIGH').length, color: '#f97316' },
    { name: 'Medium', count: alerts.filter(a => a.severity === 'MEDIUM').length, color: '#eab308' },
    { name: 'Low', count: alerts.filter(a => a.severity === 'LOW').length, color: '#3b82f6' },
  ];

  const complianceData = [
    { name: 'Compliant & Trusted', value: metrics?.compliantDevices ?? 4, color: '#10b981' },
    { name: 'Untrusted Posture', value: (metrics?.untrustedDevices ?? 2), color: '#f59e0b' },
    { name: 'Quarantined / Blocked', value: (metrics?.blockedDevices ?? 1), color: '#ef4444' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Zero-Trust Posture & Quick Simulation */}
      <div className="p-4 lg:p-6 rounded-xl border border-cyan-900/50 bg-gradient-to-r from-slate-900 via-slate-950 to-cyan-950/40 relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-900/60 text-cyan-300 border border-cyan-700/60">
                ACTIVE ZERO-TRUST TELEMETRY
              </span>
              <span className="text-xs text-slate-400 font-mono">Continuous Adaptive Risk & Trust (CARTA)</span>
            </div>
            <h1 className="text-xl lg:text-2xl font-extrabold text-white mt-1">
              Zero-Trust Security Command Center
            </h1>
            <p className="text-xs lg:text-sm text-slate-400 max-w-2xl mt-1">
              Real-time Policy Enforcement Point (PEP) monitoring identities, endpoint posture, network anomalies, and access evaluation decisions across enterprise perimeters.
            </p>
          </div>

          {/* Quick Simulation Trigger Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg">
            <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-mono font-semibold">
              <Zap className="h-4 w-4" />
              <span>TEST ENGINE:</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => onSimulate('BRUTE_FORCE')}
                className="px-2.5 py-1 text-xs bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800 rounded font-medium transition cursor-pointer"
              >
                Brute Force
              </button>
              <button
                onClick={() => onSimulate('IMPOSSIBLE_TRAVEL')}
                className="px-2.5 py-1 text-xs bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-800 rounded font-medium transition cursor-pointer"
              >
                Geo Travel
              </button>
              <button
                onClick={() => onSimulate('NON_COMPLIANT_ACCESS')}
                className="px-2.5 py-1 text-xs bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border border-cyan-800 rounded font-medium transition cursor-pointer"
              >
                Reject Posture
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 10 Core Security Metric Cards (Section 5) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
        {/* Metric 1: Registered Users */}
        <div 
          onClick={() => onNavigate('users')}
          className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Users</span>
            <Users className="h-4 w-4 text-cyan-400 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white font-mono">{metrics?.totalUsers ?? 6}</span>
            <span className="text-[10px] text-emerald-400 font-mono">
              {metrics?.activeUsers ?? 6} active
            </span>
          </div>
        </div>

        {/* Metric 2: Devices & Trust */}
        <div 
          onClick={() => onNavigate('devices')}
          className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Devices</span>
            <Laptop className="h-4 w-4 text-blue-400 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white font-mono">{metrics?.totalDevices ?? 5}</span>
            <span className="text-[10px] text-cyan-400 font-mono">
              {metrics?.trustedDevices ?? 2} trusted / {metrics?.blockedDevices ?? 1} blocked
            </span>
          </div>
        </div>

        {/* Metric 3: Device Compliance */}
        <div 
          onClick={() => onNavigate('devices')}
          className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Compliance Rate</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-400 font-mono">
              {metrics ? Math.round((metrics.compliantDevices / metrics.totalDevices) * 100) : 40}%
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {metrics?.compliantDevices ?? 2}/{metrics?.totalDevices ?? 5} compliant
            </span>
          </div>
        </div>

        {/* Metric 4: Critical Alerts */}
        <div 
          onClick={() => onNavigate('security-alerts')}
          className="p-4 rounded-xl border border-red-900/60 bg-red-950/20 hover:border-red-800 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-red-300">Critical Alerts</span>
            <AlertTriangle className="h-4 w-4 text-red-400 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-red-400 font-mono">{metrics?.criticalAlerts ?? 1}</span>
            <span className="text-[10px] text-red-300 font-mono">Requires Triage</span>
          </div>
        </div>

        {/* Metric 5: Open Incidents */}
        <div 
          onClick={() => onNavigate('incidents')}
          className="p-4 rounded-xl border border-amber-900/60 bg-amber-950/20 hover:border-amber-800 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300">Open Incidents</span>
            <Flame className="h-4 w-4 text-amber-400 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-400 font-mono">{metrics?.openIncidents ?? 2}</span>
            <span className="text-[10px] text-amber-300 font-mono">Active Response</span>
          </div>
        </div>

        {/* Metric 6: Security Events */}
        <div 
          onClick={() => onNavigate('security-events')}
          className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Events</span>
            <Activity className="h-4 w-4 text-indigo-400 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white font-mono">{metrics?.totalEvents ?? 5}</span>
            <span className="text-[10px] text-indigo-400 font-mono">Streaming Live</span>
          </div>
        </div>

        {/* Metric 7: Failed Login Attempts */}
        <div 
          onClick={() => onNavigate('security-events')}
          className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Failed Logins</span>
            <XCircle className="h-4 w-4 text-orange-400 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-orange-400 font-mono">{metrics?.failedLogins ?? 14}</span>
            <span className="text-[10px] text-orange-300 font-mono">Spray Detected</span>
          </div>
        </div>

        {/* Metric 8: Denied Access Decisions */}
        <div 
          onClick={() => onNavigate('access-control')}
          className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Access Denied</span>
            <ShieldAlert className="h-4 w-4 text-rose-400 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-400 font-mono">{metrics?.deniedDecisions ?? 1}</span>
            <span className="text-[10px] text-slate-400 font-mono">
              vs {metrics?.allowedDecisions ?? 2} Allowed
            </span>
          </div>
        </div>

        {/* Metric 9: MFA Challenges */}
        <div 
          onClick={() => onNavigate('access-control')}
          className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Step-Up MFA</span>
            <KeyRound className="h-4 w-4 text-cyan-400 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-cyan-400 font-mono">{metrics?.mfaDecisions ?? 1}</span>
            <span className="text-[10px] text-cyan-300 font-mono">Enforced Step-Up</span>
          </div>
        </div>

        {/* Metric 10: Security Risk Score */}
        <div 
          onClick={() => onNavigate('reports')}
          className="p-4 rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Posture Risk</span>
            <TrendingUp className="h-4 w-4 text-purple-400 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-2xl font-bold font-mono ${riskScore > 70 ? 'text-red-400' : riskScore > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {riskScore}/100
            </span>
            <span className="text-[10px] uppercase font-mono text-slate-400">
              {metrics?.riskLevel?.split(' ')[0] || 'HEALTHY'}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Charts Section (Section 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart: Authentication & Policy Decisions Over Time */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-slate-800 bg-slate-900/70">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center">
                <Activity className="h-4 w-4 mr-2 text-cyan-400" />
                Zero-Trust Access Decisions & Telemetry Activity
              </h2>
              <p className="text-xs text-slate-400">24-hour evaluation timeline: Allowed, Denied, and MFA challenges</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              PDP ENGINE V1
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorAllowed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDenied" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMfa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Area type="monotone" dataKey="allowed" name="Allowed" stroke="#10b981" fillOpacity={1} fill="url(#colorAllowed)" strokeWidth={2} />
                <Area type="monotone" dataKey="mfa" name="Step-Up MFA" stroke="#06b6d4" fillOpacity={1} fill="url(#colorMfa)" strokeWidth={2} />
                <Area type="monotone" dataKey="denied" name="Denied" stroke="#ef4444" fillOpacity={1} fill="url(#colorDenied)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center justify-center space-x-6 text-xs font-mono">
            <span className="flex items-center text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5"></span> Allowed
            </span>
            <span className="flex items-center text-cyan-400">
              <span className="h-2 w-2 rounded-full bg-cyan-500 mr-1.5"></span> Step-Up MFA
            </span>
            <span className="flex items-center text-rose-400">
              <span className="h-2 w-2 rounded-full bg-rose-500 mr-1.5"></span> Denied Policy
            </span>
          </div>
        </div>

        {/* Secondary Chart: Device Compliance Posture */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center">
                <Laptop className="h-4 w-4 mr-2 text-emerald-400" />
                Endpoint Compliance Posture
              </h2>
            </div>
            <p className="text-xs text-slate-400">Encryption, EDR agent, OS patch status</p>
          </div>

          <div className="h-44 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complianceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {complianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs font-mono border-t border-slate-800 pt-3">
            {complianceData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="flex items-center text-slate-400">
                  <span className="h-2 w-2 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold text-slate-200">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Active Security Alerts & Live Telemetry Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Security Alerts */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Critical & High Security Alerts
              </h2>
            </div>
            <button
              onClick={() => onNavigate('security-alerts')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono transition"
            >
              View All ({alerts.length}) →
            </button>
          </div>

          <div className="space-y-2.5">
            {alerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                onClick={() => onNavigate('security-alerts')}
                className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 hover:border-slate-700 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 truncate pr-2">{alert.title}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    alert.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' :
                    alert.severity === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-blue-950 text-blue-400 border border-blue-800'
                  }`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{alert.description}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
                  <span>Source: {alert.sourceUser}</span>
                  <span>IP: {alert.sourceIp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Real-Time Telemetry Feed */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Live Zero-Trust Event Stream
              </h2>
            </div>
            <button
              onClick={() => onNavigate('security-events')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono transition"
            >
              View Stream →
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {events.slice(0, 5).map((evt) => (
              <div key={evt.id} className="p-2.5 rounded-lg border border-slate-800/80 bg-slate-950/50 flex items-start justify-between text-xs font-mono">
                <div className="space-y-0.5 truncate pr-2">
                  <div className="flex items-center space-x-2">
                    <span className={`font-semibold ${
                      evt.severity === 'CRITICAL' ? 'text-red-400' :
                      evt.severity === 'HIGH' ? 'text-amber-400' :
                      evt.severity === 'MEDIUM' ? 'text-yellow-400' :
                      'text-emerald-400'
                    }`}>
                      [{evt.eventType}]
                    </span>
                    <span className="text-slate-300 truncate">{evt.userName}</span>
                  </div>
                  <p className="text-slate-400 truncate text-[11px]">{evt.description}</p>
                </div>
                <div className="text-right shrink-0 text-[10px] text-slate-400">
                  <div>{evt.location}</div>
                  <div>{evt.sourceIp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
