import React, { useState } from 'react';
import {
  Activity,
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Clock,
  MapPin,
  Laptop,
} from 'lucide-react';
import { SecurityEventItem } from '../../types';

interface SecurityEventsViewProps {
  events: SecurityEventItem[];
  isLoading: boolean;
}

export const SecurityEventsView: React.FC<SecurityEventsViewProps> = ({ events, isLoading }) => {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.eventType.toLowerCase().includes(search.toLowerCase()) ||
      e.userName.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.sourceIp.includes(search);
    const matchesSeverity = severityFilter === 'ALL' || e.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              AUDITABLE TELEMETRY STREAM
            </span>
            <span className="text-xs text-slate-400 font-mono">Real-Time Ingestion</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Security Events & Authentication Logs</h1>
          <p className="text-xs text-slate-400">
            Continuous recording of login attempts, password changes, MFA challenges, policy denies, and administrative activities.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Streaming Live ({events.length} Captured)</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by event type, user, IP, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-mono text-slate-400 whitespace-nowrap">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500 font-mono w-full sm:w-auto"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="INFO">INFO</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Event Identifier</th>
                <th className="py-2.5 px-3">Subject & Device</th>
                <th className="py-2.5 px-3">Telemetry Description</th>
                <th className="py-2.5 px-3">IP & Location</th>
                <th className="py-2.5 px-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      evt.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' :
                      evt.severity === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      evt.severity === 'MEDIUM' ? 'bg-yellow-950 text-yellow-400 border border-yellow-800' :
                      'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {evt.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-200">{evt.eventType}</div>
                    <div className="text-[10px] text-slate-400">{evt.id}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-slate-200 font-semibold">{evt.userName}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{evt.deviceName || 'N/A'}</div>
                  </td>
                  <td className="py-3 px-3 max-w-xs">
                    <p className="text-slate-300 font-sans text-xs truncate">{evt.description}</p>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-cyan-400">{evt.sourceIp}</div>
                    <div className="text-[10px] text-slate-400 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {evt.location}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-400 whitespace-nowrap">
                    {new Date(evt.timestamp).toLocaleTimeString()}
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
