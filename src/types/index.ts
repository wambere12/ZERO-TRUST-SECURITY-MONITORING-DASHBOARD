export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  department: string;
  title: string;
  role: 'Super Administrator' | 'Security Administrator' | 'Security Analyst' | 'IT Administrator' | 'Employee';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  mfaEnabled: boolean;
  mfaType: string;
  riskScore: number;
  lastLoginAt: string;
  lastLoginIp: string;
}

export interface DeviceItem {
  id: string;
  ownerId: string;
  ownerName: string;
  deviceName: string;
  deviceType: 'LAPTOP' | 'DESKTOP' | 'MOBILE' | 'SERVER';
  osName: string;
  osVersion: string;
  serialNumber: string;
  macAddress: string;
  trustState: 'TRUSTED' | 'UNTRUSTED' | 'BLOCKED';
  riskScore: number;
  agentInstalled: boolean;
  agentVersion: string;
  lastSeenAt: string;
  lastIp: string;
  compliance: {
    diskEncrypted: boolean;
    firewallEnabled: boolean;
    antivirusActive: boolean;
    osUpdated: boolean;
    jailbrokenOrRooted: boolean;
    isCompliant: boolean;
  };
}

export interface ProtectedResource {
  id: string;
  name: string;
  resourceType: string;
  sensitivity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  endpointUrl: string;
  requiresMfa: boolean;
  minTrustLevel: 'TRUSTED' | 'UNTRUSTED';
}

export interface AccessDecisionItem {
  id: string;
  profileId: string;
  profileName: string;
  role: string;
  deviceId: string;
  deviceName: string;
  resourceId: string;
  resourceName: string;
  resourceSensitivity: string;
  decision: 'ALLOW' | 'DENY' | 'REQUIRE_MFA' | 'REQUIRE_REVIEW';
  calculatedRiskScore: number;
  decisionReason: string;
  factors: string[];
  requestIp: string;
  requestLocation: string;
  authStrength: string;
  evaluatedAt: string;
}

export interface SecurityEventItem {
  id: string;
  eventType: string;
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  sourceIp: string;
  location: string;
  userName: string;
  deviceName?: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface SecurityAlertItem {
  id: string;
  ruleCode: string;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  sourceUser: string;
  sourceDevice: string;
  sourceIp: string;
  description: string;
  status: 'NEW' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED' | 'FALSE_POSITIVE';
  assignedAnalyst: string;
  recommendedAction: string;
  detectionTime: string;
}

export interface IncidentItem {
  id: string;
  incidentNumber: string;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'INVESTIGATING' | 'CONTAINED' | 'CLOSED';
  leadAnalyst: string;
  mitreTag: string;
  rootCause: string;
  createdAt: string;
  notes: {
    id: string;
    author: string;
    timestamp: string;
    content: string;
    actionType: 'NOTE' | 'EVIDENCE' | 'STATUS_CHANGE' | 'CONTAINMENT_ACTION';
  }[];
}

export interface AuditLogItem {
  id: string;
  actor: string;
  action: string;
  resourceType: string;
  resourceId: string;
  ipAddress: string;
  timestamp: string;
  details: string;
  hash: string;
}

export interface DetectionRuleItem {
  id: string;
  code: string;
  name: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  mitreTactic: string;
  mitreTechnique: string;
  description: string;
  triggerCount: number;
  isActive: boolean;
}

export interface AccessPolicyItem {
  id: string;
  name: string;
  description: string;
  priority: number;
  minDeviceTrust: 'TRUSTED' | 'UNTRUSTED';
  requireEncryption: boolean;
  requireMfa: boolean;
  maxUserRisk: number;
  maxDeviceRisk: number;
  defaultAction: 'ALLOW' | 'DENY' | 'REQUIRE_MFA' | 'REQUIRE_REVIEW';
  isActive: boolean;
}

export interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalDevices: number;
  trustedDevices: number;
  untrustedDevices: number;
  blockedDevices: number;
  compliantDevices: number;
  totalEvents: number;
  criticalAlerts: number;
  openIncidents: number;
  failedLogins: number;
  deniedDecisions: number;
  allowedDecisions: number;
  mfaDecisions: number;
  overallRiskScore: number;
  riskLevel: string;
}
