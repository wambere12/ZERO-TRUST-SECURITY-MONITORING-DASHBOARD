-- =====================================================================
-- ZERO-TRUST SECURITY MONITORING DASHBOARD (ZTSMD)
-- SUPABASE POSTGRESQL SCHEMA WITH ROW LEVEL SECURITY (RLS)
-- Phase 1 & 3: Production Database Schema & Security Policies
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ORGANIZATIONS (Multi-Tenant Isolation)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    risk_threshold INT DEFAULT 70,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY, -- references auth.users(id) in Supabase
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    title VARCHAR(100),
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION')),
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_type VARCHAR(50) DEFAULT 'TOTP',
    risk_score INT DEFAULT 15 CHECK (risk_score BETWEEN 0 AND 100),
    last_login_at TIMESTAMPTZ,
    last_login_ip VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. USER ROLES & PERMISSIONS (RBAC)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_system_role BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL UNIQUE, -- e.g. 'users:read', 'devices:quarantine'
    category VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS profile_roles (
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID REFERENCES profiles(id),
    PRIMARY KEY (profile_id, role_id)
);

-- 5. DEVICES & COMPLIANCE (Endpoint Zero-Trust Telemetry)
CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    device_name VARCHAR(255) NOT NULL,
    device_type VARCHAR(50) NOT NULL CHECK (device_type IN ('LAPTOP', 'DESKTOP', 'MOBILE', 'SERVER')),
    os_name VARCHAR(100) NOT NULL,
    os_version VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) UNIQUE,
    mac_address VARCHAR(50),
    trust_state VARCHAR(50) DEFAULT 'UNTRUSTED' CHECK (trust_state IN ('TRUSTED', 'UNTRUSTED', 'BLOCKED')),
    risk_score INT DEFAULT 20 CHECK (risk_score BETWEEN 0 AND 100),
    agent_installed BOOLEAN DEFAULT TRUE,
    agent_version VARCHAR(50) DEFAULT 'v3.4.1',
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    last_ip VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS device_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE UNIQUE,
    disk_encrypted BOOLEAN DEFAULT FALSE,
    firewall_enabled BOOLEAN DEFAULT FALSE,
    antivirus_active BOOLEAN DEFAULT FALSE,
    os_updated BOOLEAN DEFAULT FALSE,
    jailbroken_or_rooted BOOLEAN DEFAULT FALSE,
    compliant BOOLEAN GENERATED ALWAYS AS (
        disk_encrypted AND firewall_enabled AND antivirus_active AND os_updated AND NOT jailbroken_or_rooted
    ) STORED,
    last_evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PROTECTED RESOURCES & ACCESS POLICIES
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100) NOT NULL, -- 'DATABASE', 'API_GATEWAY', 'PRODUCTION_K8S', 'ERP'
    sensitivity VARCHAR(50) NOT NULL CHECK (sensitivity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    endpoint_url VARCHAR(255),
    requires_mfa BOOLEAN DEFAULT TRUE,
    min_trust_level VARCHAR(50) DEFAULT 'TRUSTED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS access_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    priority INT DEFAULT 100,
    required_role VARCHAR(50),
    min_device_trust VARCHAR(50) DEFAULT 'TRUSTED',
    require_encryption BOOLEAN DEFAULT TRUE,
    require_mfa BOOLEAN DEFAULT TRUE,
    allowed_countries TEXT[] DEFAULT '{"US", "GB", "DE", "FR", "CA"}',
    max_user_risk INT DEFAULT 60,
    max_device_risk INT DEFAULT 50,
    default_action VARCHAR(50) DEFAULT 'ALLOW' CHECK (default_action IN ('ALLOW', 'DENY', 'REQUIRE_MFA', 'REQUIRE_REVIEW')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ACCESS REQUESTS & EVALUATION DECISIONS
CREATE TABLE IF NOT EXISTS access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    request_ip VARCHAR(45) NOT NULL,
    request_location VARCHAR(100),
    auth_strength VARCHAR(50) DEFAULT 'PASSWORD' CHECK (auth_strength IN ('PASSWORD', 'PASSWORD_MFA', 'FIDO2_PASSKEY', 'CERTIFICATE')),
    requested_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS access_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES access_requests(id) ON DELETE SET NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id),
    device_id UUID NOT NULL REFERENCES devices(id),
    resource_id UUID NOT NULL REFERENCES resources(id),
    decision VARCHAR(50) NOT NULL CHECK (decision IN ('ALLOW', 'DENY', 'REQUIRE_MFA', 'REQUIRE_REVIEW')),
    calculated_risk_score INT NOT NULL,
    decision_reason TEXT NOT NULL,
    policy_matched_id UUID REFERENCES access_policies(id),
    evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SECURITY & AUTHENTICATION EVENTS
CREATE TABLE IF NOT EXISTS authentication_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id),
    email VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('LOGIN_SUCCESS', 'LOGIN_FAILURE', 'MFA_CHALLENGE', 'MFA_SUCCESS', 'MFA_FAILURE', 'LOGOUT', 'PASSWORD_RESET')),
    ip_address VARCHAR(45) NOT NULL,
    country VARCHAR(10),
    city VARCHAR(100),
    user_agent TEXT,
    failure_reason VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    source_ip VARCHAR(45),
    profile_id UUID REFERENCES profiles(id),
    device_id UUID REFERENCES devices(id),
    description TEXT NOT NULL,
    raw_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. DETECTION RULES & SECURITY ALERTS
