import React, { useState } from 'react';
import {
  Flame,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Search,
  MessageSquare,
  Clock,
  CheckCircle,
  Tag,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { IncidentItem } from '../../types';

interface IncidentsViewProps {
  incidents: IncidentItem[];
  onCreateIncident: (incidentData: any) => Promise<void>;
  onUpdateIncident: (id: string, updates: any) => Promise<void>;
  onAddNote: (id: string, noteData: { content: string; actionType?: string }) => Promise<void>;
  isLoading: boolean;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({
  incidents,
  onCreateIncident,
  onUpdateIncident,
  onAddNote,
  isLoading,
}) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.id || '');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteType, setNewNoteType] = useState<'NOTE' | 'EVIDENCE' | 'STATUS_CHANGE' | 'CONTAINMENT_ACTION'>('NOTE');

  // Form State
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState<IncidentItem['severity']>('HIGH');
  const [leadAnalyst, setLeadAnalyst] = useState('Elena Rostova');
  const [mitreTag, setMitreTag] = useState('T1110.003 - Password Spraying');
  const [rootCause, setRootCause] = useState('');

  const activeIncident = incidents.find((i) => i.id === selectedIncidentId) || incidents[0];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateIncident({
      title,
      severity,
      leadAnalyst,
      mitreTag,
      rootCause,
      initialNote: 'Incident formally escalated and declared by SOC incident commander.',
    });
    setShowCreateModal(false);
    setTitle('');
    setRootCause('');
  };

  const handleSendNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || !activeIncident) return;
    await onAddNote(activeIncident.id, {
      content: newNoteContent,
      actionType: newNoteType,
    });
    setNewNoteContent('');
  };

  const handleStatusChange = async (nextStatus: IncidentItem['status']) => {
    if (!activeIncident) return;
    await onUpdateIncident(activeIncident.id, { status: nextStatus });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              INCIDENT RESPONSE LIFECYCLE
            </span>
            <span className="text-xs text-slate-400 font-mono">NIST SP 800-61 Rev. 2</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Incident Management & War Room</h1>
          <p className="text-xs text-slate-400">
            Coordinate containment actions, preserve chain-of-custody evidence, and document root cause analysis.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>DECLARE INCIDENT</span>
        </button>
      </div>

      {/* Main Layout: List & Active Incident Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Incidents List (5 columns) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase">
            Declared Incidents ({incidents.length})
          </div>
          <div className="space-y-2.5">
            {incidents.map((inc) => {
              const isSelected = activeIncident?.id === inc.id;
              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncidentId(inc.id)}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500 shadow-md shadow-cyan-950/40'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-cyan-400">
                      {inc.incidentNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      inc.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' :
                      inc.severity === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-yellow-950 text-yellow-400 border border-yellow-800'
                    }`}>
                      {inc.severity}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white font-mono mt-1.5 truncate">
                    {inc.title}
                  </h3>

                  <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-2">
                    <span className="flex items-center space-x-1">
                      <Tag className="h-3 w-3 text-slate-400" />
                      <span className="truncate max-w-[120px]">{inc.mitreTag}</span>
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                      inc.status === 'CLOSED' ? 'bg-slate-800 text-slate-400' :
                      inc.status === 'CONTAINED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {inc.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Incident War Room (7 columns) */}
        {activeIncident && (
          <div className="lg:col-span-7 p-5 rounded-xl border border-slate-800 bg-slate-900/80 space-y-4">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {activeIncident.incidentNumber}
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-xs font-mono text-slate-400">Lead: {activeIncident.leadAnalyst}</span>
                </div>
                <h2 className="text-base font-bold text-white font-mono mt-1">
                  {activeIncident.title}
                </h2>
              </div>

              {/* Status Selector */}
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="text-slate-400">Lifecycle:</span>
                <select
                  value={activeIncident.status}
                  onChange={(e) => handleStatusChange(e.target.value as any)}
                  className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="INVESTIGATING">INVESTIGATING</option>
                  <option value="CONTAINED">CONTAINED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
            </div>

            {/* Root Cause & MITRE Summary */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs font-mono space-y-1.5">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Root Cause Analysis:</span>
                <p className="text-slate-300 font-sans mt-0.5">{activeIncident.rootCause || 'Under investigation.'}</p>
              </div>
              <div className="flex items-center space-x-2 pt-1 border-t border-slate-800 text-[11px]">
                <span className="text-slate-400">MITRE ATT&CK Mapping:</span>
                <span className="text-cyan-400 font-semibold">{activeIncident.mitreTag}</span>
              </div>
            </div>

            {/* Timeline Notes */}
            <div className="space-y-2">
              <div className="text-xs font-mono font-bold text-slate-400 uppercase">
                Investigation Timeline & Evidence Log ({activeIncident.notes?.length || 0})
              </div>

              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {activeIncident.notes?.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 space-y-1 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-cyan-400">{note.author}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase ${
                          note.actionType === 'CONTAINMENT_ACTION' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          note.actionType === 'EVIDENCE' ? 'bg-indigo-950 text-indigo-400 border border-indigo-800' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {note.actionType}
                        </span>
                      </div>
                      <span>{new Date(note.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-300 font-sans text-xs">{note.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleSendNote} className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center space-x-2">
                <select
                  value={newNoteType}
                  onChange={(e) => setNewNoteType(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 font-mono outline-none focus:border-cyan-500"
                >
                  <option value="NOTE">General Note</option>
                  <option value="EVIDENCE">Preserve Evidence</option>
                  <option value="CONTAINMENT_ACTION">Containment Action</option>
                </select>
                <input
                  type="text"
                  placeholder="Record investigation findings or containment steps..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-500 font-mono"
                />
                <button
                  type="submit"
                  disabled={isLoading || !newNoteContent.trim()}
                  className="p-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white transition cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Declare Incident Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono flex items-center">
                <Flame className="h-4 w-4 mr-2 text-amber-400" />
                Declare Major Security Incident
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-slate-300">Incident Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unauthorized AWS Secrets Manager Exfiltration"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-cyan-500"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300">Lead Analyst</label>
                  <input
                    type="text"
                    value={leadAnalyst}
                    onChange={(e) => setLeadAnalyst(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">MITRE ATT&CK Technique</label>
                <input
                  type="text"
                  placeholder="e.g. T1078 - Valid Accounts"
                  value={mitreTag}
                  onChange={(e) => setMitreTag(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">Preliminary Root Cause</label>
                <textarea
                  rows={2}
                  placeholder="Describe initial breach vector or observed telemetry anomaly..."
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-cyan-500 font-sans text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition"
                >
                  Declare Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
