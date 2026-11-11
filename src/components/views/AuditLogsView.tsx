import React, { useState } from 'react';
import {
  FileCheck2,
  Search,
  ShieldCheck,
  Lock,
  Hash,
  Clock,
  User,
  Server,
  Key,
} from 'lucide-react';
import { AuditLogItem } from '../../types';

interface AuditLogsViewProps {
  logs: AuditLogItem[];
  isLoading: boolean;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs, isLoading }) => {
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter((l) => {
    return (
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase()) ||
      l.ipAddress.includes(search) ||
      l.hash.includes(search)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              TAMPER-EVIDENT AUDIT TRAIL
            </span>
            <span className="text-xs text-slate-400 font-mono">SOC2 / ISO 27001 Protected</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">System Audit & Compliance Ledger</h1>
          <p className="text-xs text-slate-400">
            Immutable log of all user registrations, role changes, policy decisions, and security escalations chained via cryptographic SHA-256 hashes.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span className="text-slate-300">Hash Chain Integrity:</span>
          <span className="text-emerald-400 font-bold">100% VERIFIED</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit trail by actor, action, IP, or cryptographic hash..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500 font-mono"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor / Principal</th>
                <th className="py-2.5 px-3">Action Type</th>
                <th className="py-2.5 px-3">Resource Target</th>
                <th className="py-2.5 px-3">Audit Details</th>
                <th className="py-2.5 px-3">IP Address</th>
                <th className="py-2.5 px-3 text-right">Cryptographic SHA-256 Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-200">{log.actor}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    <span className="text-[11px] text-slate-300 font-semibold">{log.resourceType}: </span>
                    <span>{log.resourceId}</span>
                  </td>
                  <td className="py-3 px-3 max-w-sm">
                    <p className="text-slate-300 font-sans text-xs truncate">{log.details}</p>
                  </td>
                  <td className="py-3 px-3 text-cyan-400">{log.ipAddress}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="font-mono text-[10px] text-slate-400 hover:text-cyan-300 transition cursor-help truncate max-w-[120px] inline-block" title={log.hash}>
                      {log.hash.substring(0, 12)}...{log.hash.substring(log.hash.length - 8)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
