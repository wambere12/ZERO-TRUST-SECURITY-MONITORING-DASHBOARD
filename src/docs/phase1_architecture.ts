export interface ArchitectureSection {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  codeSnippet?: string;
  codeLang?: string;
}

export const PHASE_1_ARCHITECTURE_DOCS: ArchitectureSection[] = [
  {
    id: "executive-overview",
    title: "1. Executive Summary & Zero-Trust Architectural Philosophy",
    category: "Architecture",
    summary: "NIST SP 800-207 Zero-Trust Architecture (ZTA) framework principles and core axioms.",
    content: `The Zero-Trust Security Monitoring Dashboard (ZTSMD) is built strictly on the principle: "Never Trust, Always Verify." 

In traditional perimeter security models ("Castle and Moat"), internal networks are inherently trusted once a boundary firewall or VPN is breached. ZTSMD departs fundamentally from this outdated assumption:

1. All data sources and computing services are considered resources.
2. All communication is secured regardless of network location (internal corporate LAN vs public coffee shop).
3. Access to individual enterprise resources is granted on a per-session basis.
4. Access to resources is determined by dynamic policy—including the observable state of user identity, application/service, and the requesting asset (device posture).
5. The enterprise monitors and measures the integrity and security posture of all owned and associated assets.
6. All resource authentication and authorization are dynamic and strictly enforced before access is allowed.
7. Continuous telemetry collection is ingested to dynamically recalculate risk scores in real-time.`,
  },
  {
    id: "system-architecture",
    title: "2. Full-Stack System Architecture & Data Flow",
    category: "System Design",
    summary: "Client-server architecture, Policy Decision Point (PDP), Policy Enforcement Point (PEP), and Supabase PostgreSQL RLS.",
    content: `The system implements the classic NIST 800-207 Control Plane and Data Plane separation:

- Policy Enforcement Point (PEP): Express API Gateway & Edge Guards intercepting incoming access requests.
- Policy Decision Point (PDP): Real-time Zero-Trust Evaluation Engine evaluating 7 continuous telemetry dimensions.
- Policy Information Point (PIP): Device compliance agent telemetry, Supabase Auth identity, IP Geolocation, and historical anomaly data.
- Policy Administration Point (PAP): Administrator security policy management UI and rule matrix.

DATA FLOW:
1. Subject (User + Device) requests access to Protected Enterprise Resource.
2. PEP intercepts payload and forwards session context to the PDP (/api/access/evaluate).
3. PDP queries PIP (User risk, Device encryption/firewall/agent status, network context).
4. Zero-Trust Algorithm calculates Composite Risk Score (0-100).
5. Decision (ALLOW, REQUIRE MFA, REQUIRE REVIEW, DENY) is written to access_decisions and audit_logs.
6. Real-time telemetry feed notifies Security Analysts if anomalous patterns trip Detection Rules.`,
    codeSnippet: `+---------------------------------------------------------------------------------+
|                                 SUBJECT CONTEXT                                 |
|   User: Alex Mercer (Sec Analyst) | Device: MacBook Pro M3 (Encrypted, EDR Active) |
+---------------------------------------------------------------------------------+
                                        |
                                        v
+---------------------------------------------------------------------------------+
|                   POLICY ENFORCEMENT POINT (PEP) - Express.js                   |
|   Intercepts Request -> Validates JWT -> Extracts Device Telemetry & IP Context |
+---------------------------------------------------------------------------------+
                                        |
                                        v
+---------------------------------------------------------------------------------+
|                   POLICY DECISION POINT (PDP) - Access Engine                   |
|   Evaluates: User Risk (20) + Device Compliance (100%) + Resource (CRITICAL)    |
|   Risk Calculation: 24/100 -> DECISION: ALLOW (Audit ID: evt_98432a)            |
+---------------------------------------------------------------------------------+
                                        |
                +-----------------------+-----------------------+
                |                                               |
                v                                               v
+-------------------------------+               +-------------------------------+
|     DATABASE & AUDIT (RLS)    |               |    SOC ANALYST DASHBOARD      |
|  Supabase PostgreSQL DB       |               |    Real-time Threat Feeds     |
|  Write tamper-evident audit   |               |    Incident & Policy Updates  |
+-------------------------------+               +-------------------------------+`,
    codeLang: "text"
  },
  {
    id: "risk-scoring-algorithm",
    title: "3. Zero-Trust Access Evaluation Engine & Risk Formula",
    category: "Security Engine",
    summary: "Mathematical model used to evaluate real-time access requests.",
    content: `Every access request is evaluated against an objective, explainable risk formula:

Risk Score = (W_user * UserRisk) + (W_device * DeviceRisk) + (W_res * ResourceRisk) + (W_net * NetworkAnomalyRisk)

Weights:
- W_user (0.25): Based on user failed login count, recent suspicious events, and privilege level.
- W_device (0.30): Based on disk encryption, firewall status, anti-malware status, OS patch lag, and trust state (TRUSTED = 0, UNTRUSTED = 50, BLOCKED = 100).
- W_res (0.25): Resource sensitivity (LOW = 10, MEDIUM = 30, HIGH = 60, CRITICAL = 90).
- W_net (0.20): IP reputation, impossible travel velocity (>800 km/h between logins), and anomalous hour access.

Decision Matrix:
- Score < 35 AND Device Compliant: ALLOW
- 35 <= Score < 65 OR Resource requires MFA: REQUIRE MFA
- 65 <= Score < 80: REQUIRE REVIEW (Forward to Security Analyst queue)
- Score >= 80 OR Device BLOCKED OR Untrusted with Critical Resource: DENY`,
    codeSnippet: `function evaluateZeroTrustAccess(user, device, resource, context) {
  let riskScore = 0;
  const reasons = [];

  // Device compliance check
  if (device.trustState === 'BLOCKED') {
    return { decision: 'DENY', riskScore: 100, reason: 'Device is explicitly quarantined/blocked.' };
  }
  if (!device.compliance.diskEncrypted) {
    riskScore += 25;
    reasons.push('Endpoint disk encryption is disabled.');
  }
  if (!device.compliance.antivirusActive) {
    riskScore += 25;
    reasons.push('Endpoint EDR/Antivirus agent is offline.');
  }

  // Network context check
  if (context.isImpossibleTravel) {
    riskScore += 35;
    reasons.push('Impossible travel anomaly detected (>800 km/h delta).');
  }

  // Final evaluation logic
  if (riskScore >= 75) return { decision: 'DENY', riskScore, reasons };
  if (riskScore >= 45 || resource.requiresMfa) return { decision: 'REQUIRE_MFA', riskScore, reasons };
  return { decision: 'ALLOW', riskScore, reasons };
}`,
    codeLang: "javascript"
  },
  {
    id: "rbac-matrix",
    title: "4. Role-Based Access Control (RBAC) Matrix",
    category: "Authorization",
    summary: "5 distinct persona access boundaries across the 12 dashboard modules.",
    content: `The platform enforces 5 hierarchical user roles with strict separation of duties:

1. Super Administrator: Global settings, organization isolation, role assignment, system-wide overrides.
2. Security Administrator: Security policies, alert rule tuning, incident management, threat investigation.
3. Security Analyst: Alert triage, incident escalation, investigation notes, telemetry analysis.
4. IT Administrator: Device lifecycle registration, compliance status review, device quarantine.
5. Employee / Standard User: Self-service device registration, personal login history, access request submission.`,
    codeSnippet: `| Module / Feature       | Super Admin | Sec Admin | Sec Analyst | IT Admin | Employee |
|------------------------|:-----------:|:---------:|:-----------:|:--------:|:--------:|
| Main Dashboard         |    Read     |   Read    |    Read     |   Read   | Limited  |
| Identity & Users       | Read/Write  | Read/Write|    Read     | Read/Write|  Self    |
| Device Security        | Read/Write  | Read/Write|    Read     |Read/Write| Reg. Own |
| Access Control Engine  | Read/Write  | Read/Write|    Read     |   Read   | Req. Only|
| Security Events Feed   | Read/Export | Read/Export|Read/Export  |   Read   |  Self    |
| Threat Detection Rules | Read/Write  | Read/Write|    Read     |  No Access| No Access|
| Security Alerts        | Full Triage | Full Triage| Full Triage |  No Access| No Access|
| Incident Management    | Full Lead   | Full Lead | Update/Notes|  No Access| No Access|
| Tamper-Evident Audits  | Read Only   | Read Only |  No Access  |  No Access| No Access|
| Security Policies      | Read/Write  | Read/Write|    Read     |  No Access| No Access|`,
    codeLang: "markdown"
  },
  {
    id: "powershell-setup",
    title: "5. Windows 11 PowerShell Setup & Execution Guide",
    category: "Deployment & Setup",
    summary: "Step-by-step Windows PowerShell terminal commands for Phase 2 project initialization.",
    content: `Follow these exact Windows 11 PowerShell commands to verify your development environment and set up the project locally:`,
    codeSnippet: `# Step 1: Open Windows PowerShell as Administrator and check prerequisites
node -v      # Target: v20.x or v22.x LTS
npm -v       # Target: v10.x+
git --version # Target: v2.40+

# Step 2: Create project directory and navigate inside
mkdir zero-trust-dashboard
cd zero-trust-dashboard

# Step 3: Initialize frontend with Vite (React + Tailwind)
npm create vite@latest . -- --template react

# Step 4: Install core cybersecurity, backend, and visualization packages
npm install express dotenv recharts lucide-react @supabase/supabase-js
npm install -D tsx tailwindcss @tailwindcss/vite @types/node @types/express

# Step 5: Initialize Supabase local CLI (Optional for local PostgreSQL)
npx supabase init
npx supabase start

# Step 6: Apply the PostgreSQL Schema and RLS policies
npx supabase db push

# Step 7: Launch the full-stack development server
npm run dev
# Expected output:
# > [server] Zero-Trust Security Monitoring Backend listening on http://localhost:3000
# > [vite] Local: http://localhost:3000/`,
    codeLang: "powershell"
  },
  {
    id: "database-architecture",
    title: "6. Supabase PostgreSQL Schema & RLS Architecture",
    category: "Database",
    summary: "20 relational tables, foreign key constraints, indexes, and Row Level Security rules.",
    content: `All 20 tables are partitioned by organization_id to enforce complete multi-tenant tenant isolation. 
Row Level Security (RLS) is activated on all tables. 
The audit_logs table features a cryptographic SHA-256 hash chaining simulation and database rules (no_update_audit_logs, no_delete_audit_logs) to ensure tamper-evidence under SOC2, HIPAA, and ISO 27001 requirements.`,
    codeSnippet: `-- Key RLS enforcement example for Security Alerts:
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "security_alerts_analyst_policy" ON security_alerts
    FOR ALL USING (
        auth_user_role() IN ('Super Administrator', 'Security Administrator', 'Security Analyst')
    );

-- Tamper-evidence rule preventing any updates or deletions of audit events
CREATE OR REPLACE RULE no_update_audit_logs AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
CREATE OR REPLACE RULE no_delete_audit_logs AS ON DELETE TO audit_logs DO INSTEAD NOTHING;`,
    codeLang: "sql"
  }
];
