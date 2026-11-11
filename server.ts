import express, { Request, Response } from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// In-Memory Database Store for Enterprise Zero-Trust Telemetry
interface Profile {
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

interface Device {
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

interface Resource {
  id: string;
  name: string;
  resourceType: string;
  sensitivity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  endpointUrl: string;
  requiresMfa: boolean;
  minTrustLevel: 'TRUSTED' | 'UNTRUSTED';
}

interface AccessDecision {
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

interface SecurityEvent {
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

interface SecurityAlert {
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

interface Incident {
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

interface AuditLog {
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

interface DetectionRule {
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

interface AccessPolicy {
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

// -------------------------------------------------------------
// SEED DATA INITIALIZATION
// -------------------------------------------------------------
let currentUserRole: Profile['role'] = 'Security Administrator';

const db = {
  users: [
    {
      id: 'usr_001',
      email: 'marcus.vance@defense-zero.corp',
      fullName: 'Marcus Vance',
      department: 'Executive Operations',
      title: 'Chief Information Security Officer',
      role: 'Super Administrator',
      status: 'ACTIVE',
      mfaEnabled: true,
      mfaType: 'FIDO2 WebAuthn',
      riskScore: 10,
      lastLoginAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      lastLoginIp: '198.51.100.22',
    },
    {
      id: 'usr_002',
      email: 'elena.rostova@defense-zero.corp',
      fullName: 'Elena Rostova',
      department: 'Security Operations (SOC)',
      title: 'Principal Security Architect',
      role: 'Security Administrator',
      status: 'ACTIVE',
      mfaEnabled: true,
      mfaType: 'TOTP Authenticator',
      riskScore: 14,
      lastLoginAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      lastLoginIp: '198.51.100.45',
    },
    {
      id: 'usr_003',
      email: 'david.chen@defense-zero.corp',
      fullName: 'David Chen',
      department: 'Security Operations (SOC)',
      title: 'Senior Incident Responder',
      role: 'Security Analyst',
      status: 'ACTIVE',
      mfaEnabled: true,
      mfaType: 'TOTP Authenticator',
      riskScore: 22,
      lastLoginAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      lastLoginIp: '203.0.113.88',
    },
    {
      id: 'usr_004',
      email: 'sarah.miller@defense-zero.corp',
      fullName: 'Sarah Miller',
      department: 'Information Technology',
      title: 'Lead Systems Administrator',
      role: 'IT Administrator',
      status: 'ACTIVE',
      mfaEnabled: true,
      mfaType: 'Hardware Token',
      riskScore: 28,
      lastLoginAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      lastLoginIp: '198.51.100.104',
    },
    {
      id: 'usr_005',
      email: 'james.wilson@defense-zero.corp',
      fullName: 'James Wilson',
      department: 'Engineering',
      title: 'DevOps Engineer',
      role: 'Employee',
      status: 'ACTIVE',
      mfaEnabled: true,
      mfaType: 'SMS Verify (Deprecated)',
      riskScore: 68,
      lastLoginAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      lastLoginIp: '185.220.101.4', // Known VPN / suspicious exit
    },
    {
      id: 'usr_006',
      email: 'priya.patel@defense-zero.corp',
      fullName: 'Priya Patel',
      department: 'Finance & Accounting',
      title: 'Financial Controller',
      role: 'Employee',
      status: 'ACTIVE',
      mfaEnabled: false,
      mfaType: 'None',
      riskScore: 54,
      lastLoginAt: new Date(Date.now() - 300 * 60 * 1000).toISOString(),
      lastLoginIp: '198.51.100.99',
    },
  ] as Profile[],

  devices: [
    {
      id: 'dev_001',
      ownerId: 'usr_002',
      ownerName: 'Elena Rostova',
      deviceName: 'SOC-MACBOOK-M3-SEC01',
      deviceType: 'LAPTOP',
      osName: 'macOS Sonoma',
      osVersion: '14.4.1',
      serialNumber: 'C02G9988MD6T',
      macAddress: 'F4:D4:88:5B:12:0A',
      trustState: 'TRUSTED',
      riskScore: 12,
      agentInstalled: true,
      agentVersion: 'v3.8.4-RELEASE',
      lastSeenAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      lastIp: '198.51.100.45',
      compliance: {
        diskEncrypted: true,
        firewallEnabled: true,
        antivirusActive: true,
        osUpdated: true,
        jailbrokenOrRooted: false,
        isCompliant: true,
      },
    },
    {
      id: 'dev_002',
      ownerId: 'usr_003',
      ownerName: 'David Chen',
      deviceName: 'SEC-THINKPAD-X1-04',
      deviceType: 'LAPTOP',
      osName: 'Windows 11 Enterprise',
      osVersion: '23H2 (22631.3296)',
      serialNumber: 'PF3A9921',
      macAddress: '8C:16:45:90:3A:D1',
      trustState: 'TRUSTED',
      riskScore: 18,
      agentInstalled: true,
      agentVersion: 'v3.8.4-RELEASE',
      lastSeenAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      lastIp: '203.0.113.88',
      compliance: {
        diskEncrypted: true,
        firewallEnabled: true,
        antivirusActive: true,
        osUpdated: true,
        jailbrokenOrRooted: false,
        isCompliant: true,
      },
    },
    {
      id: 'dev_003',
      ownerId: 'usr_005',
      ownerName: 'James Wilson',
      deviceName: 'DEV-DELL-LATITUDE-81',
      deviceType: 'LAPTOP',
      osName: 'Ubuntu Linux',
      osVersion: '22.04 LTS',
      serialNumber: '4HG8891B',
      macAddress: '70:85:C2:5E:21:44',
      trustState: 'UNTRUSTED',
      riskScore: 65,
      agentInstalled: true,
      agentVersion: 'v3.2.0-OUTDATED',
      lastSeenAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      lastIp: '185.220.101.4',
      compliance: {
        diskEncrypted: false,
        firewallEnabled: true,
        antivirusActive: false,
        osUpdated: false,
        jailbrokenOrRooted: false,
        isCompliant: false,
      },
    },
    {
      id: 'dev_004',
      ownerId: 'usr_006',
      ownerName: 'Priya Patel',
      deviceName: 'FIN-IPHONE-15-PRO',
      deviceType: 'MOBILE',
      osName: 'iOS',
      osVersion: '17.3.1',
      serialNumber: 'DX39981LL',
      macAddress: '3C:06:30:4F:7E:11',
      trustState: 'UNTRUSTED',
      riskScore: 48,
      agentInstalled: false,
      agentVersion: 'N/A',
      lastSeenAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      lastIp: '198.51.100.99',
      compliance: {
        diskEncrypted: true,
        firewallEnabled: false,
        antivirusActive: false,
        osUpdated: true,
        jailbrokenOrRooted: false,
        isCompliant: false,
      },
    },
    {
      id: 'dev_005',
      ownerId: 'usr_005',
      ownerName: 'James Wilson',
      deviceName: 'UNKNOWN-ANDROID-ROGUE',
      deviceType: 'MOBILE',
      osName: 'Android (Custom ROM)',
      osVersion: '13.0-Lineage',
      serialNumber: 'UNKNOWN_SER_99',
      macAddress: '00:1A:2B:3C:4D:5E',
      trustState: 'BLOCKED',
      riskScore: 95,
      agentInstalled: false,
      agentVersion: 'N/A',
      lastSeenAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
      lastIp: '45.154.255.8',
      compliance: {
        diskEncrypted: false,
        firewallEnabled: false,
        antivirusActive: false,
        osUpdated: false,
        jailbrokenOrRooted: true,
        isCompliant: false,
      },
    },
  ] as Device[],

  resources: [
    {
      id: 'res_001',
      name: 'Production Kubernetes Cluster API (AWS EKS)',
      resourceType: 'INFRASTRUCTURE',
      sensitivity: 'CRITICAL',
      endpointUrl: 'https://k8s-prod.us-east-1.defense-zero.corp:6443',
      requiresMfa: true,
      minTrustLevel: 'TRUSTED',
    },
    {
      id: 'res_002',
      name: 'Customer Financial Ledger & Core PostgreSQL Database',
      resourceType: 'DATABASE',
      sensitivity: 'CRITICAL',
      endpointUrl: 'postgresql://db-ledger-primary.internal:5432/finance',
      requiresMfa: true,
      minTrustLevel: 'TRUSTED',
    },
    {
      id: 'res_003',
      name: 'Internal HR & Payroll Portal (Workday Bridge)',
      resourceType: 'WEB_APP',
      sensitivity: 'HIGH',
      endpointUrl: 'https://hr-portal.defense-zero.corp',
      requiresMfa: true,
      minTrustLevel: 'TRUSTED',
    },
    {
      id: 'res_004',
      name: 'Corporate GitHub Enterprise Repository',
      resourceType: 'CODE_REPOSITORY',
      sensitivity: 'HIGH',
      endpointUrl: 'https://github.defense-zero.corp',
      requiresMfa: true,
      minTrustLevel: 'TRUSTED',
    },
    {
      id: 'res_005',
      name: 'Enterprise Document & Knowledge Base (Wiki)',
      resourceType: 'DOCUMENTATION',
      sensitivity: 'MEDIUM',
      endpointUrl: 'https://docs.defense-zero.corp',
      requiresMfa: false,
      minTrustLevel: 'UNTRUSTED',
    },
  ] as Resource[],

  policies: [
    {
      id: 'pol_001',
      name: 'Critical Infrastructure Strict Zero-Trust Policy',
      description: 'Enforces hardware FIDO2 MFA, mandatory disk encryption, active EDR agent, and composite risk < 35 for all CRITICAL resources.',
      priority: 1,
      minDeviceTrust: 'TRUSTED',
      requireEncryption: true,
      requireMfa: true,
      maxUserRisk: 30,
      maxDeviceRisk: 25,
      defaultAction: 'ALLOW',
      isActive: true,
    },
    {
      id: 'pol_002',
      name: 'Quarantine & Block Policy for Untrusted / Rooted Endpoints',
      description: 'Immediately DENIES access to any endpoint identified as jailbroken, unencrypted, or flagged as BLOCKED in inventory.',
      priority: 2,
      minDeviceTrust: 'TRUSTED',
      requireEncryption: true,
      requireMfa: false,
      maxUserRisk: 80,
      maxDeviceRisk: 60,
      defaultAction: 'DENY',
      isActive: true,
    },
    {
      id: 'pol_003',
      name: 'Adaptive Step-Up Authentication Policy',
      description: 'Prompts users for biometric step-up MFA if accessing from new geographical zones or risk score rises between 35 and 65.',
      priority: 3,
      minDeviceTrust: 'UNTRUSTED',
      requireEncryption: false,
      requireMfa: true,
      maxUserRisk: 65,
      maxDeviceRisk: 50,
      defaultAction: 'REQUIRE_MFA',
      isActive: true,
    },
  ] as AccessPolicy[],

  decisions: [
    {
      id: 'dec_101',
      profileId: 'usr_002',
      profileName: 'Elena Rostova',
      role: 'Security Administrator',
      deviceId: 'dev_001',
      deviceName: 'SOC-MACBOOK-M3-SEC01',
      resourceId: 'res_001',
      resourceName: 'Production Kubernetes Cluster API (AWS EKS)',
      resourceSensitivity: 'CRITICAL',
      decision: 'ALLOW',
      calculatedRiskScore: 18,
      decisionReason: 'Identity verified with hardware token, endpoint disk encrypted, CrowdStrike EDR verified, low baseline risk.',
      factors: ['MFA Verified (FIDO2)', 'Full Disk Encryption Active', 'Zero Geolocation Velocity Discrepancy'],
      requestIp: '198.51.100.45',
      requestLocation: 'Reston, VA, United States',
      authStrength: 'FIDO2_PASSKEY',
      evaluatedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    },
    {
      id: 'dec_102',
      profileId: 'usr_005',
      profileName: 'James Wilson',
      role: 'Employee',
      deviceId: 'dev_003',
      deviceName: 'DEV-DELL-LATITUDE-81',
      resourceId: 'res_002',
      resourceName: 'Customer Financial Ledger & Core PostgreSQL Database',
      resourceSensitivity: 'CRITICAL',
      decision: 'DENY',
      calculatedRiskScore: 84,
      decisionReason: 'Device disk encryption disabled, EDR agent outdated, requesting IP mapped to known Tor exit node.',
      factors: ['Device Unencrypted', 'Suspicious IP Reputation', 'Resource Sensitivity CRITICAL'],
      requestIp: '185.220.101.4',
      requestLocation: 'Frankfurt, Germany',
      authStrength: 'PASSWORD',
      evaluatedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    },
    {
      id: 'dec_103',
      profileId: 'usr_006',
      profileName: 'Priya Patel',
      role: 'Employee',
      deviceId: 'dev_004',
      deviceName: 'FIN-IPHONE-15-PRO',
      resourceId: 'res_003',
      resourceName: 'Internal HR & Payroll Portal (Workday Bridge)',
      resourceSensitivity: 'HIGH',
      decision: 'REQUIRE_MFA',
      calculatedRiskScore: 52,
      decisionReason: 'Accessing HIGH sensitivity resource from mobile endpoint lacking enterprise management profile. Step-up MFA required.',
      factors: ['MDM Agent Not Installed', 'High Resource Sensitivity', 'Step-up Authentication Triggered'],
      requestIp: '198.51.100.99',
      requestLocation: 'New York, NY, United States',
      authStrength: 'PASSWORD',
      evaluatedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    },
    {
      id: 'dec_104',
      profileId: 'usr_004',
      profileName: 'Sarah Miller',
      role: 'IT Administrator',
      deviceId: 'dev_002',
      deviceName: 'SEC-THINKPAD-X1-04',
      resourceId: 'res_004',
      resourceName: 'Corporate GitHub Enterprise Repository',
      resourceSensitivity: 'HIGH',
      decision: 'ALLOW',
      calculatedRiskScore: 24,
      decisionReason: 'Compliant Windows 11 device, BitLocker verified, corporate subnet authentication.',
      factors: ['Trusted Corporate Device', 'BitLocker Active', 'Secure IP Range'],
      requestIp: '198.51.100.104',
      requestLocation: 'Reston, VA, United States',
      authStrength: 'PASSWORD_MFA',
      evaluatedAt: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
    },
  ] as AccessDecision[],

  events: [
    {
      id: 'evt_201',
      eventType: 'AUTH_SUCCESS',
      severity: 'INFO',
      sourceIp: '198.51.100.45',
      location: 'Reston, VA (US)',
      userName: 'Elena Rostova',
      deviceName: 'SOC-MACBOOK-M3-SEC01',
      description: 'Zero-Trust single sign-on authenticated via WebAuthn hardware token.',
      timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    },
    {
      id: 'evt_202',
      eventType: 'POLICY_EVALUATION_DENY',
      severity: 'HIGH',
      sourceIp: '185.220.101.4',
      location: 'Frankfurt (DE)',
      userName: 'James Wilson',
      deviceName: 'DEV-DELL-LATITUDE-81',
      description: 'Zero-Trust Policy Engine blocked access to Customer Financial Ledger (Risk Score: 84).',
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    },
    {
      id: 'evt_203',
      eventType: 'SUSPICIOUS_LOGIN_BURST',
      severity: 'CRITICAL',
      sourceIp: '45.154.255.8',
      location: 'Bucharest (RO)',
      userName: 'UNKNOWN_USER',
      description: 'Multiple rapid failed authentication attempts (14 attempts in 30 seconds) targeting admin accounts.',
      timestamp: new Date(Date.now() - 19 * 60 * 1000).toISOString(),
    },
    {
      id: 'evt_204',
      eventType: 'DEVICE_POSTURE_VIOLATION',
      severity: 'MEDIUM',
      sourceIp: '198.51.100.99',
      location: 'New York, NY (US)',
      userName: 'Priya Patel',
      deviceName: 'FIN-IPHONE-15-PRO',
      description: 'Endpoint health check reports missing enterprise EDR profile on mobile device.',
      timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    },
    {
      id: 'evt_205',
      eventType: 'DEVICE_QUARANTINE_APPLIED',
      severity: 'CRITICAL',
      sourceIp: '45.154.255.8',
      location: 'Bucharest (RO)',
      userName: 'James Wilson',
      deviceName: 'UNKNOWN-ANDROID-ROGUE',
      description: 'Automated policy quarantined rooted Android device with custom ROM attempting SSH bridge.',
      timestamp: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    },
  ] as SecurityEvent[],

  alerts: [
    {
      id: 'alt_001',
      ruleCode: 'RULE_BRUTE_FORCE_01',
      title: 'Credential Stuffing & Rapid Brute Force Attack',
      severity: 'CRITICAL',
      sourceUser: 'admin@defense-zero.corp',
      sourceDevice: 'UNKNOWN-HOST',
      sourceIp: '45.154.255.8',
      description: '14 failed authentication attempts across 3 minutes targeting privileged management console.',
      status: 'INVESTIGATING',
      assignedAnalyst: 'David Chen',
      recommendedAction: 'Block offending source IP at Cloudflare WAF, enforce universal tenant MFA, invalidate active sessions.',
      detectionTime: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    },
    {
      id: 'alt_002',
      ruleCode: 'RULE_UNTRUSTED_DEV_02',
      title: 'Non-Compliant Device Access to Sensitive Financial Data',
      severity: 'HIGH',
      sourceUser: 'james.wilson@defense-zero.corp',
      sourceDevice: 'DEV-DELL-LATITUDE-81',
      sourceIp: '185.220.101.4',
      description: 'Endpoint with disabled disk encryption and outdated EDR agent attempted access to core database ledger.',
      status: 'NEW',
      assignedAnalyst: 'Elena Rostova',
      recommendedAction: 'Quarantine device in Endpoint Management console and notify user to install security updates.',
      detectionTime: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    },
    {
      id: 'alt_003',
      ruleCode: 'RULE_ANOMALOUS_LOC_03',
      title: 'Impossible Travel Anomaly Detected',
      severity: 'HIGH',
      sourceUser: 'james.wilson@defense-zero.corp',
      sourceDevice: 'DEV-DELL-LATITUDE-81',
      sourceIp: '185.220.101.4',
      description: 'User authenticated from Austin, TX and Frankfurt, Germany within 35 minutes (speed > 1200 km/h).',
      status: 'NEW',
      assignedAnalyst: 'Unassigned',
      recommendedAction: 'Challenge session with biometric push notification; suspend active tokens if unconfirmed.',
      detectionTime: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    },
    {
      id: 'alt_004',
      ruleCode: 'RULE_MFA_MISSING_04',
      title: 'Privileged User Operating Without Hardware Token',
      severity: 'MEDIUM',
      sourceUser: 'priya.patel@defense-zero.corp',
      sourceDevice: 'FIN-IPHONE-15-PRO',
      sourceIp: '198.51.100.99',
      description: 'Financial Controller account is lacking mandatory FIDO2 hardware MFA enrollment.',
      status: 'NEW',
      assignedAnalyst: 'Sarah Miller',
      recommendedAction: 'Trigger mandatory IT enrollment workflow upon next sign-in.',
      detectionTime: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    },
  ] as SecurityAlert[],

  incidents: [
    {
      id: 'inc_001',
      incidentNumber: 'INC-2026-081',
      title: 'Distributed Credential Stuffing & External Gateway Reconnaissance',
      severity: 'CRITICAL',
      status: 'INVESTIGATING',
      leadAnalyst: 'David Chen',
      mitreTag: 'T1110.003 - Password Spraying',
      rootCause: 'Compromised third-party vendor credential matched public credential dump; attacker tested against public API gateway.',
      createdAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
      notes: [
        {
          id: 'note_01',
          author: 'David Chen',
          timestamp: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
          content: 'Confirmed malicious IP cluster originating from AS9009 (M247 Ltd). Attacker utilized rotating User-Agent strings.',
          actionType: 'EVIDENCE',
        },
        {
          id: 'note_02',
          author: 'Elena Rostova',
          timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
          content: 'Enacted rate limiting policy at WAF edge. Offending /24 subnet blocked for 48 hours.',
          actionType: 'CONTAINMENT_ACTION',
        },
      ],
    },
    {
      id: 'inc_002',
      incidentNumber: 'INC-2026-079',
      title: 'Unmanaged Rooted Android Device Ingress Attempt',
      severity: 'HIGH',
      status: 'CONTAINED',
      leadAnalyst: 'Elena Rostova',
      mitreTag: 'T1078 - Valid Accounts',
      rootCause: 'Contractor attempted to test internal staging endpoints using personal rooted Android phone without MDM profile.',
      createdAt: new Date(Date.now() - 320 * 60 * 1000).toISOString(),
      notes: [
        {
          id: 'note_03',
          author: 'Elena Rostova',
          timestamp: new Date(Date.now() - 300 * 60 * 1000).toISOString(),
          content: 'Zero-Trust PEP immediately rejected access (Device Risk: 95). Endpoint device ID quarantined in registry.',
          actionType: 'CONTAINMENT_ACTION',
        },
      ],
    },
  ] as Incident[],

  detectionRules: [
    {
      id: 'rule_1',
      code: 'RULE_BRUTE_FORCE_01',
      name: 'Rapid Authentication Brute Force Detector',
      severity: 'CRITICAL',
      mitreTactic: 'Credential Access',
      mitreTechnique: 'T1110.001 - Password Guessing',
      description: 'Triggers when > 3 failed logins occur from the same IP or target user within a 5-minute rolling window.',
      triggerCount: 14,
      isActive: true,
    },
    {
      id: 'rule_2',
      code: 'RULE_IMPOSSIBLE_TRAVEL_02',
      name: 'Impossible Geolocation Velocity Anomaly',
      severity: 'HIGH',
      mitreTactic: 'Initial Access',
      mitreTechnique: 'T1078 - Valid Accounts',
      description: 'Triggers when sequential logins for the same identity occur at physical distances requiring > 800 km/h velocity.',
      triggerCount: 3,
      isActive: true,
    },
    {
      id: 'rule_3',
      code: 'RULE_QUARANTINED_DEV_03',
      name: 'Blocked or Quarantined Device Connection Attempt',
      severity: 'CRITICAL',
      mitreTactic: 'Defense Evasion',
      mitreTechnique: 'T1200 - Hardware Additions',
      description: 'Detects any incoming TLS handshake originating from a device serial number marked as BLOCKED.',
      triggerCount: 8,
      isActive: true,
    },
    {
      id: 'rule_4',
      code: 'RULE_UNENCRYPTED_ENDPOINT_04',
      name: 'Non-Compliant Endpoint Accessing High/Critical Resource',
      severity: 'HIGH',
      mitreTactic: 'Collection',
      mitreTechnique: 'T1005 - Data from Local System',
      description: 'Alerts when an endpoint lacking BitLocker/FileVault attempts access to resources marked HIGH or CRITICAL.',
      triggerCount: 6,
      isActive: true,
    },
    {
      id: 'rule_5',
      code: 'RULE_PRIVILEGE_HOURS_05',
      name: 'Off-Hours Administrative Privilege Escalation',
      severity: 'MEDIUM',
      mitreTactic: 'Privilege Escalation',
      mitreTechnique: 'T1068 - Exploitation for Privilege Escalation',
      description: 'Flags role modification or security policy changes executed between 22:00 and 06:00 local time.',
      triggerCount: 2,
      isActive: true,
    },
  ] as DetectionRule[],

  auditLogs: [
    {
      id: 'aud_001',
      actor: 'Marcus Vance (Super Admin)',
      action: 'POLICY_UPDATE',
      resourceType: 'ACCESS_POLICY',
      resourceId: 'pol_001',
      ipAddress: '198.51.100.22',
      timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
      details: 'Elevated minimum device trust threshold to REQUIRE_FIDO2 on all Critical Infrastructure resources.',
      hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    },
    {
      id: 'aud_002',
      actor: 'Elena Rostova (Sec Admin)',
      action: 'DEVICE_QUARANTINE',
      resourceType: 'DEVICE',
      resourceId: 'dev_005',
      ipAddress: '198.51.100.45',
      timestamp: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
      details: 'Marked device UNKNOWN-ANDROID-ROGUE as BLOCKED due to rooted kernel status.',
      hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    },
    {
      id: 'aud_003',
      actor: 'David Chen (Sec Analyst)',
      action: 'INCIDENT_ESCALATION',
      resourceType: 'INCIDENT',
      resourceId: 'inc_001',
      ipAddress: '203.0.113.88',
      timestamp: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
      details: 'Escalated Credential Stuffing investigation to Severity CRITICAL with MITRE T1110 tag.',
      hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    },
    {
      id: 'aud_004',
      actor: 'SYSTEM_PDP_ENGINE',
      action: 'ACCESS_EVALUATION',
      resourceType: 'RESOURCE',
      resourceId: 'res_002',
      ipAddress: '185.220.101.4',
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      details: 'Automated Zero-Trust DENY decision rendered for user James Wilson against Customer Database.',
      hash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    },
  ] as AuditLog[],
};

// Helper: Append Tamper-Evident Audit Log with Cryptographic Hash
function recordAuditLog(actor: string, action: string, resourceType: string, resourceId: string, ipAddress: string, details: string) {
  const timestamp = new Date().toISOString();
  const lastHash = db.auditLogs.length > 0 ? db.auditLogs[0].hash : '0000000000000000000000000000000000000000000000000000000000000000';
  const payloadToHash = `${lastHash}|${actor}|${action}|${resourceType}|${resourceId}|${timestamp}|${details}`;
  const hash = crypto.createHash('sha256').update(payloadToHash).digest('hex');

  const logEntry: AuditLog = {
    id: `aud_${Date.now()}`,
    actor,
    action,
    resourceType,
    resourceId,
    ipAddress,
    timestamp,
    details,
    hash,
  };

  db.auditLogs.unshift(logEntry);
  return logEntry;
}

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// System Health & Risk Summary
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    zeroTrustStatus: 'ACTIVE_ENFORCEMENT',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    engine: 'NIST-800-207-Compliant-PDP',
  });
});

// Auth Endpoints
app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = db.users.find(u => u.role === currentUserRole) || db.users[1];
  res.json({
    user,
    currentRole: currentUserRole,
    availableRoles: ['Super Administrator', 'Security Administrator', 'Security Analyst', 'IT Administrator', 'Employee'],
  });
});

app.post('/api/auth/switch-role', (req: Request, res: Response) => {
  const { role } = req.body;
  if (!role) {
    return res.status(400).json({ error: 'Role is required' });
  }
  currentUserRole = role;
  recordAuditLog(
    `Role Switcher (${role})`,
    'ROLE_SWITCH',
    'USER_SESSION',
    'sess_current',
    req.ip || '127.0.0.1',
    `User switched active testing persona to: ${role}`
  );
  res.json({ success: true, activeRole: currentUserRole });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  res.json({ token: `jwt_${Date.now()}`, user });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.json({ success: true });
});

// Users IAM
app.get('/api/users', (req: Request, res: Response) => {
  res.json(db.users);
});

app.post('/api/users', (req: Request, res: Response) => {
  const { fullName, email, department, title, role, mfaEnabled, mfaType } = req.body;
  const newUser: Profile = {
    id: `usr_${Date.now()}`,
    email,
    fullName,
    department: department || 'General',
    title: title || 'Staff',
    role: role || 'Employee',
    status: 'ACTIVE',
    mfaEnabled: !!mfaEnabled,
    mfaType: mfaType || 'TOTP Authenticator',
    riskScore: 20,
    lastLoginAt: new Date().toISOString(),
    lastLoginIp: req.ip || '198.51.100.1',
  };
  db.users.push(newUser);
  recordAuditLog(currentUserRole, 'USER_CREATE', 'PROFILE', newUser.id, req.ip || '127.0.0.1', `Created user ${email} with role ${role}`);
  res.status(201).json(newUser);
});

app.patch('/api/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = db.users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { status, role, mfaEnabled, riskScore } = req.body;
  if (status) user.status = status;
  if (role) user.role = role;
  if (typeof mfaEnabled === 'boolean') user.mfaEnabled = mfaEnabled;
  if (typeof riskScore === 'number') user.riskScore = riskScore;

  recordAuditLog(currentUserRole, 'USER_UPDATE', 'PROFILE', id, req.ip || '127.0.0.1', `Updated user attributes for ${user.email}`);
  res.json(user);
});

// Devices Endpoints
app.get('/api/devices', (req: Request, res: Response) => {
  res.json(db.devices);
});

app.post('/api/devices', (req: Request, res: Response) => {
  const { deviceName, deviceType, osName, osVersion, ownerId, serialNumber, compliance } = req.body;
  const owner = db.users.find(u => u.id === ownerId) || db.users[0];

  const newDevice: Device = {
    id: `dev_${Date.now()}`,
    ownerId: owner.id,
    ownerName: owner.fullName,
    deviceName,
    deviceType: deviceType || 'LAPTOP',
    osName,
    osVersion: osVersion || '1.0',
    serialNumber: serialNumber || `SER_${Date.now().toString(36).toUpperCase()}`,
    macAddress: '00:50:56:C0:00:08',
    trustState: 'TRUSTED',
    riskScore: 15,
    agentInstalled: true,
    agentVersion: 'v3.8.4-RELEASE',
    lastSeenAt: new Date().toISOString(),
    lastIp: req.ip || '198.51.100.50',
    compliance: {
      diskEncrypted: compliance?.diskEncrypted ?? true,
      firewallEnabled: compliance?.firewallEnabled ?? true,
      antivirusActive: compliance?.antivirusActive ?? true,
      osUpdated: compliance?.osUpdated ?? true,
      jailbrokenOrRooted: false,
      isCompliant: true,
    },
  };

  db.devices.push(newDevice);
  recordAuditLog(currentUserRole, 'DEVICE_REGISTER', 'DEVICE', newDevice.id, req.ip || '127.0.0.1', `Registered device ${deviceName} for ${owner.fullName}`);
  res.status(201).json(newDevice);
});

app.patch('/api/devices/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const device = db.devices.find(d => d.id === id);
  if (!device) return res.status(404).json({ error: 'Device not found' });

  const { trustState, compliance, riskScore } = req.body;
  if (trustState) device.trustState = trustState;
  if (typeof riskScore === 'number') device.riskScore = riskScore;
  if (compliance) {
    device.compliance = { ...device.compliance, ...compliance };
    device.compliance.isCompliant =
      device.compliance.diskEncrypted &&
      device.compliance.firewallEnabled &&
      device.compliance.antivirusActive &&
      device.compliance.osUpdated &&
      !device.compliance.jailbrokenOrRooted;
  }

  recordAuditLog(currentUserRole, 'DEVICE_UPDATE', 'DEVICE', id, req.ip || '127.0.0.1', `Modified device state: ${device.deviceName} -> ${trustState || 'updated'}`);
  res.json(device);
});

app.post('/api/devices/:id/quarantine', (req: Request, res: Response) => {
  const { id } = req.params;
  const device = db.devices.find(d => d.id === id);
  if (!device) return res.status(404).json({ error: 'Device not found' });

  device.trustState = 'BLOCKED';
  device.riskScore = 95;

  recordAuditLog(currentUserRole, 'DEVICE_QUARANTINE', 'DEVICE', id, req.ip || '127.0.0.1', `Emergency quarantine applied to device ${device.deviceName}`);
  
  // Create security alert
  db.alerts.unshift({
    id: `alt_${Date.now()}`,
    ruleCode: 'RULE_DEVICE_QUARANTINE_01',
    title: `Device Quarantined: ${device.deviceName}`,
    severity: 'HIGH',
    sourceUser: device.ownerName,
    sourceDevice: device.deviceName,
    sourceIp: device.lastIp,
    description: `Manual or automated quarantine activated. All network and resource access revoked.`,
    status: 'INVESTIGATING',
    assignedAnalyst: 'Elena Rostova',
    recommendedAction: 'Verify endpoint integrity with fleet administrator before lifting quarantine.',
    detectionTime: new Date().toISOString(),
  });

  res.json({ success: true, device });
});

// Resources Endpoints
app.get('/api/resources', (req: Request, res: Response) => {
  res.json(db.resources);
});

// Policies Endpoints
app.get('/api/policies', (req: Request, res: Response) => {
  res.json(db.policies);
});

app.post('/api/policies', (req: Request, res: Response) => {
  const { name, description, priority, minDeviceTrust, requireEncryption, requireMfa, maxUserRisk, maxDeviceRisk, defaultAction } = req.body;
  const newPolicy: AccessPolicy = {
    id: `pol_${Date.now()}`,
    name,
    description,
    priority: priority || db.policies.length + 1,
    minDeviceTrust: minDeviceTrust || 'TRUSTED',
    requireEncryption: !!requireEncryption,
    requireMfa: !!requireMfa,
    maxUserRisk: maxUserRisk ?? 50,
    maxDeviceRisk: maxDeviceRisk ?? 50,
    defaultAction: defaultAction || 'ALLOW',
    isActive: true,
  };
  db.policies.push(newPolicy);
  recordAuditLog(currentUserRole, 'POLICY_CREATE', 'ACCESS_POLICY', newPolicy.id, req.ip || '127.0.0.1', `Created Zero-Trust access policy: ${name}`);
  res.status(201).json(newPolicy);
});

app.patch('/api/policies/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const policy = db.policies.find(p => p.id === id);
  if (!policy) return res.status(404).json({ error: 'Policy not found' });

  Object.assign(policy, req.body);
  recordAuditLog(currentUserRole, 'POLICY_UPDATE', 'ACCESS_POLICY', id, req.ip || '127.0.0.1', `Updated policy: ${policy.name}`);
  res.json(policy);
});

