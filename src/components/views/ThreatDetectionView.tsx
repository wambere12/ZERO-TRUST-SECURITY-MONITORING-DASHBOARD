import React from 'react';
import {
  Crosshair,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Flame,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Code,
  Tag,
} from 'lucide-react';
import { DetectionRuleItem } from '../../types';

interface ThreatDetectionViewProps {
  rules: DetectionRuleItem[];
  onToggleRule: (id: string, isActive: boolean) => Promise<void>;
  isLoading: boolean;
}

export const ThreatDetectionView: React.FC<ThreatDetectionViewProps> = ({
  rules,
  onToggleRule,
  isLoading,
}) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              DETERMINISTIC RULE CORRELATION
            </span>
            <span className="text-xs text-slate-400 font-mono">MITRE ATT&CK Framework Mapped</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Threat Detection Engine</h1>
          <p className="text-xs text-slate-400">
            Transparent, rule-based correlation inspecting authentication velocity, impossible geo-travel, quarantined hardware, and privilege escalations.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
          <span>{rules.filter(r => r.isActive).length} / {rules.length} Rules Active</span>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => {
          return (
            <div
              key={rule.id}
              className={`p-5 rounded-xl border transition flex flex-col justify-between ${
                rule.isActive
                  ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/40 border-slate-800/50 opacity-60'
              }`}
            >
              <div>
                {/* Header: Rule Code & Toggle */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                        {rule.code}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        rule.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' :
                        rule.severity === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-yellow-950 text-yellow-400 border border-yellow-800'
                      }`}>
                        {rule.severity}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white font-mono mt-1">
                      {rule.name}
                    </h3>
                  </div>

                  <button
                    onClick={() => onToggleRule(rule.id, !rule.isActive)}
                    disabled={isLoading}
                    className="cursor-pointer text-slate-400 hover:text-white transition"
                    title={rule.isActive ? 'Disable rule' : 'Enable rule'}
                  >
                    {rule.isActive ? (
                      <ToggleRight className="h-7 w-7 text-cyan-400" />
                    ) : (
                      <ToggleLeft className="h-7 w-7 text-slate-600" />
                    )}
                  </button>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 font-sans mt-3 leading-relaxed">
                  {rule.description}
                </p>

                {/* MITRE Mapping */}
                <div className="mt-4 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs font-mono space-y-1 text-slate-400">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-3 w-3 text-cyan-400" />
                    <span className="text-[11px]">Tactic: <strong className="text-slate-200">{rule.mitreTactic}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Code className="h-3 w-3 text-indigo-400" />
                    <span className="text-[11px]">Technique: <strong className="text-slate-200">{rule.mitreTechnique}</strong></span>
                  </div>
                </div>
              </div>

              {/* Footer: Triggers count & State */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">
                  Lifetime Alerts Fired: <strong className="text-white">{rule.triggerCount}</strong>
                </span>
                <span className={rule.isActive ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {rule.isActive ? 'MONITORING ACTIVE' : 'DISABLED'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
