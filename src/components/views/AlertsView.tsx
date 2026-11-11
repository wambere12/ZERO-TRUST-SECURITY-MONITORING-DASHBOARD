import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle,
  XCircle,
  Zap,
  User,
  Clock,
  ShieldX,
  RotateCcw,
} from 'lucide-react';
import { SecurityAlertItem } from '../../types';

interface AlertsViewProps {
  alerts: SecurityAlertItem[];
  onUpdateAlert: (id: string, updates: any) => Promise<void>;
  onMitigateAlert: (id: string, actionType: string) => Promise<void>;
  isLoading: boolean;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onUpdateAlert,
  onMitigateAlert,
  isLoading,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredAlerts = alerts.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.sourceUser.toLowerCase().includes(search.toLowerCase()) ||
      a.sourceIp.includes(search) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (alert: SecurityAlertItem, nextStatus: SecurityAlertItem['status']) => {
    await onUpdateAlert(alert.id, { status: nextStatus });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              SOC TRIAGE & MITIGATION
            </span>
            <span className="text-xs text-slate-400 font-mono">Immediate Automated Containment</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Security Alerts & Incident Queue</h1>
          <p className="text-xs text-slate-400">
            Investigate suspicious activities, assign lead analysts, and execute 1-click zero-trust containment playbooks.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          Active Alerts: <strong className="text-cyan-400">{alerts.length}</strong>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search alerts by title, affected user, IP address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-mono text-slate-400 whitespace-nowrap">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500 font-mono w-full sm:w-auto"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">NEW</option>
            <option value="INVESTIGATING">INVESTIGATING</option>
            <option value="CONTAINED">CONTAINED</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="FALSE_POSITIVE">FALSE POSITIVE</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition space-y-4"
          >
            {/* Top row: Title, severity, rule code */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-3">
                <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase ${
                  alert.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' :
                  alert.severity === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                  alert.severity === 'MEDIUM' ? 'bg-yellow-950 text-yellow-400 border border-yellow-800' :
                  'bg-blue-950 text-blue-400 border border-blue-800'
                }`}>
                  {alert.severity}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">{alert.title}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">Rule: {alert.ruleCode}</span>
                </div>
              </div>

              {/* Status Selector */}
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="text-slate-400">Status:</span>
                <select
                  value={alert.status}
                  onChange={(e) => handleStatusChange(alert, e.target.value as any)}
                  className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="NEW">NEW</option>
                  <option value="INVESTIGATING">INVESTIGATING</option>
                  <option value="CONTAINED">CONTAINED</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="FALSE_POSITIVE">FALSE POSITIVE</option>
                </select>
              </div>
            </div>

            {/* Description & Technical Findings */}
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {alert.description}
            </p>

            {/* Context Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs font-mono p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-slate-300">
              <div>
                <span className="text-slate-400 text-[10px] block">TARGET USER:</span>
                <span className="truncate block font-semibold">{alert.sourceUser}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">SOURCE DEVICE:</span>
                <span className="truncate block font-semibold">{alert.sourceDevice}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">SOURCE IP:</span>
                <span className="text-cyan-400 font-semibold">{alert.sourceIp}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">ASSIGNED ANALYST:</span>
                <span className="text-slate-300">{alert.assignedAnalyst}</span>
              </div>
            </div>

            {/* Recommended Response & One-Click Mitigation Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="text-xs font-mono text-slate-400">
                <span className="text-amber-400 font-semibold">Recommended Playbook: </span>
                {alert.recommendedAction}
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => onMitigateAlert(alert.id, 'QUARANTINE_DEVICE')}
                  disabled={isLoading}
                  className="px-2.5 py-1.5 rounded bg-red-950 hover:bg-red-900 text-red-200 border border-red-800 text-xs font-mono font-medium transition cursor-pointer flex items-center space-x-1"
                >
                  <ShieldX className="h-3.5 w-3.5" />
                  <span>Quarantine Device</span>
                </button>
                <button
                  onClick={() => onMitigateAlert(alert.id, 'RESET_USER_SESSIONS')}
                  disabled={isLoading}
                  className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-medium transition cursor-pointer flex items-center space-x-1"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Revoke Sessions</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