// ZERO-TRUST ACCESS EVALUATION ENGINE (Core PDP)
app.post('/api/access/evaluate', (req: Request, res: Response) => {
  const { userId, deviceId, resourceId, requestIp, requestLocation, authStrength } = req.body;

  const user = db.users.find(u => u.id === userId) || db.users[0];
  const device = db.devices.find(d => d.id === deviceId) || db.devices[0];
  const resource = db.resources.find(r => r.id === resourceId) || db.resources[0];

  const ip = requestIp || req.ip || '198.51.100.1';
  const location = requestLocation || 'Washington, DC, United States';
  const auth = authStrength || (user.mfaEnabled ? 'PASSWORD_MFA' : 'PASSWORD');

  // Multi-Variable Zero-Trust Risk Algorithm
  let userRiskContribution = user.riskScore * 0.25;
  let deviceRiskContribution = device.riskScore * 0.30;
  
  let resourceSensitivityWeight = 15;
  if (resource.sensitivity === 'CRITICAL') resourceSensitivityWeight = 40;
  else if (resource.sensitivity === 'HIGH') resourceSensitivityWeight = 25;
  else if (resource.sensitivity === 'MEDIUM') resourceSensitivityWeight = 15;
  else resourceSensitivityWeight = 5;

  let networkRisk = 10;
  // If IP is known VPN/Tor or international anomaly
  if (ip.startsWith('185.') || ip.startsWith('45.')) {
    networkRisk = 40;
  }

  const calculatedRiskScore = Math.min(
    100,
    Math.round(userRiskContribution + deviceRiskContribution + resourceSensitivityWeight + (networkRisk * 0.20))
  );

  const factors: string[] = [];
  let decision: AccessDecision['decision'] = 'ALLOW';
  let decisionReason = '';

  // Immediate Hard Denials
  if (user.status === 'SUSPENDED') {
    decision = 'DENY';
    decisionReason = `User account (${user.email}) is currently SUSPENDED. All access denied.`;
    factors.push('Account Suspended');
  } else if (device.trustState === 'BLOCKED') {
    decision = 'DENY';
    decisionReason = `Endpoint (${device.deviceName}) is quarantined and marked BLOCKED in zero-trust inventory.`;
    factors.push('Device Quarantined / Blocked');
  } else if (device.compliance.jailbrokenOrRooted) {
    decision = 'DENY';
    decisionReason = 'Endpoint integrity failure: Device has been rooted/jailbroken. Kernel trust is broken.';
    factors.push('Rooted/Jailbroken OS');
  } else if (resource.sensitivity === 'CRITICAL' && !device.compliance.diskEncrypted) {
    decision = 'DENY';
    decisionReason = 'Policy Violation: CRITICAL resources strictly forbid access from unencrypted storage endpoints.';
    factors.push('Disk Encryption Missing for Critical Asset');
  } else if (calculatedRiskScore >= 75) {
    decision = 'DENY';
    decisionReason = `High composite risk score (${calculatedRiskScore}/100) exceeds maximum acceptable zero-trust threshold.`;
    factors.push(`Risk Score ${calculatedRiskScore} Exceeds Upper Limit (75)`);
  } else if (calculatedRiskScore >= 50 || resource.requiresMfa && auth === 'PASSWORD') {
    decision = 'REQUIRE_MFA';
    decisionReason = `Elevated risk posture (${calculatedRiskScore}) or resource requires step-up authentication. FIDO2/TOTP verification needed.`;
    factors.push('Step-Up MFA Required');
    if (!device.compliance.antivirusActive) factors.push('EDR Agent Offline');
    if (auth === 'PASSWORD') factors.push('Single Factor Password Only');
  } else if (calculatedRiskScore >= 35 && device.trustState === 'UNTRUSTED') {
    decision = 'REQUIRE_REVIEW';
    decisionReason = 'Untrusted device requesting high-impact asset. Access forwarded to SOC Analyst for review.';
    factors.push('Device Trust State UNTRUSTED', 'Requires Security Analyst Signoff');
  } else {
    decision = 'ALLOW';
    decisionReason = `Continuous verification passed. Device compliant (${device.osName}), identity verified, composite risk is within acceptable boundary (${calculatedRiskScore}/100).`;
    factors.push('Compliant Endpoint', 'Verified Identity Posture', 'Acceptable Risk Threshold');
  }

  const newDecision: AccessDecision = {
    id: `dec_${Date.now()}`,
    profileId: user.id,
    profileName: user.fullName,
    role: user.role,
    deviceId: device.id,
    deviceName: device.deviceName,
    resourceId: resource.id,
    resourceName: resource.name,
    resourceSensitivity: resource.sensitivity,
    decision,
    calculatedRiskScore,
    decisionReason,
    factors,
    requestIp: ip,
    requestLocation: location,
    authStrength: auth,
    evaluatedAt: new Date().toISOString(),
  };

  db.decisions.unshift(newDecision);

  // Record security event
  db.events.unshift({
    id: `evt_${Date.now()}`,
    eventType: decision === 'ALLOW' ? 'ACCESS_GRANTED' : 'ACCESS_EVAL_CHECK',
    severity: decision === 'DENY' ? 'HIGH' : decision === 'REQUIRE_MFA' ? 'MEDIUM' : 'INFO',
    sourceIp: ip,
    location,
    userName: user.fullName,
    deviceName: device.deviceName,
    description: `Zero-Trust Evaluation: ${decision} for ${resource.name} (Risk: ${calculatedRiskScore})`,
    timestamp: new Date().toISOString(),
  });

  // Record audit log
  recordAuditLog(
    user.fullName,
    `ACCESS_${decision}`,
    'RESOURCE',
    resource.id,
    ip,
    `Policy Evaluation: ${decision} on ${resource.name}. Reason: ${decisionReason}`
  );

  res.json(newDecision);
});