CREATE TABLE IF NOT EXISTS detection_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    mitre_tactic VARCHAR(100),
    mitre_technique VARCHAR(100),
    rule_condition JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS security_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES detection_rules(id),
    title VARCHAR(255) NOT NULL,
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    profile_id UUID REFERENCES profiles(id),
    device_id UUID REFERENCES devices(id),
    source_ip VARCHAR(45),
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'NEW' CHECK (status IN ('NEW', 'INVESTIGATING', 'CONTAINED', 'RESOLVED', 'FALSE_POSITIVE')),
    assigned_analyst_id UUID REFERENCES profiles(id),
    recommended_action TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. INCIDENTS & INVESTIGATION NOTES
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_number VARCHAR(50) NOT NULL UNIQUE, -- e.g. 'INC-2026-081'
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status VARCHAR(50) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'CONTAINED', 'CLOSED')),
    lead_analyst_id UUID REFERENCES profiles(id),
    root_cause TEXT,
    mitre_tag VARCHAR(100),
    remediation_steps TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS incident_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id),
    content TEXT NOT NULL,
    action_type VARCHAR(50) DEFAULT 'NOTE' CHECK (action_type IN ('NOTE', 'EVIDENCE', 'STATUS_CHANGE', 'CONTAINMENT_ACTION')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. AUDIT LOGS & USER SESSIONS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES profiles(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    changes JSONB,
    hash VARCHAR(64) NOT NULL, -- SHA-256 for tamper evidence
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    device_id UUID REFERENCES devices(id),
    user_agent TEXT,
    is_revoked BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'SECURITY' CHECK (type IN ('SECURITY', 'COMPLIANCE', 'SYSTEM', 'ACCESS')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE authentication_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Get user role
CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS VARCHAR AS $$
    SELECT r.name FROM user_roles r
    JOIN profile_roles pr ON pr.role_id = r.id
    WHERE pr.profile_id = auth.uid()
    LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Profiles: Users see own profile, Admins and Analysts see org profiles
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT USING (
        auth.uid() = id OR
        auth_user_role() IN ('Super Administrator', 'Security Administrator', 'Security Analyst', 'IT Administrator')
    );

CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE USING (
        auth_user_role() IN ('Super Administrator', 'Security Administrator', 'IT Administrator')
    );

-- Devices: Employees see own registered devices, IT & Sec Admins see all org devices
CREATE POLICY "devices_select_policy" ON devices
    FOR SELECT USING (
        owner_id = auth.uid() OR
        auth_user_role() IN ('Super Administrator', 'Security Administrator', 'Security Analyst', 'IT Administrator')
    );

CREATE POLICY "devices_modify_policy" ON devices
    FOR ALL USING (
        auth_user_role() IN ('Super Administrator', 'IT Administrator', 'Security Administrator')
    );

-- Security Events, Alerts & Incidents: Visible only to Security Personnel
CREATE POLICY "security_alerts_analyst_policy" ON security_alerts
    FOR ALL USING (
        auth_user_role() IN ('Super Administrator', 'Security Administrator', 'Security Analyst')
    );

CREATE POLICY "incidents_analyst_policy" ON incidents
    FOR ALL USING (
        auth_user_role() IN ('Super Administrator', 'Security Administrator', 'Security Analyst')
    );

-- Audit logs: Read-only for admins and auditors; NO DIRECT UPDATE/DELETE PERMITTED
CREATE POLICY "audit_logs_read_only" ON audit_logs
    FOR SELECT USING (
        auth_user_role() IN ('Super Administrator', 'Security Administrator')
    );

-- Prevent unauthorized modifications to audit trail
CREATE OR REPLACE RULE no_update_audit_logs AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
CREATE OR REPLACE RULE no_delete_audit_logs AS ON DELETE TO audit_logs DO INSTEAD NOTHING;

-- INDEXES FOR FAST QUERYING
CREATE INDEX IF NOT EXISTS idx_profiles_org ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_devices_owner ON devices(owner_id);
CREATE INDEX IF NOT EXISTS idx_devices_trust ON devices(trust_state);
CREATE INDEX IF NOT EXISTS idx_decisions_evaluated_at ON access_decisions(evaluated_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_events_created ON authentication_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sec_events_severity ON security_events(severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON security_alerts(status, severity);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
