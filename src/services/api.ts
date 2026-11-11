// API Service layer using JavaScript Fetch API

export const api = {
  // Health
  getHealth: async () => {
    const res = await fetch('/api/health');
    return res.json();
  },

  // Auth & Roles
  getMe: async () => {
    const res = await fetch('/api/auth/me');
    return res.json();
  },

  switchRole: async (role: string) => {
    const res = await fetch('/api/auth/switch-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    return res.json();
  },

  // Users IAM
  getUsers: async () => {
    const res = await fetch('/api/users');
    return res.json();
  },

  createUser: async (userData: any) => {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return res.json();
  },

  updateUser: async (id: string, updates: any) => {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  // Devices & Endpoint Compliance
  getDevices: async () => {
    const res = await fetch('/api/devices');
    return res.json();
  },

  createDevice: async (deviceData: any) => {
    const res = await fetch('/api/devices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deviceData),
    });
    return res.json();
  },

  updateDevice: async (id: string, updates: any) => {
    const res = await fetch(`/api/devices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  quarantineDevice: async (id: string) => {
    const res = await fetch(`/api/devices/${id}/quarantine`, {
      method: 'POST',
    });
    return res.json();
  },

  // Resources & Policies
  getResources: async () => {
    const res = await fetch('/api/resources');
    return res.json();
  },

  getPolicies: async () => {
    const res = await fetch('/api/policies');
    return res.json();
  },

  createPolicy: async (policyData: any) => {
    const res = await fetch('/api/policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policyData),
    });
    return res.json();
  },

  updatePolicy: async (id: string, updates: any) => {
    const res = await fetch(`/api/policies/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  // Zero-Trust Access Evaluation Engine
  evaluateAccess: async (evaluationPayload: {
    userId: string;
    deviceId: string;
    resourceId: string;
    requestIp?: string;
    requestLocation?: string;
    authStrength?: string;
  }) => {
    const res = await fetch('/api/access/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evaluationPayload),
    });
    return res.json();
  },

  getAccessDecisions: async () => {
    const res = await fetch('/api/access/decisions');
    return res.json();
  },

  // Security Events & Telemetry
  getEvents: async () => {
    const res = await fetch('/api/events');
    return res.json();
  },

  // Detection Rules
  getDetectionRules: async () => {
    const res = await fetch('/api/detection-rules');
    return res.json();
  },

  toggleDetectionRule: async (id: string, isActive: boolean) => {
    const res = await fetch(`/api/detection-rules/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    });
    return res.json();
  },

  // Alerts & Incident Response
  getAlerts: async () => {
    const res = await fetch('/api/alerts');
    return res.json();
  },

  updateAlert: async (id: string, updates: any) => {
    const res = await fetch(`/api/alerts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  mitigateAlert: async (id: string, actionType: string) => {
    const res = await fetch(`/api/alerts/${id}/mitigate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionType }),
    });
    return res.json();
  },

  getIncidents: async () => {
    const res = await fetch('/api/incidents');
    return res.json();
  },

  createIncident: async (incidentData: any) => {
    const res = await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incidentData),
    });
    return res.json();
  },

  updateIncident: async (id: string, updates: any) => {
    const res = await fetch(`/api/incidents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  addIncidentNote: async (id: string, noteData: { content: string; actionType?: string }) => {
    const res = await fetch(`/api/incidents/${id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteData),
    });
    return res.json();
  },

  // Audit Logs
  getAuditLogs: async () => {
    const res = await fetch('/api/audit-logs');
    return res.json();
  },

  // Summary & Analytics
  getSecuritySummary: async () => {
    const res = await fetch('/api/reports/security-summary');
    return res.json();
  },

  // Attack Simulation Playground
  simulateScenario: async (scenario: 'BRUTE_FORCE' | 'IMPOSSIBLE_TRAVEL' | 'NON_COMPLIANT_ACCESS') => {
    const res = await fetch('/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario }),
    });
    return res.json();
  },
};
