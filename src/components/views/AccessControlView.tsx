import React, { useState } from 'react';
import {
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Lock,
  Server,
  Laptop,
  User,
  Globe,
  CheckCircle,
  XCircle,
  HelpCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { UserProfile, DeviceItem, ProtectedResource, AccessDecisionItem } from '../../types';

interface AccessControlViewProps {
  users: UserProfile[];
  devices: DeviceItem[];
  resources: ProtectedResource[];
  decisions: AccessDecisionItem[];
  onEvaluate: (payload: {
    userId: string;
    deviceId: string;
    resourceId: string;
    requestIp: string;
    requestLocation: string;
    authStrength: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export const AccessControlView: React.FC<AccessControlViewProps> = ({
  users,
  devices,
  resources,
  decisions,
  onEvaluate,
  isLoading,
}) => {
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id || '');
  const [selectedDeviceId, setSelectedDeviceId] = useState(devices[0]?.id || '');
  const [selectedResourceId, setSelectedResourceId] = useState(resources[0]?.id || '');
  const [requestIp, setRequestIp] = useState('198.51.100.45');
  const [requestLocation, setRequestLocation] = useState('Reston, VA, United States');
  const [authStrength, setAuthStrength] = useState('FIDO2_PASSKEY');

  const [lastResult, setLastResult] = useState<AccessDecisionItem | null>(decisions[0] || null);

  const selectedUser = users.find(u => u.id === selectedUserId);
  const selectedDevice = devices.find(d => d.id === selectedDeviceId);
  const selectedResource = resources.find(r => r.id === selectedResourceId);

  const handleRunEvaluation = async () => {
    await onEvaluate({
      userId: selectedUserId,
      deviceId: selectedDeviceId,
      resourceId: selectedResourceId,
      requestIp,
      requestLocation,
      authStrength,
    });
  };

  // Preset quick scenarios
  const applyPreset = (preset: 'COMPLIANT_ADMIN' | 'UNTRUSTED_MOBILE' | 'ROOTED_ROGUE' | 'TOR_ATTACK') => {
    if (preset === 'COMPLIANT_ADMIN') {
      setSelectedUserId(users[1]?.id || users[0]?.id); // Elena Rostova (Sec Admin)
      setSelectedDeviceId(devices[0]?.id || devices[0]?.id); // SOC-MACBOOK-M3-SEC01
      setSelectedResourceId(resources[0]?.id || resources[0]?.id); // Production K8s
      setRequestIp('198.51.100.45');
      setRequestLocation('Reston, VA, United States');
      setAuthStrength('FIDO2_PASSKEY');
    } else if (preset === 'UNTRUSTED_MOBILE') {
      setSelectedUserId(users[5]?.id || users[0]?.id); // Priya Patel
      setSelectedDeviceId(devices[3]?.id || devices[0]?.id); // FIN-IPHONE-15-PRO
      setSelectedResourceId(resources[2]?.id || resources[0]?.id); // HR Workday
      setRequestIp('198.51.100.99');
      setRequestLocation('New York, NY, United States');
      setAuthStrength('PASSWORD');
    } else if (preset === 'ROOTED_ROGUE') {
      setSelectedUserId(users[4]?.id || users[0]?.id); // James Wilson
      setSelectedDeviceId(devices[4]?.id || devices[0]?.id); // UNKNOWN-ANDROID-ROGUE
      setSelectedResourceId(resources[1]?.id || resources[0]?.id); // Finance DB
      setRequestIp('45.154.255.8');
      setRequestLocation('Bucharest, Romania');
      setAuthStrength('PASSWORD');
    } else if (preset === 'TOR_ATTACK') {
      setSelectedUserId(users[4]?.id || users[0]?.id);
      setSelectedDeviceId(devices[2]?.id || devices[0]?.id); // DEV-DELL-LATITUDE-81 (unencrypted)
      setSelectedResourceId(resources[1]?.id || resources[0]?.id); // Finance DB
      setRequestIp('185.220.101.4');
      setRequestLocation('Frankfurt, Germany');
      setAuthStrength('PASSWORD');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              PDP EVALUATION ENGINE
            </span>
            <span className="text-xs text-slate-400 font-mono">Continuous Multi-Factor Verification</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Zero-Trust Access Control & Evaluation</h1>
          <p className="text-xs text-slate-400">
            Never trust by default. Evaluate identity, endpoint posture, resource classification, and network signals before admitting requests.
          </p>
        </div>

        {/* Quick Scenario Preset Buttons */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-1.5 rounded-lg text-xs font-mono">
          <span className="text-slate-400 text-[11px] px-2">Presets:</span>
          <button
            onClick={() => applyPreset('COMPLIANT_ADMIN')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-emerald-950 hover:text-emerald-300 text-slate-300 transition cursor-pointer"
          >
            Compliant Admin
          </button>
          <button
            onClick={() => applyPreset('UNTRUSTED_MOBILE')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 text-slate-300 transition cursor-pointer"
          >
            Mobile Step-Up
          </button>
          <button
            onClick={() => applyPreset('ROOTED_ROGUE')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-red-950 hover:text-red-300 text-slate-300 transition cursor-pointer"
          >
            Rooted Quarantined
          </button>
          <button
            onClick={() => applyPreset('TOR_ATTACK')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-orange-950 hover:text-orange-300 text-slate-300 transition cursor-pointer"
          >
            Tor/Unencrypted
          </button>
        </div>
      </div>

      {/* Main Interactive Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Parameters Configuration (7 Columns) */}
        <div className="lg:col-span-7 p-5 rounded-xl border border-slate-800 bg-slate-900/80 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center">
            <KeyRound className="h-4 w-4 mr-2 text-cyan-400" />
            Zero-Trust Policy Decision Point (PDP) Simulator
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Subject Identity Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 flex items-center">
                <User className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
                1. Subject Identity & Role
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-cyan-500"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.role}) - Risk: {u.riskScore}
                  </option>
                ))}
              </select>
              {selectedUser && (
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-0.5">
                  <div className="flex justify-between">
                    <span>MFA Status:</span>
                    <span className={selectedUser.mfaEnabled ? 'text-emerald-400' : 'text-red-400'}>
                      {selectedUser.mfaEnabled ? `Enrolled (${selectedUser.mfaType})` : 'NOT ENROLLED'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Account Status:</span>
                    <span className={selectedUser.status === 'ACTIVE' ? 'text-emerald-400' : 'text-red-400'}>
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Requesting Endpoint Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 flex items-center">
                <Laptop className="h-3.5 w-3.5 mr-1.5 text-purple-400" />
                2. Requesting Device & Posture
              </label>
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-cyan-500"
              >
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.deviceName} ({d.trustState}) - {d.osName}
                  </option>
                ))}
              </select>
              {selectedDevice && (
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-0.5">
                  <div className="flex justify-between">
                    <span>Trust State:</span>
                    <span className={
                      selectedDevice.trustState === 'TRUSTED' ? 'text-emerald-400' :
                      selectedDevice.trustState === 'UNTRUSTED' ? 'text-amber-400' : 'text-red-400'
                    }>
                      {selectedDevice.trustState}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Disk Encryption:</span>
                    <span className={selectedDevice.compliance.diskEncrypted ? 'text-emerald-400' : 'text-red-400'}>
                      {selectedDevice.compliance.diskEncrypted ? 'Active (BitLocker/APFS)' : 'DISABLED'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>EDR Agent:</span>
                    <span className={selectedDevice.compliance.antivirusActive ? 'text-emerald-400' : 'text-red-400'}>
                      {selectedDevice.compliance.antivirusActive ? 'Active' : 'OFFLINE'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Target Protected Resource */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 flex items-center">
                <Server className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                3. Target Enterprise Resource
              </label>
              <select
                value={selectedResourceId}
                onChange={(e) => setSelectedResourceId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-cyan-500"
              >
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} [{r.sensitivity}]
                  </option>
                ))}
              </select>
              {selectedResource && (
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-0.5">
                  <div className="flex justify-between">
                    <span>Sensitivity:</span>
                    <span className={
                      selectedResource.sensitivity === 'CRITICAL' ? 'text-red-400 font-bold' :
                      selectedResource.sensitivity === 'HIGH' ? 'text-amber-400 font-bold' : 'text-blue-400'
                    }>
                      {selectedResource.sensitivity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>MFA Required:</span>
                    <span className={selectedResource.requiresMfa ? 'text-cyan-400' : 'text-slate-400'}>
                      {selectedResource.requiresMfa ? 'MANDATORY' : 'OPTIONAL'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Network Context & Authentication Strength */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 flex items-center">
                <Globe className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
                4. Network Context & Credential
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={requestIp}
                  onChange={(e) => setRequestIp(e.target.value)}
                  placeholder="IP Address"
                  className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono outline-none focus:border-cyan-500"
                />
                <select
                  value={authStrength}
                  onChange={(e) => setAuthStrength(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
                >
                  <option value="PASSWORD">Password Only</option>
                  <option value="PASSWORD_MFA">Password + TOTP</option>
                  <option value="FIDO2_PASSKEY">FIDO2 Hardware Key</option>
                  <option value="CERTIFICATE">mTLS Certificate</option>
                </select>
              </div>
              <input
                type="text"
                value={requestLocation}
                onChange={(e) => setRequestLocation(e.target.value)}
                placeholder="Physical Location"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            onClick={handleRunEvaluation}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-cyan-900/30 transition cursor-pointer"
          >
            <Play className="h-4 w-4 fill-white" />
            <span>{isLoading ? 'EVALUATING ZERO-TRUST POLICIES...' : 'RUN ZERO-TRUST POLICY EVALUATION'}</span>
          </button>
        </div>

        {/* Right Side: Decision Outcome Card (5 Columns) */}
        <div className="lg:col-span-5 p-5 rounded-xl border border-slate-800 bg-slate-900/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Live Decision Verdict
              </h2>
              <span className="text-[10px] font-mono text-slate-400">NIST 800-207 PDP</span>
            </div>

            {decisions.length > 0 ? (
              <div className="space-y-4">
                {/* Decision Badge */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  decisions[0].decision === 'ALLOW' ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' :
                  decisions[0].decision === 'DENY' ? 'bg-rose-950/60 border-rose-700 text-rose-300' :
                  decisions[0].decision === 'REQUIRE_MFA' ? 'bg-cyan-950/60 border-cyan-700 text-cyan-300' :
                  'bg-amber-950/60 border-amber-700 text-amber-300'
                }`}>
                  <div className="flex items-center space-x-3">
                    {decisions[0].decision === 'ALLOW' && <CheckCircle className="h-8 w-8 text-emerald-400" />}
                    {decisions[0].decision === 'DENY' && <XCircle className="h-8 w-8 text-rose-400" />}
                    {decisions[0].decision === 'REQUIRE_MFA' && <KeyRound className="h-8 w-8 text-cyan-400" />}
                    {decisions[0].decision === 'REQUIRE_REVIEW' && <HelpCircle className="h-8 w-8 text-amber-400" />}
                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-wider opacity-80">Access Decision</div>
                      <div className="text-2xl font-black font-mono tracking-tight">{decisions[0].decision}</div>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-[11px] opacity-80">Composite Risk</div>
                    <div className="text-2xl font-black">{decisions[0].calculatedRiskScore}/100</div>
                  </div>
                </div>

                {/* Reason & Explainability */}
                <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60 space-y-2">
                  <div className="text-[11px] font-mono font-bold text-slate-300 uppercase">
                    Evaluation Reason:
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {decisions[0].decisionReason}
                  </p>
                </div>

                {/* Contributing Decision Factors */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-mono font-bold text-slate-400 uppercase">
                    Risk Factors & Signals:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {decisions[0].factors?.map((f, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 font-mono text-xs">
                No evaluations recorded yet. Run a test above.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>Audit Ref: {decisions[0]?.id || 'N/A'}</span>
            <span>Recorded in Immutable Audit Log</span>
          </div>
        </div>
      </div>

      {/* Decision History Table */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
            Recent Access Decisions & Audit Trail ({decisions.length})
          </h2>
          <span className="text-xs text-slate-400 font-mono">Row-Level Audited</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Subject / Role</th>
                <th className="py-2.5 px-3">Device / Posture</th>
                <th className="py-2.5 px-3">Target Resource</th>
                <th className="py-2.5 px-3">Decision</th>
                <th className="py-2.5 px-3">Risk</th>
                <th className="py-2.5 px-3">Source IP</th>
                <th className="py-2.5 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {decisions.map((dec) => (
                <tr key={dec.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-200">{dec.profileName}</div>
                    <div className="text-[10px] text-slate-400">{dec.role}</div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    <div className="truncate max-w-[140px]">{dec.deviceName}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="text-slate-200 truncate max-w-[160px]">{dec.resourceName}</div>
                    <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400">
                      {dec.resourceSensitivity}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      dec.decision === 'ALLOW' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      dec.decision === 'DENY' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                      dec.decision === 'REQUIRE_MFA' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' :
                      'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {dec.decision}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-200">
                    {dec.calculatedRiskScore}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{dec.requestIp}</td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {new Date(dec.evaluatedAt).toLocaleTimeString()}
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
