import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Search,
  KeyRound,
  Lock,
  Unlock,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';
import { UserProfile } from '../../types';

interface UsersViewProps {
  users: UserProfile[];
  onUpdateUser: (id: string, updates: any) => Promise<void>;
  onCreateUser: (userData: any) => Promise<void>;
  isLoading: boolean;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  onUpdateUser,
  onCreateUser,
  isLoading,
}) => {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Security Operations (SOC)');
  const [title, setTitle] = useState('Security Analyst');
  const [role, setRole] = useState<UserProfile['role']>('Security Analyst');
  const [mfaEnabled, setMfaEnabled] = useState(true);

  const departments = ['ALL', ...Array.from(new Set(users.map((u) => u.department)))];

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.title.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || u.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateUser({
      fullName,
      email,
      department,
      title,
      role,
      mfaEnabled,
      mfaType: mfaEnabled ? 'TOTP Authenticator' : 'None',
    });
    setShowAddModal(false);
    setFullName('');
    setEmail('');
  };

  const toggleUserStatus = async (user: UserProfile) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await onUpdateUser(user.id, { status: nextStatus });
  };

  const toggleMfa = async (user: UserProfile) => {
    await onUpdateUser(user.id, {
      mfaEnabled: !user.mfaEnabled,
      mfaType: !user.mfaEnabled ? 'TOTP Authenticator' : 'None',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              IDENTITY & ACCESS MANAGEMENT (IAM)
            </span>
            <span className="text-xs text-slate-400 font-mono">Zero-Trust Subject Verification</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Users & Role-Based Access Control</h1>
          <p className="text-xs text-slate-400">
            Centrally manage user profiles, MFA enforcement, adaptive risk scores, and account lifecycle.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono transition cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4" />
          <span>PROVISION USER</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or job title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-mono text-slate-400 whitespace-nowrap">Department:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500 font-mono w-full sm:w-auto"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">User / Identity</th>
                <th className="py-2.5 px-3">Department & Title</th>
                <th className="py-2.5 px-3">Assigned Role</th>
                <th className="py-2.5 px-3">MFA Posture</th>
                <th className="py-2.5 px-3">Risk Score</th>
                <th className="py-2.5 px-3">Account Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-200">{user.fullName}</div>
                    <div className="text-[11px] text-slate-400">{user.email}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-slate-300">{user.department}</div>
                    <div className="text-[10px] text-slate-400">{user.title}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => toggleMfa(user)}
                      className="cursor-pointer group flex items-center space-x-1"
                      title="Click to toggle MFA"
                    >
                      {user.mfaEnabled ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center space-x-1">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          <span>{user.mfaType}</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-400 border border-red-800 flex items-center space-x-1">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          <span>DISABLED</span>
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`font-bold ${
                      user.riskScore > 60 ? 'text-red-400' :
                      user.riskScore > 30 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {user.riskScore}/100
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      user.status === 'ACTIVE'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => toggleUserStatus(user)}
                      className={`px-2 py-1 rounded text-[11px] font-medium border transition cursor-pointer ${
                        user.status === 'ACTIVE'
                          ? 'border-red-900 bg-red-950/40 text-red-300 hover:bg-red-900/60'
                          : 'border-emerald-900 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60'
                      }`}
                    >
                      {user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono flex items-center">
                <UserPlus className="h-4 w-4 mr-2 text-cyan-400" />
                Provision New User Identity
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
                <label className="text-slate-300">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Connor"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="sarah.connor@defense-zero.corp"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300">Job Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">Assigned RBAC Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-cyan-500"
                >
                  <option value="Super Administrator">Super Administrator</option>
                  <option value="Security Administrator">Security Administrator</option>
                  <option value="Security Analyst">Security Analyst</option>
                  <option value="IT Administrator">IT Administrator</option>
                  <option value="Employee">Employee (Standard User)</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="mfa"
                  checked={mfaEnabled}
                  onChange={(e) => setMfaEnabled(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-cyan-500"
                />
                <label htmlFor="mfa" className="text-slate-300 cursor-pointer">
                  Enforce Multi-Factor Authentication (MFA)
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
                  Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
