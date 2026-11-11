import React, { useState } from 'react';
import {
  Sliders,
  Plus,
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  XCircle,
  KeyRound,
  Lock,
} from 'lucide-react';
import { AccessPolicyItem } from '../../types';

interface PoliciesViewProps {
  policies: AccessPolicyItem[];
  onCreatePolicy: (policyData: any) => Promise<void>;
  onUpdatePolicy: (id: string, updates: any) => Promise<void>;
  isLoading: boolean;
}

export const PoliciesView: React.FC<PoliciesViewProps> = ({
  policies,
  onCreatePolicy,
  onUpdatePolicy,
  isLoading,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [minDeviceTrust, setMinDeviceTrust] = useState<'TRUSTED' | 'UNTRUSTED'>('TRUSTED');
  const [requireEncryption, setRequireEncryption] = useState(true);
  const [requireMfa, setRequireMfa] = useState(true);
  const [maxUserRisk, setMaxUserRisk] = useState(40);
  const [maxDeviceRisk, setMaxDeviceRisk] = useState(30);
  const [defaultAction, setDefaultAction] = useState<AccessPolicyItem['defaultAction']>('ALLOW');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreatePolicy({
      name,
      description,
      minDeviceTrust,
      requireEncryption,
      requireMfa,
      maxUserRisk,
      maxDeviceRisk,
      defaultAction,
    });
    setShowAddModal(false);
    setName('');
    setDescription('');
  };

  const togglePolicyActive = async (policy: AccessPolicyItem) => {
    await onUpdatePolicy(policy.id, { isActive: !policy.isActive });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              POLICY ADMINISTRATION POINT (PAP)
            </span>
            <span className="text-xs text-slate-400 font-mono">Dynamic Rule Orchestration</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Zero-Trust Access Policies</h1>
          <p className="text-xs text-slate-400">
            Define multi-attribute context boundaries: device posture, identity trust tiers, risk ceilings, and mandatory MFA.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>CREATE POLICY</span>
        </button>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {policies.map((pol) => {
          return (
            <div
              key={pol.id}
              className={`p-5 rounded-xl border transition flex flex-col justify-between ${
                pol.isActive
                  ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/40 border-slate-800/50 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                      PRIORITY #{pol.priority}
                    </span>
                    <h3 className="text-sm font-bold text-white font-mono mt-0.5">
                      {pol.name}
                    </h3>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    pol.defaultAction === 'ALLOW' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    pol.defaultAction === 'DENY' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                    'bg-cyan-950 text-cyan-400 border border-cyan-800'
                  }`}>
                    {pol.defaultAction}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-sans mt-2.5 leading-relaxed">
                  {pol.description}
                </p>

                {/* Policy Rules Matrix */}
                <div className="mt-4 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs font-mono space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Min Device Posture:</span>
                    <span className="text-cyan-400 font-semibold">{pol.minDeviceTrust}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Disk Encryption:</span>
                    <span className={pol.requireEncryption ? 'text-emerald-400' : 'text-slate-400'}>
                      {pol.requireEncryption ? 'Mandatory' : 'Optional'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hardware MFA:</span>
                    <span className={pol.requireMfa ? 'text-cyan-400' : 'text-slate-400'}>
                      {pol.requireMfa ? 'Enforced' : 'Optional'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max Tolerated Risk:</span>
                    <span className="text-amber-400 font-semibold">User: {pol.maxUserRisk} | Dev: {pol.maxDeviceRisk}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className={pol.isActive ? 'text-emerald-400' : 'text-slate-500'}>
                  {pol.isActive ? 'ACTIVE ENFORCEMENT' : 'INACTIVE'}
                </span>
                <button
                  onClick={() => togglePolicyActive(pol)}
                  className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
                >
                  {pol.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Policy Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono flex items-center">
                <Sliders className="h-4 w-4 mr-2 text-cyan-400" />
                Define Zero-Trust Policy Rule
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-slate-300">Policy Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Remote Worker Financial Access Guard"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">Rule Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explains what posture conditions trigger this policy..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-cyan-500 font-sans text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300">Default Action</label>
                  <select
                    value={defaultAction}
                    onChange={(e) => setDefaultAction(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-cyan-500"
                  >
                    <option value="ALLOW">ALLOW</option>
                    <option value="REQUIRE_MFA">REQUIRE_MFA</option>
                    <option value="REQUIRE_REVIEW">REQUIRE_REVIEW</option>
                    <option value="DENY">DENY</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300">Min Device Posture</label>
                  <select
                    value={minDeviceTrust}
                    onChange={(e) => setMinDeviceTrust(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-cyan-500"
                  >
                    <option value="TRUSTED">TRUSTED</option>
                    <option value="UNTRUSTED">UNTRUSTED</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="flex items-center space-x-2 text-slate-300">
                  <input
                    type="checkbox"
                    checked={requireEncryption}
                    onChange={(e) => setRequireEncryption(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-cyan-500"
                  />
                  <span>Require Full Disk Encryption</span>
                </label>
                <label className="flex items-center space-x-2 text-slate-300">
                  <input
                    type="checkbox"
                    checked={requireMfa}
                    onChange={(e) => setRequireMfa(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-cyan-500"
                  />
                  <span>Require Hardware MFA (FIDO2 / WebAuthn)</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition"
                >
                  Publish Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