app.get('/api/access/decisions', (req: Request, res: Response) => {
  res.json(db.decisions);
});

// Security Events
app.get('/api/events', (req: Request, res: Response) => {
  res.json(db.events);
});

app.post('/api/events', (req: Request, res: Response) => {
  const { eventType, severity, sourceIp, location, userName, deviceName, description } = req.body;
  const newEvent: SecurityEvent = {
    id: `evt_${Date.now()}`,
    eventType: eventType || 'GENERIC_EVENT',
    severity: severity || 'INFO',
    sourceIp: sourceIp || req.ip || '127.0.0.1',
    location: location || 'Internal Network',
    userName: userName || 'SYSTEM',
    deviceName: deviceName || 'N/A',
    description: description || 'Telemetry logged.',
    timestamp: new Date().toISOString(),
  };
  db.events.unshift(newEvent);
  res.status(201).json(newEvent);
});

// Alerts
app.get('/api/alerts', (req: Request, res: Response) => {
  res.json(db.alerts);
});

app.patch('/api/alerts/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const alert = db.alerts.find(a => a.id === id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });

  const { status, assignedAnalyst } = req.body;
  if (status) alert.status = status;
  if (assignedAnalyst) alert.assignedAnalyst = assignedAnalyst;

  recordAuditLog(currentUserRole, 'ALERT_TRIAGE', 'ALERT', id, req.ip || '127.0.0.1', `Updated alert ${alert.title} status to ${status}`);
  res.json(alert);
});

