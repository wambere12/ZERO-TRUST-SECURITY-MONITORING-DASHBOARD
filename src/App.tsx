import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { OverviewView } from './components/views/OverviewView';
import { UsersView } from './components/views/UsersView';
import { DevicesView } from './components/views/DevicesView';
import { AccessControlView } from './components/views/AccessControlView';
import { SecurityEventsView } from './components/views/SecurityEventsView';
import { ThreatDetectionView } from './components/views/ThreatDetectionView';
import { AlertsView } from './components/views/AlertsView';
import { IncidentsView } from './components/views/IncidentsView';
import { AuditLogsView } from './components/views/AuditLogsView';
import { PoliciesView } from './components/views/PoliciesView';
import { ReportsView } from './components/views/ReportsView';
import { Phase1ArchitectureView } from './components/views/Phase1ArchitectureView';
import { api } from './services/api';
import {
  UserProfile,
  DeviceItem,
  ProtectedResource,
  AccessDecisionItem,
  SecurityEventItem,
  DetectionRuleItem,
  SecurityAlertItem,
  IncidentItem,
  AuditLogItem,
  AccessPolicyItem,
  SystemMetrics,
} from './types';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [currentRole, setCurrentRole] = useState<string>('Security Administrator');
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [resources, setResources] = useState<ProtectedResource[]>([]);
  const [policies, setPolicies] = useState<AccessPolicyItem[]>([]);
  const [decisions, setDecisions] = useState<AccessDecisionItem[]>([]);
  const [events, setEvents] = useState<SecurityEventItem[]>([]);
  const [rules, setRules] = useState<DetectionRuleItem[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlertItem[]>([]);
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'warning' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [
        summaryRes,
        usersRes,
        devicesRes,
        resourcesRes,
        policiesRes,
        decisionsRes,
        eventsRes,
        rulesRes,
        alertsRes,
        incidentsRes,
        auditLogsRes,
        meRes,
      ] = await Promise.all([
        api.getSecuritySummary(),
        api.getUsers(),
        api.getDevices(),
        api.getResources(),
        api.getPolicies(),
        api.getAccessDecisions(),
        api.getEvents(),
        api.getDetectionRules(),
        api.getAlerts(),
        api.getIncidents(),
        api.getAuditLogs(),
        api.getMe(),
      ]);

      if (summaryRes?.metrics) setMetrics(summaryRes.metrics);
      if (Array.isArray(usersRes)) setUsers(usersRes);
      if (Array.isArray(devicesRes)) setDevices(devicesRes);
      if (Array.isArray(resourcesRes)) setResources(resourcesRes);
      if (Array.isArray(policiesRes)) setPolicies(policiesRes);
      if (Array.isArray(decisionsRes)) setDecisions(decisionsRes);
      if (Array.isArray(eventsRes)) setEvents(eventsRes);
      if (Array.isArray(rulesRes)) setRules(rulesRes);
      if (Array.isArray(alertsRes)) setAlerts(alertsRes);
      if (Array.isArray(incidentsRes)) setIncidents(incidentsRes);
      if (Array.isArray(auditLogsRes)) setAuditLogs(auditLogsRes);
      if (meRes?.currentRole) setCurrentRole(meRes.currentRole);
    } catch (err) {
      console.error('Error loading Zero-Trust telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = async (newRole: string) => {
    try {
      await api.switchRole(newRole);
      setCurrentRole(newRole);
      showNotification(`Testing role switched to: ${newRole}`, 'info');
      loadData();
    } catch (err) {
      console.error('Error switching role:', err);
    }
  };

  const handleSimulate = async (scenario: 'BRUTE_FORCE' | 'IMPOSSIBLE_TRAVEL' | 'NON_COMPLIANT_ACCESS') => {
    try {
      setIsLoading(true);
      const res = await api.simulateScenario(scenario);
      showNotification(res.message || 'Threat scenario simulated!', 'warning');
      await loadData();
      if (scenario === 'BRUTE_FORCE') setActiveTab('security-alerts');
      else if (scenario === 'IMPOSSIBLE_TRAVEL') setActiveTab('security-alerts');
      else if (scenario === 'NON_COMPLIANT_ACCESS') setActiveTab('access-control');
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Evaluation Handler
  const handleEvaluateAccess = async (payload: any) => {
    try {
      setIsLoading(true);
      const decision = await api.evaluateAccess(payload);
      const type = decision.decision === 'ALLOW' ? 'success' : decision.decision === 'DENY' ? 'warning' : 'info';
      showNotification(`Zero-Trust Verdict: ${decision.decision} (Risk: ${decision.calculatedRiskScore}/100)`, type);
      await loadData();
    } catch (err) {
      console.error('Evaluation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Users Handlers
  const handleCreateUser = async (userData: any) => {
    try {
      setIsLoading(true);
      await api.createUser(userData);
      showNotification(`Provisioned user identity: ${userData.fullName}`, 'success');
      await loadData();
    } catch (err) {
      console.error('Create user error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (id: string, updates: any) => {
    try {
      await api.updateUser(id, updates);
      showNotification('User attributes updated', 'info');
      await loadData();
    } catch (err) {
      console.error('Update user error:', err);
    }
  };

  // Devices Handlers
  const handleCreateDevice = async (deviceData: any) => {
    try {
      setIsLoading(true);
      await api.createDevice(deviceData);
      showNotification(`Registered endpoint: ${deviceData.deviceName}`, 'success');
      await loadData();
    } catch (err) {
      console.error('Create device error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDevice = async (id: string, updates: any) => {
    try {
      await api.updateDevice(id, updates);
      showNotification('Device posture state updated', 'info');
      await loadData();
    } catch (err) {
      console.error('Update device error:', err);
    }
  };

  const handleQuarantineDevice = async (id: string) => {
    try {
      setIsLoading(true);
      await api.quarantineDevice(id);
      showNotification('Device quarantined! All network & resource access revoked.', 'warning');
      await loadData();
    } catch (err) {
      console.error('Quarantine error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Detection Rules Toggle
  const handleToggleRule = async (id: string, isActive: boolean) => {
    try {
      await api.toggleDetectionRule(id, isActive);
      showNotification(`Detection rule ${isActive ? 'activated' : 'deactivated'}`, 'info');
      await loadData();
    } catch (err) {
      console.error('Toggle rule error:', err);
    }
  };

  // Alerts Handlers
  const handleUpdateAlert = async (id: string, updates: any) => {
    try {
      await api.updateAlert(id, updates);
      showNotification('Alert triage status updated', 'info');
      await loadData();
    } catch (err) {
      console.error('Update alert error:', err);
    }
  };

  const handleMitigateAlert = async (id: string, actionType: string) => {
    try {
      setIsLoading(true);
      const res = await api.mitigateAlert(id, actionType);
      showNotification(res.actionSummary || 'Mitigation playbook executed!', 'success');
      await loadData();
    } catch (err) {
      console.error('Mitigation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Incident Handlers
  const handleCreateIncident = async (incidentData: any) => {
    try {
      setIsLoading(true);
      const res = await api.createIncident(incidentData);
      showNotification(`Declared major incident: ${res.incidentNumber}`, 'warning');
      await loadData();
    } catch (err) {
      console.error('Create incident error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateIncident = async (id: string, updates: any) => {
    try {
      await api.updateIncident(id, updates);
      showNotification('Incident status updated', 'info');
      await loadData();
    } catch (err) {
      console.error('Update incident error:', err);
    }
  };

  const handleAddIncidentNote = async (id: string, noteData: any) => {
    try {
      await api.addIncidentNote(id, noteData);
      showNotification('Investigation note added to timeline', 'info');
      await loadData();
    } catch (err) {
      console.error('Add note error:', err);
    }
  };

  // Policies Handlers
  const handleCreatePolicy = async (policyData: any) => {
    try {
      setIsLoading(true);
      await api.createPolicy(policyData);
      showNotification(`Created Zero-Trust policy: ${policyData.name}`, 'success');
      await loadData();
    } catch (err) {
      console.error('Create policy error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePolicy = async (id: string, updates: any) => {
    try {
      await api.updatePolicy(id, updates);
      showNotification('Policy configuration updated', 'info');
      await loadData();
    } catch (err) {
      console.error('Update policy error:', err);
    }
  };

  const criticalAlertCount = alerts.filter((a) => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length;
  const openIncidentCount = incidents.filter((i) => i.status !== 'CLOSED').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        metrics={metrics}
        onSimulate={handleSimulate}
        onRefresh={loadData}
        isLoading={isLoading}
      />

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl border shadow-2xl text-xs font-mono backdrop-blur-md ${
            notification.type === 'success' ? 'bg-emerald-950/90 border-emerald-700 text-emerald-200' :
            notification.type === 'warning' ? 'bg-amber-950/90 border-amber-700 text-amber-200' :
            'bg-cyan-950/90 border-cyan-700 text-cyan-200'
          }`}>
            {notification.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
            {notification.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />}
            {notification.type === 'info' && <Info className="h-4 w-4 text-cyan-400 shrink-0" />}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-white ml-2"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          criticalAlertCount={criticalAlertCount}
          openIncidentCount={openIncidentCount}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {activeTab === 'overview' && (
            <OverviewView
              metrics={metrics}
              events={events}
              alerts={alerts}
              onNavigate={setActiveTab}
              onSimulate={handleSimulate}
            />
          )}

          {activeTab === 'users' && (
            <UsersView
              users={users}
              onUpdateUser={handleUpdateUser}
              onCreateUser={handleCreateUser}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'devices' && (
            <DevicesView
              devices={devices}
              users={users}
              onUpdateDevice={handleUpdateDevice}
              onCreateDevice={handleCreateDevice}
              onQuarantineDevice={handleQuarantineDevice}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'access-control' && (
            <AccessControlView
              users={users}
              devices={devices}
              resources={resources}
              decisions={decisions}
              onEvaluate={handleEvaluateAccess}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'security-events' && (
            <SecurityEventsView events={events} isLoading={isLoading} />
          )}

          {activeTab === 'threat-detection' && (
            <ThreatDetectionView
              rules={rules}
              onToggleRule={handleToggleRule}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'security-alerts' && (
            <AlertsView
              alerts={alerts}
              onUpdateAlert={handleUpdateAlert}
              onMitigateAlert={handleMitigateAlert}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'incidents' && (
            <IncidentsView
              incidents={incidents}
              onCreateIncident={handleCreateIncident}
              onUpdateIncident={handleUpdateIncident}
              onAddNote={handleAddIncidentNote}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'audit-logs' && (
            <AuditLogsView logs={auditLogs} isLoading={isLoading} />
          )}

          {activeTab === 'security-policies' && (
            <PoliciesView
              policies={policies}
              onCreatePolicy={handleCreatePolicy}
              onUpdatePolicy={handleUpdatePolicy}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView metrics={metrics} />
          )}

          {activeTab === 'phase1-architecture' && (
            <Phase1ArchitectureView />
          )}
        </main>
      </div>
    </div>
  );
}
