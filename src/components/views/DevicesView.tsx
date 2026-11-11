import React, { useState } from 'react';
import {
  Laptop,
  Smartphone,
  Server,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Search,
  Plus,
  Check,
  X,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { DeviceItem, UserProfile } from '../../types';

interface DevicesViewProps {
  devices: DeviceItem[];
  users: UserProfile[];
  onUpdateDevice: (id: string, updates: any) => Promise<void>;
  onCreateDevice: (deviceData: any) => Promise<void>;
  onQuarantineDevice: (id: string) => Promise<void>;
  isLoading: boolean;
}

export const DevicesView: React.FC<DevicesViewProps> = ({
  devices,
  users,
  onUpdateDevice,
  onCreateDevice,
  onQuarantineDevice,
  isLoading,
}) => {
  const [search, setSearch] = useState('');
  const [filterTrust, setFilterTrust] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState<DeviceItem['deviceType']>('LAPTOP');
  const [osName, setOsName] = useState('Windows 11 Enterprise');
  const [osVersion, setOsVersion] = useState('23H2');
  const [ownerId, setOwnerId] = useState(users[0]?.id || '');
  const [diskEncrypted, setDiskEncrypted] = useState(true);
  const [antivirusActive, setAntivirusActive] = useState(true);
  const [firewallEnabled, setFirewallEnabled] = useState(true);

  const filteredDevices = devices.filter((d) => {
    const matchesSearch =
      d.deviceName.toLowerCase().includes(search.toLowerCase()) ||
      d.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      d.osName.toLowerCase().includes(search.toLowerCase()) ||
      d.serialNumber.toLowerCase().includes(search.toLowerCase());
    const matchesTrust = filterTrust === 'ALL' || d.trustState === filterTrust;
    return matchesSearch && matchesTrust;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateDevice({
      deviceName,
      deviceType,
      osName,
      osVersion,
      ownerId,
      compliance: {
        diskEncrypted,
        firewallEnabled,
        antivirusActive,
        osUpdated: true,
      },
    });
    setShowAddModal(false);
    setDeviceName('');
  };

  const setTrust = async (device: DeviceItem, state: 'TRUSTED' | 'UNTRUSTED' | 'BLOCKED') => {
    await onUpdateDevice(device.id, {
      trustState: state,
      riskScore: state === 'BLOCKED' ? 95 : state === 'UNTRUSTED' ? 55 : 15,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              ENDPOINT TELEMETRY & POSTURE
            </span>
            <span className="text-xs text-slate-400 font-mono">Continuous Device Health Verification</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Device Security & Compliance</h1>
          <p className="text-xs text-slate-400">
            Monitor hardware compliance, BitLocker/FileVault encryption status, EDR agents, and enforce quarantine boundaries.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>REGISTER DEVICE</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by device name, owner, OS, or serial number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-mono text-slate-400 whitespace-nowrap">Trust State:</span>
          <select
            value={filterTrust}
            onChange={(e) => setFilterTrust(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500 font-mono w-full sm:w-auto"
          >
            <option value="ALL">All States</option>
            <option value="TRUSTED">TRUSTED</option>
            <option value="UNTRUSTED">UNTRUSTED</option>
            <option value="BLOCKED">BLOCKED / QUARANTINED</option>
          </select>
        </div>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDevices.map((device) => {
          const isQuarantined = device.trustState === 'BLOCKED';
          return (
            <div
              key={device.id}
              className={`p-5 rounded-xl border transition flex flex-col justify-between ${
                isQuarantined
                  ? 'bg-red-950/20 border-red-900/60'
                  : device.trustState === 'UNTRUSTED'
                  ? 'bg-amber-950/20 border-amber-900/60'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Top: Device Icon & Trust Badge */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                      {device.deviceType === 'MOBILE' ? (
                        <Smartphone className="h-5 w-5 text-purple-400" />
                      ) : device.deviceType === 'SERVER' ? (
                        <Server className="h-5 w-5 text-indigo-400" />
                      ) : (
                        <Laptop className="h-5 w-5 text-cyan-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white font-mono truncate max-w-[170px]">
                        {device.deviceName}
                      </h3>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Owner: {device.ownerName}
                      </div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    device.trustState === 'TRUSTED'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : device.trustState === 'UNTRUSTED'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-red-950 text-red-400 border border-red-800 animate-pulse'
                  }`}>
                    {device.trustState}
                  </span>
                </div>

                {/* System Specs */}
                <div className="mt-4 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs font-mono space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">OS:</span>
                    <span>{device.osName} {device.osVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Serial:</span>
                    <span className="text-slate-400">{device.serialNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">EDR Agent:</span>
                    <span className={device.agentInstalled ? 'text-emerald-400' : 'text-red-400'}>
                      {device.agentInstalled ? device.agentVersion : 'NOT INSTALLED'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last IP:</span>
                    <span className="text-cyan-400">{device.lastIp}</span>
                  </div>
                </div>

                {/* Compliance Checklist */}
                <div className="mt-3 space-y-1.5 text-[11px] font-mono">
                  <div className="text-slate-400 uppercase text-[10px] font-bold">Endpoint Compliance Telemetry:</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="flex items-center space-x-1.5 p-1 rounded bg-slate-950/40">
                      {device.compliance.diskEncrypted ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <X className="h-3 w-3 text-red-400" />
                      )}
                      <span className={device.compliance.diskEncrypted ? 'text-slate-300' : 'text-red-400'}>
                        Disk Encrypted
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 p-1 rounded bg-slate-950/40">
                      {device.compliance.antivirusActive ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <X className="h-3 w-3 text-red-400" />
                      )}
                      <span className={device.compliance.antivirusActive ? 'text-slate-300' : 'text-red-400'}>
                        EDR Active
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 p-1 rounded bg-slate-950/40">
                      {device.compliance.firewallEnabled ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <X className="h-3 w-3 text-red-400" />
                      )}
                      <span className={device.compliance.firewallEnabled ? 'text-slate-300' : 'text-red-400'}>
                        Firewall On
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 p-1 rounded bg-slate-950/40">
                      {!device.compliance.jailbrokenOrRooted ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <X className="h-3 w-3 text-red-400" />
                      )}
                      <span className={!device.compliance.jailbrokenOrRooted ? 'text-slate-300' : 'text-red-400'}>
                        Kernel Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions: Trust Controls & Quarantine */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setTrust(device, 'TRUSTED')}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-emerald-950 hover:text-emerald-300 text-slate-300 text-[10px] transition cursor-pointer"
                  >
                    Trust
                  </button>
                  <button
                    onClick={() => setTrust(device, 'UNTRUSTED')}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-amber-950 hover:text-amber-300 text-slate-300 text-[10px] transition cursor-pointer"
                  >
                    Untrust
                  </button>
                </div>

                {isQuarantined ? (
                  <button
                    onClick={() => setTrust(device, 'TRUSTED')}
                    className="px-2.5 py-1 rounded bg-emerald-900/80 hover:bg-emerald-800 text-white text-[10px] font-bold transition cursor-pointer"
                  >
                    Unquarantine
                  </button>
                ) : (
                  <button
                    onClick={() => onQuarantineDevice(device.id)}
                    className="px-2.5 py-1 rounded bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 text-[10px] font-bold transition cursor-pointer flex items-center space-x-1"
                  >
                    <ShieldX className="h-3 w-3 mr-1" />
                    <span>Quarantine</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Register Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono flex items-center">
                <Laptop className="h-4 w-4 mr-2 text-cyan-400" />
                Register New Enterprise Device
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
                <label className="text-slate-300">Device Hostname</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FIN-MACBOOK-AIR-12"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300">Device Type</label>
                  <select
                    value={deviceType}
                    onChange={(e) => setDeviceType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-cyan-500"
                  >
                    <option value="LAPTOP">Laptop</option>
                    <option value="DESKTOP">Desktop</option>
                    <option value="MOBILE">Mobile Phone</option>
                    <option value="SERVER">Server / Node</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300">Assigned User</label>
                  <select
                    value={ownerId}
                    onChange={(e) => setOwnerId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-cyan-500"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300">Operating System</label>
                  <input
                    type="text"
                    value={osName}
                    onChange={(e) => setOsName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300">OS Version / Build</label>
                  <input
                    type="text"
                    value={osVersion}
                    onChange={(e) => setOsVersion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-slate-400 uppercase text-[10px] font-bold">Posture Telemetry Checks:</span>
                <div className="space-y-1.5">
                  <label className="flex items-center space-x-2 text-slate-300">
                    <input
                      type="checkbox"
                      checked={diskEncrypted}
                      onChange={(e) => setDiskEncrypted(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-cyan-500"
                    />
                    <span>Full Disk Encryption Active (BitLocker / FileVault)</span>
                  </label>
                  <label className="flex items-center space-x-2 text-slate-300">
                    <input
                      type="checkbox"
                      checked={antivirusActive}
                      onChange={(e) => setAntivirusActive(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-cyan-500"
                    />
                    <span>CrowdStrike / Defender EDR Agent Active</span>
                  </label>
                  <label className="flex items-center space-x-2 text-slate-300">
                    <input
                      type="checkbox"
                      checked={firewallEnabled}
                      onChange={(e) => setFirewallEnabled(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-cyan-500"
                    />
                    <span>Local Host Firewall Enabled</span>
                  </label>
                </div>
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
                  Register Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