// One-Click Mitigation Action
app.post('/api/alerts/:id/mitigate', (req: Request, res: Response) => {
  const { id } = req.params;
  const alert = db.alerts.find(a => a.id === id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });

  const { actionType } = req.body; // 'BLOCK_IP', 'QUARANTINE_DEVICE', 'RESET_USER_SESSIONS', 'FORCE_MFA'
  
  let actionSummary = '';
  if (actionType === 'QUARANTINE_DEVICE') {
    const dev = db.devices.find(d => d.deviceName === alert.sourceDevice);
    if (dev) {
      dev.trustState = 'BLOCKED';
      dev.riskScore = 95;
    }
    actionSummary = `Quarantined device ${alert.sourceDevice}. Network isolation enforced.`;
  } else if (actionType === 'RESET_USER_SESSIONS') {
    const usr = db.users.find(u => u.email === alert.sourceUser || u.fullName === alert.sourceUser);
    if (usr) {
      usr.riskScore = Math.max(10, usr.riskScore - 20);
    }
    actionSummary = `Invalidated all active sessions for ${alert.sourceUser}. Forced re-authentication.`;
  } else if (actionType === 'BLOCK_IP') {
    actionSummary = `Offending IP address ${alert.sourceIp} permanently added to ingress blocklist.`;
  } else {
    actionSummary = `Applied automated remediation: ${actionType}`;
  }

  alert.status = 'CONTAINED';
  recordAuditLog(currentUserRole, 'MITIGATION_EXECUTE', 'ALERT', id, req.ip || '127.0.0.1', `Executed mitigation: ${actionSummary}`);

  res.json({ success: true, alert, actionSummary });
});

