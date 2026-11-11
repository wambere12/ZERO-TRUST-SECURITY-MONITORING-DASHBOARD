import React, { useState } from 'react';
import {
  BookOpen,
  Terminal,
  Database,
  Layers,
  Cpu,
  ShieldCheck,
  Copy,
  Check,
  ChevronRight,
  Code2,
} from 'lucide-react';
import { PHASE_1_ARCHITECTURE_DOCS, ArchitectureSection } from '../../docs/phase1_architecture';

export const Phase1ArchitectureView: React.FC = () => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>(PHASE_1_ARCHITECTURE_DOCS[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeSection = PHASE_1_ARCHITECTURE_DOCS.find((s) => s.id === selectedSectionId) || PHASE_1_ARCHITECTURE_DOCS[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-5 rounded-xl border border-cyan-900/60 bg-gradient-to-r from-slate-900 via-slate-950 to-cyan-950/40">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
            PHASE 1 SPECIFICATION
          </span>
          <span className="text-xs text-slate-400 font-mono">Requirements Analysis & System Architecture</span>
        </div>
        <h1 className="text-xl font-bold text-white mt-1">Zero-Trust System Blueprint & Windows 11 Guide</h1>
        <p className="text-xs text-slate-400 max-w-3xl mt-1">
          Complete engineering specifications, data flow diagrams, mathematical risk formulas, Windows 11 PowerShell environment commands, and Supabase PostgreSQL Row Level Security (RLS) architecture.
        </p>
      </div>

      {/* Two Column Layout: Navigation & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Table of Contents (4 columns) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase px-1">
            Phase 1 Deliverables
          </div>
          <div className="space-y-1.5">
            {PHASE_1_ARCHITECTURE_DOCS.map((section) => {
              const isSelected = section.id === activeSection.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setSelectedSectionId(section.id)}
                  className={`w-full text-left p-3 rounded-lg border transition text-xs font-mono cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500 text-white font-bold shadow-md shadow-cyan-950/30'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="text-[10px] text-cyan-400 uppercase font-semibold">{section.category}</div>
                    <div className="truncate text-xs mt-0.5">{section.title}</div>
                  </div>
                  <ChevronRight className={`h-4 w-4 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Detailed Section Documentation (8 columns) */}
        <div className="lg:col-span-8 p-6 rounded-xl border border-slate-800 bg-slate-900/80 space-y-5">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
              {activeSection.category}
            </span>
            <h2 className="text-lg font-bold text-white font-mono mt-1">
              {activeSection.title}
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-1">
              {activeSection.summary}
            </p>
          </div>

          {/* Markdown / Text Content */}
          <div className="prose prose-invert max-w-none text-xs font-sans text-slate-300 leading-relaxed whitespace-pre-line">
            {activeSection.content}
          </div>

          {/* Code Snippet / Commands / SQL Viewer */}
          {activeSection.codeSnippet && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase font-bold text-slate-400 flex items-center">
                  <Terminal className="h-3.5 w-3.5 mr-1.5 text-cyan-400" />
                  Code Specification / PowerShell Commands:
                </span>
                <button
                  onClick={() => handleCopy(activeSection.codeSnippet!, activeSection.id)}
                  className="flex items-center space-x-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition cursor-pointer px-2 py-1 rounded bg-slate-800 border border-slate-700"
                >
                  {copiedId === activeSection.id ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 overflow-x-auto">
                <pre className="text-xs font-mono text-cyan-300 leading-normal">
                  {activeSection.codeSnippet}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
