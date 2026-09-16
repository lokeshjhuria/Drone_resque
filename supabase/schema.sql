-- ==============================================================================
-- AEROSAR MILITARY TACTICAL PLATFORM — SUPABASE POSTGRESQL SCHEMA
-- Project ID: hwhozwfaazlaqriiewko
-- Dashboard: https://supabase.com/dashboard/project/hwhozwfaazlaqriiewko
-- ==============================================================================

-- 1. OPERATORS TABLE (Authentication & Clearance Registry)
CREATE TABLE IF NOT EXISTS public.operators (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    call_sign TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    clearance TEXT DEFAULT 'LEVEL-2 SAR MISSION PILOT',
    drone_unit TEXT DEFAULT 'AERO-FALCON-01 [Dual Optical 4K + FLIR Boson]',
    role TEXT DEFAULT 'Field SAR Drone Pilot',
    squadron TEXT DEFAULT 'Alpha Quick-Response Wing',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'ACTIVE'
);

-- 2. SAR MISSIONS TABLE (Active Deployments & Triage Workflows)
CREATE TABLE IF NOT EXISTS public.missions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'AIRBORNE SAR',
    priority TEXT DEFAULT 'HIGH',
    stage INTEGER DEFAULT 2,
    status TEXT DEFAULT 'ACTIVE_SURVEILLANCE',
    target_coordinates JSONB DEFAULT '{"lat": 34.0537, "lng": -118.2427}'::JSONB,
    assigned_unit TEXT,
    assigned_operator TEXT,
    survivors_located INTEGER DEFAULT 0,
    start_time TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- 3. RECON VAULT TABLE (Archived Satellite Intelligence & Telemetry Snapshots)
CREATE TABLE IF NOT EXISTS public.recon_vault (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    area_name TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    altitude DOUBLE PRECISION DEFAULT 45.0,
    heading DOUBLE PRECISION DEFAULT 0.0,
    drone_model TEXT,
    call_sign TEXT,
    image_url TEXT,
    environmental JSONB DEFAULT '{}'::JSONB,
    targets_visible INTEGER DEFAULT 1
);

-- 4. EMERGENCY SOS TABLE (Multi-Agency Rescue Dispatches)
CREATE TABLE IF NOT EXISTS public.emergency_sos (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    target_id TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    status TEXT DEFAULT 'DISPATCHED',
    units_dispatched JSONB DEFAULT '{}'::JSONB,
    logs JSONB DEFAULT '[]'::JSONB
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recon_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_sos ENABLE ROW LEVEL SECURITY;

-- Allow public / anon client read and write operations
CREATE POLICY "Allow anon read operators" ON public.operators FOR SELECT USING (true);
CREATE POLICY "Allow anon insert operators" ON public.operators FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update operators" ON public.operators FOR UPDATE USING (true);

CREATE POLICY "Allow anon read missions" ON public.missions FOR SELECT USING (true);
CREATE POLICY "Allow anon insert missions" ON public.missions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update missions" ON public.missions FOR UPDATE USING (true);

CREATE POLICY "Allow anon read recon" ON public.recon_vault FOR SELECT USING (true);
CREATE POLICY "Allow anon insert recon" ON public.recon_vault FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon delete recon" ON public.recon_vault FOR DELETE USING (true);

CREATE POLICY "Allow anon read sos" ON public.emergency_sos FOR SELECT USING (true);
CREATE POLICY "Allow anon insert sos" ON public.emergency_sos FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- PRE-SEEDED BASE COMMAND OPERATORS
-- ==============================================================================

INSERT INTO public.operators (id, name, call_sign, email, password, clearance, drone_unit, role, squadron)
VALUES 
(
    'USR-SAR-004',
    'Tactical SAR Operator',
    'BASE-OPERATOR',
    'operator@response.team',
    'SAR-KEY-8924',
    'LEVEL-3 HIGH-COMMAND',
    'AERO-FALCON-01 [Dual Optical 4K + FLIR Boson]',
    'Chief SAR Dispatcher',
    'HQ Tactical Overwatch'
),
(
    'USR-SAR-001',
    'Cmdr. James Vance',
    'COMMANDER-VANCE',
    'vance.sar@response.team',
    'SAR-ALPHA-PASS',
    'LEVEL-3 HIGH-COMMAND',
    'AERO-FALCON-01 [Dual Optical 4K + FLIR Boson]',
    'Mission Flight Commander',
    'Alpha Quick-Response Wing'
),
(
    'USR-SAR-002',
    'Lt. Elena Chen',
    'CHEN-THERMAL-SPEC',
    'chen.flir@response.team',
    'SAR-BRAVO-PASS',
    'LEVEL-2 SAR MISSION PILOT',
    'VALKYRIE-NIGHTSTALKER-04 [FLIR Boson LWIR]',
    'Thermal Recon Specialist',
    'Wildfire FLIR Overwatch'
),
(
    'USR-SAR-003',
    'Dr. Mateo Morales',
    'DR-MORALES-AIRLIFT',
    'morales.medevac@response.team',
    'SAR-MEDIC-PASS',
    'LEVEL-3 HIGH-COMMAND',
    'SKYGUARDIAN-HEX-09 [Rapid Trauma & Blood Carrier]',
    'Flight Surgeon / Trauma Lead',
    'Mountain Medevac Squad'
)
ON CONFLICT (email) DO NOTHING;

-- PRE-SEEDED MISSIONS
INSERT INTO public.missions (id, title, category, priority, stage, status, target_coordinates, assigned_unit, assigned_operator, survivors_located, notes)
VALUES
(
    'MSN-2026-081',
    'Sector Bravo Flood Inundation & Survivor Evac',
    'WATERBORNE SAR',
    'CRITICAL',
    2,
    'ACTIVE_SURVEILLANCE',
    '{"lat": 34.0537, "lng": -118.2427}'::JSONB,
    'AERO-FALCON-01 [Dual Optical 4K + FLIR Boson]',
    'COMMANDER-VANCE',
    2,
    'Flash flood alert. Stranded survivors signaling on rooftop.'
),
(
    'MSN-2026-082',
    'Angeles Ridge Wildfire Thermal Canopy Sweep',
    'THERMAL RECON',
    'HIGH',
    3,
    'CONTAINMENT_SCAN',
    '{"lat": 34.1122, "lng": -118.1534}'::JSONB,
    'VALKYRIE-NIGHTSTALKER-04 [FLIR Boson LWIR]',
    'CHEN-THERMAL-SPEC',
    1,
    'FLIR Boson radiometric lock established on forest heat corridor.'
)
ON CONFLICT (id) DO NOTHING;