// Detection Rules
app.get('/api/detection-rules', (req: Request, res: Response) => {
  res.json(db.detectionRules);
});

app.patch('/api/detection-rules/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const rule = db.detectionRules.find(r => r.id === id);
  if (!rule) return res.status(404).json({ error: 'Rule not found' });

  const { isActive, severity } = req.body;
  if (typeof isActive === 'boolean') rule.isActive = isActive;
  if (severity) rule.severity = severity;

  recordAuditLog(currentUserRole, 'RULE_UPDATE', 'DETECTION_RULE', id, req.ip || '127.0.0.1', `Toggled detection rule: ${rule.name}`);
  res.json(rule);
});

// Incidents
app.get('/api/incidents', (req: Request, res: Response) => {
  res.json(db.incidents);
});

app.post('/api/incidents', (req: Request, res: Response) => {
  const { title, severity, leadAnalyst, mitreTag, rootCause, initialNote } = req.body;
  const newIncident: Incident = {
    id: `inc_${Date.now()}`,
    incidentNumber: `INC-2026-${String(db.incidents.length + 82).padStart(3, '0')}`,
    title,
    severity: severity || 'HIGH',
    status: 'OPEN',
    leadAnalyst: leadAnalyst || 'Elena Rostova',
    mitreTag: mitreTag || 'T1078 - Valid Accounts',
    rootCause: rootCause || 'Investigation initialized.',
    createdAt: new Date().toISOString(),
    notes: [
      {
        id: `note_${Date.now()}`,
        author: currentUserRole,
        timestamp: new Date().toISOString(),
        content: initialNote || 'Security incident created and triage initiated.',
        actionType: 'NOTE',
      },
    ],
  };

  db.incidents.unshift(newIncident);
  recordAuditLog(currentUserRole, 'INCIDENT_CREATE', 'INCIDENT', newIncident.id, req.ip || '127.0.0.1', `Created incident ${newIncident.incidentNumber}: ${title}`);
  res.status(201).json(newIncident);
});

