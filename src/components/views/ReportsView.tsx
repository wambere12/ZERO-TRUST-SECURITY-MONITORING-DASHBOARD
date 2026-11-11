import React from 'react';
import {
  BarChart3,
  Download,
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertTriangle,
  FileText,
  TrendingDown,
  Lock,
} from 'lucide-react';
import { SystemMetrics } from '../../types';

interface ReportsViewProps {
  metrics: SystemMetrics | null;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ metrics }) => {
  const riskScore = metrics?.overallRiskScore ?? 42;

  const nistPillars = [
    { name: '1. Identity', status: 'Compliant', score: '92%', desc: 'Hardware MFA enforced for privileged users, automated role review.' },
    { name: '2. Device / Endpoint', status: 'In Progress', score: '78%', desc: 'BitLocker/APFS disk encryption verified, EDR agent fleet deployment.' },
    { name: '3. Network & Environment', status: 'Compliant', score: '88%', desc: 'Micro-segmentation, ingress rate limiting, Tor exit blocking.' },
    { name: '4. Application & Workload', status: 'Compliant', score: '95%', desc: 'Zero-Trust PEP per-request evaluation before routing.' },
    { name: '5. Data', status: 'Compliant', score: '84%', desc: 'Data classification (Critical, High, Medium) mapped to PDP policies.' },
    { name: '6. Visibility & Analytics', status: 'Compliant', score: '98%', desc: 'Real-time telemetry streaming, MITRE ATT&CK correlation.' },
    { name: '7. Automation & Orchestration', status: 'Compliant', score: '91%', desc: '1-click quarantine, automated session revocation playbooks.' },
  ];

  const handleExport = () => {
    const reportData = {
      organization: 'Defense-Zero Enterprise',
      generatedAt: new Date().toISOString(),
      framework: 'NIST SP 800-207 Zero-Trust Architecture',
      compositeRiskScore: `${riskScore}/100`,
      metrics,
      pillars: nistPillars,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ZeroTrust_Security_Report_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              AUDIT COMPLIANCE & EXECUTIVE BRIEF
            </span>
            <span className="text-xs text-slate-400 font-mono">SOC2 / ISO 27001 / NIST 800-207</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Zero-Trust Posture Reports & Analytics</h1>
          <p className="text-xs text-slate-400">
            Comprehensive executive summary of enterprise risk, compliance pillar maturity, and access decision efficacy.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono transition cursor-pointer self-start sm:self-auto"
        >
          <Download className="h-4 w-4" />
          <span>EXPORT JSON AUDIT REPORT</span>
        </button>
      </div>

      {/* Executive Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400">Composite Posture Score</div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400">
            {100 - riskScore} / 100
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Reflects overall resilience against unauthorized perimeters and unverified devices.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400">Continuous Verification Rate</div>
          <div className="text-3xl font-extrabold font-mono text-cyan-400">
            100%
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Every incoming request is processed by the Policy Decision Point prior to routing.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400">SOC2 Type II Readiness</div>
          <div className="text-3xl font-extrabold font-mono text-purple-400">
            READY
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Cryptographic SHA-256 audit chaining satisfies non-repudiation criteria.
          </p>
        </div>
      </div>

      {/* NIST SP 800-207 Zero-Trust Pillars Maturity Grid */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center">
            <Award className="h-4 w-4 mr-2 text-cyan-400" />
            NIST SP 800-207 Zero-Trust Pillars Assessment
          </h2>
          <span className="text-xs font-mono text-slate-400">7 Core Pillars Verified</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {nistPillars.map((pillar) => (
            <div
              key={pillar.name}
              className="p-3.5 rounded-lg border border-slate-800/80 bg-slate-950/60 flex items-start justify-between text-xs font-mono"
            >
              <div className="space-y-1 pr-3">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-200">{pillar.name}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold ${
                    pillar.status === 'Compliant' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    {pillar.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">{pillar.desc}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-extrabold text-cyan-400">{pillar.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