app.patch('/api/incidents/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const incident = db.incidents.find(i => i.id === id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });

  const { status, leadAnalyst, rootCause } = req.body;
  if (status) incident.status = status;
  if (leadAnalyst) incident.leadAnalyst = leadAnalyst;
  if (rootCause) incident.rootCause = rootCause;

  recordAuditLog(currentUserRole, 'INCIDENT_UPDATE', 'INCIDENT', id, req.ip || '127.0.0.1', `Updated incident ${incident.incidentNumber} to status ${status}`);
  res.json(incident);
});

app.post('/api/incidents/:id/notes', (req: Request, res: Response) => {
  const { id } = req.params;
  const incident = db.incidents.find(i => i.id === id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });

  const { content, actionType } = req.body;
  const newNote = {
    id: `note_${Date.now()}`,
    author: currentUserRole,
    timestamp: new Date().toISOString(),
    content: content || 'Status update logged.',
    actionType: actionType || 'NOTE',
  };

  incident.notes.push(newNote);
  recordAuditLog(currentUserRole, 'INCIDENT_NOTE_ADD', 'INCIDENT', id, req.ip || '127.0.0.1', `Added investigation note to ${incident.incidentNumber}`);
  res.status(201).json(newNote);
});

// Audit Logs
app.get('/api/audit-logs', (req: Request, res: Response) => {
  res.json(db.auditLogs);
});

// Reports & Metrics
app.get('/api/reports/security-summary', (req: Request, res: Response) => {
  const totalUsers = db.users.length;
  const activeUsers = db.users.filter(u => u.status === 'ACTIVE').length;
  const totalDevices = db.devices.length;
  const trustedDevices = db.devices.filter(d => d.trustState === 'TRUSTED').length;
  const untrustedDevices = db.devices.filter(d => d.trustState === 'UNTRUSTED').length;
  const blockedDevices = db.devices.filter(d => d.trustState === 'BLOCKED').length;
  const compliantDevices = db.devices.filter(d => d.compliance.isCompliant).length;

  const criticalAlerts = db.alerts.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length;
  const openIncidents = db.incidents.filter(i => i.status !== 'CLOSED').length;
  const deniedDecisions = db.decisions.filter(d => d.decision === 'DENY').length;
  const allowedDecisions = db.decisions.filter(d => d.decision === 'ALLOW').length;
  const mfaDecisions = db.decisions.filter(d => d.decision === 'REQUIRE_MFA').length;

  // Composite Organization Risk Score (0-100)
  const avgUserRisk = db.users.reduce((acc, u) => acc + u.riskScore, 0) / totalUsers;
  const avgDeviceRisk = db.devices.reduce((acc, d) => acc + d.riskScore, 0) / totalDevices;
  const alertWeight = criticalAlerts * 10;
  const overallRiskScore = Math.min(100, Math.round((avgUserRisk * 0.3) + (avgDeviceRisk * 0.4) + alertWeight));

  res.json({
    metrics: {
      totalUsers,
      activeUsers,
      totalDevices,
      trustedDevices,
      untrustedDevices,
      blockedDevices,
      compliantDevices,
      totalEvents: db.events.length,
      criticalAlerts,
      openIncidents,
      failedLogins: 14,
      deniedDecisions,
      allowedDecisions,
      mfaDecisions,
      overallRiskScore,
      riskLevel: overallRiskScore > 70 ? 'CRITICAL RISK' : overallRiskScore > 40 ? 'ELEVATED RISK' : 'HEALTHY / NOMINAL',
    },
    activityTrends: [
      { time: '00:00', allowed: 120, denied: 4, mfaChallenges: 18, riskScore: 28 },
      { time: '04:00', allowed: 45, denied: 18, mfaChallenges: 8, riskScore: 58 },
      { time: '08:00', allowed: 480, denied: 12, mfaChallenges: 94, riskScore: 34 },
      { time: '12:00', allowed: 650, denied: 8, mfaChallenges: 110, riskScore: 31 },
      { time: '16:00', allowed: 520, denied: 24, mfaChallenges: 82, riskScore: 42 },
      { time: '20:00', allowed: 210, denied: 38, mfaChallenges: 44, riskScore: 49 },
    ],
    alertsBySeverity: [
      { severity: 'Critical', count: db.alerts.filter(a => a.severity === 'CRITICAL').length, fill: '#ef4444' },
      { severity: 'High', count: db.alerts.filter(a => a.severity === 'HIGH').length, fill: '#f97316' },
      { severity: 'Medium', count: db.alerts.filter(a => a.severity === 'MEDIUM').length, fill: '#eab308' },
      { severity: 'Low', count: db.alerts.filter(a => a.severity === 'LOW').length, fill: '#3b82f6' },
    ],
    deviceComplianceBreakdown: [
      { name: 'Compliant & Trusted', value: compliantDevices, fill: '#10b981' },
      { name: 'Non-Compliant Posture', value: totalDevices - compliantDevices - blockedDevices, fill: '#f59e0b' },
      { name: 'Quarantined / Blocked', value: blockedDevices, fill: '#ef4444' },
    ],
  });
});

// SIMULATION ENGINE: Injects realistic attack scenarios so reviewers can test live reactivity!
app.post('/api/simulate', (req: Request, res: Response) => {
  const { scenario } = req.body;

  if (scenario === 'BRUTE_FORCE') {
    const attackIp = `194.26.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 250)}`;
    for (let i = 0; i < 5; i++) {
      db.events.unshift({
        id: `evt_sim_${Date.now()}_${i}`,
        eventType: 'AUTH_FAILURE_PASSWORD',
        severity: 'HIGH',
        sourceIp: attackIp,
        location: 'St. Petersburg, RU',
        userName: 'root@defense-zero.corp',
        description: `Rapid password spraying attempt #${i + 1} rejected.`,
        timestamp: new Date().toISOString(),
      });
    }

    db.alerts.unshift({
      id: `alt_sim_${Date.now()}`,
      ruleCode: 'RULE_BRUTE_FORCE_01',
      title: 'Active Distributed Brute Force Attack Triggered',
      severity: 'CRITICAL',
      sourceUser: 'root@defense-zero.corp',
      sourceDevice: 'UNKNOWN-BOTNET',
      sourceIp: attackIp,
      description: 'Multiple automated credential attempts detected within 10 seconds. Threshold violated.',
      status: 'NEW',
      assignedAnalyst: 'David Chen',
      recommendedAction: 'Edge WAF rate-limiting applied. Invalidate all active tokens.',
      detectionTime: new Date().toISOString(),
    });

    recordAuditLog('SECURITY_SIMULATOR', 'ATTACK_SIMULATION', 'THREAT_ENGINE', 'sim_brute', attackIp, 'Injected simulated Brute Force Attack scenario.');
    return res.json({ success: true, message: 'Simulated Brute Force attack executed. Check Security Events and Alerts.' });
  }

  if (scenario === 'IMPOSSIBLE_TRAVEL') {
    const user = db.users[4]; // James Wilson
    db.events.unshift({
      id: `evt_sim_${Date.now()}`,
      eventType: 'GEO_ANOMALY',
      severity: 'HIGH',
      sourceIp: '185.220.101.9',
      location: 'Tokyo, Japan',
      userName: user.fullName,
      deviceName: 'DEV-DELL-LATITUDE-81',
      description: `Authentication observed in Tokyo 14 minutes after previous session in Austin, TX. Speed: 1450 km/h.`,
      timestamp: new Date().toISOString(),
    });

    db.alerts.unshift({
      id: `alt_sim_${Date.now()}`,
      ruleCode: 'RULE_IMPOSSIBLE_TRAVEL_02',
      title: 'Impossible Travel Anomaly Flagged',
      severity: 'HIGH',
      sourceUser: user.email,
      sourceDevice: 'DEV-DELL-LATITUDE-81',
      sourceIp: '185.220.101.9',
      description: `Simultaneous sessions detected across continents within impossible flight duration.`,
      status: 'NEW',
      assignedAnalyst: 'Elena Rostova',
      recommendedAction: 'Enforce biometric verification and review recently accessed data.',
      detectionTime: new Date().toISOString(),
    });

    recordAuditLog('SECURITY_SIMULATOR', 'ATTACK_SIMULATION', 'THREAT_ENGINE', 'sim_travel', '185.220.101.9', 'Injected simulated Impossible Travel scenario.');
    return res.json({ success: true, message: 'Simulated Impossible Travel alert injected.' });
  }

  if (scenario === 'NON_COMPLIANT_ACCESS') {
    const uncompliantDev = db.devices[2]; // DEV-DELL-LATITUDE-81
    const criticalRes = db.resources[0]; // Production K8s
    
    // Evaluate via Zero-Trust PDP
    const decision: AccessDecision = {
      id: `dec_sim_${Date.now()}`,
      profileId: uncompliantDev.ownerId,
      profileName: uncompliantDev.ownerName,
      role: 'Employee',
      deviceId: uncompliantDev.id,
      deviceName: uncompliantDev.deviceName,
      resourceId: criticalRes.id,
      resourceName: criticalRes.name,
      resourceSensitivity: 'CRITICAL',
      decision: 'DENY',
      calculatedRiskScore: 92,
      decisionReason: 'Device disk encryption disabled and EDR agent outdated. Access to CRITICAL production infrastructure blocked.',
      factors: ['Disk Encryption Disabled', 'EDR Agent Outdated', 'Resource Sensitivity: CRITICAL'],
      requestIp: '198.51.100.88',
      requestLocation: 'Austin, TX, United States',
      authStrength: 'PASSWORD',
      evaluatedAt: new Date().toISOString(),
    };

    db.decisions.unshift(decision);
    db.events.unshift({
      id: `evt_sim_${Date.now()}`,
      eventType: 'ACCESS_DENIED_POSTURE',
      severity: 'HIGH',
      sourceIp: '198.51.100.88',
      location: 'Austin, TX (US)',
      userName: uncompliantDev.ownerName,
      deviceName: uncompliantDev.deviceName,
      description: `Zero-Trust Policy blocked access to ${criticalRes.name} due to non-compliant device posture.`,
      timestamp: new Date().toISOString(),
    });

    recordAuditLog('SECURITY_SIMULATOR', 'ATTACK_SIMULATION', 'THREAT_ENGINE', 'sim_posture', '198.51.100.88', 'Injected Non-Compliant Endpoint access attempt.');
    return res.json({ success: true, message: 'Non-compliant endpoint access simulated and blocked by Zero-Trust PDP.' });
  }

  res.status(400).json({ error: 'Unknown simulation scenario' });
});

// -------------------------------------------------------------
// VITE DEV SERVER / STATIC ASSET MOUNT
// -------------------------------------------------------------
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[Zero-Trust SOC Engine] Backend API & PDP Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start Zero-Trust server:', err);
});
