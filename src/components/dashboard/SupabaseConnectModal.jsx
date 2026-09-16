import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { soundFX } from '../../utils/audioAlerts';
import { 
  Database, 
  X, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  Key,
  Layers,
  Terminal
} from 'lucide-react';

export const SupabaseConnectModal = ({ isOpen, onClose }) => {
  const [anonKey, setAnonKey] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [status, setStatus] = useState({
    isConfigured: false,
    projectRef: 'hwhozwfaazlaqriiewko',
    supabaseUrl: 'https://hwhozwfaazlaqriiewko.supabase.co',
    dashboardUrl: 'https://supabase.com/dashboard/project/hwhozwfaazlaqriiewko',
    sqlEditorUrl: 'https://supabase.com/dashboard/project/hwhozwfaazlaqriiewko/sql/new',
    tables: { operators: false, missions: false, recon: false },
    mode: 'HYBRID_LOCAL_STORAGE'
  });
  const [isChecking, setIsChecking] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const savedKey = api.supabase.getAnonKey();
      if (savedKey) setAnonKey(savedKey);
      checkStatus();
    }
  }, [isOpen]);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const res = await api.request('/supabase/status').catch(() => null);
      if (res) {
        setStatus(res);
      } else {
        setStatus(prev => ({
          ...prev,
          isConfigured: api.supabase.isConfigured(),
        }));
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSaveKey = (e) => {
    e.preventDefault();
    soundFX.playClick();
    api.supabase.setAnonKey(anonKey.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    checkStatus();
  };

  const handleCopySql = () => {
    soundFX.playClick();
    const sqlSchema = `-- ==============================================================================
-- AEROSAR MILITARY TACTICAL PLATFORM — SUPABASE POSTGRESQL SCHEMA
-- Project ID: hwhozwfaazlaqriiewko
-- ==============================================================================

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

ALTER TABLE public.operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recon_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_sos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read operators" ON public.operators FOR SELECT USING (true);
CREATE POLICY "Allow anon insert operators" ON public.operators FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update operators" ON public.operators FOR UPDATE USING (true);

CREATE POLICY "Allow anon read missions" ON public.missions FOR SELECT USING (true);
CREATE POLICY "Allow anon insert missions" ON public.missions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon read recon" ON public.recon_vault FOR SELECT USING (true);
CREATE POLICY "Allow anon insert recon" ON public.recon_vault FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon read sos" ON public.emergency_sos FOR SELECT USING (true);
CREATE POLICY "Allow anon insert sos" ON public.emergency_sos FOR INSERT WITH CHECK (true);

INSERT INTO public.operators (id, name, call_sign, email, password, clearance, drone_unit, role, squadron)
VALUES 
('USR-SAR-004', 'Tactical SAR Operator', 'BASE-OPERATOR', 'operator@response.team', 'SAR-KEY-8924', 'LEVEL-3 HIGH-COMMAND', 'AERO-FALCON-01 [Dual Optical 4K + FLIR Boson]', 'Chief SAR Dispatcher', 'HQ Tactical Overwatch'),
('USR-SAR-001', 'Cmdr. James Vance', 'COMMANDER-VANCE', 'vance.sar@response.team', 'SAR-ALPHA-PASS', 'LEVEL-3 HIGH-COMMAND', 'AERO-FALCON-01 [Dual Optical 4K + FLIR Boson]', 'Mission Flight Commander', 'Alpha Quick-Response Wing'),
('USR-SAR-002', 'Lt. Elena Chen', 'CHEN-THERMAL-SPEC', 'chen.flir@response.team', 'SAR-BRAVO-PASS', 'LEVEL-2 SAR MISSION PILOT', 'VALKYRIE-NIGHTSTALKER-04 [FLIR Boson LWIR]', 'Thermal Recon Specialist', 'Wildfire FLIR Overwatch'),
('USR-SAR-003', 'Dr. Mateo Morales', 'DR-MORALES-AIRLIFT', 'morales.medevac@response.team', 'SAR-MEDIC-PASS', 'LEVEL-3 HIGH-COMMAND', 'SKYGUARDIAN-HEX-09 [Rapid Trauma & Blood Carrier]', 'Flight Surgeon / Trauma Lead', 'Mountain Medevac Squad')
ON CONFLICT (email) DO NOTHING;
`;

    navigator.clipboard.writeText(sqlSchema);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div className="relative w-full max-w-2xl bg-[#E8E6DA] border-2 border-[#277273] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-[#191E15] rounded-sm">
        
        {/* HEADER */}
        <div className="px-5 py-4 bg-[#DFDDCF] border-b border-[#CAC7BA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#277273] text-white flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#5F7521]">
                CLOUD DATABASE INTEGRATION
              </div>
              <h3 className="text-lg font-chakra font-black uppercase text-[#191E15] tracking-tight">
                Supabase Backend Configuration
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-[#5C6654] hover:text-[#191E15] hover:bg-[#D1CEC0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {/* PROJECT STATUS BANNER */}
          <div className="p-3.5 bg-[#DFDDCF] border border-[#CAC7BA] rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${api.supabase.isConfigured() ? 'bg-green-600 animate-pulse' : 'bg-amber-500'}`} />
                <span className="font-chakra font-bold text-sm tracking-wider uppercase text-[#191E15]">
                  Project: <span className="font-mono text-[#277273]">{status.projectRef}</span>
                </span>
              </div>
              <div className="text-xs font-mono text-[#5C6654] mt-0.5">
                {status.supabaseUrl}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={status.dashboardUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-[#277273] hover:bg-[#1f5a5b] text-white text-xs font-mono font-bold uppercase rounded-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                type="button"
                onClick={checkStatus}
                disabled={isChecking}
                className="p-1.5 border border-[#CAC7BA] bg-[#E8E6DA] hover:bg-[#DFDDCF] text-[#191E15] rounded-xs transition-colors"
                title="Refresh Status"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* STEP 1: EXECUTE SQL SCHEMA IN SUPABASE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#5F7521] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#5F7521]" />
                Step 1: Create Database Tables (Run SQL Schema)
              </label>
              <a
                href={status.sqlEditorUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-mono text-[#277273] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Open SQL Editor</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-3 bg-[#DFDDCF] border border-[#CAC7BA] rounded-sm text-xs font-mono text-[#4C5643] flex items-center justify-between gap-3">
              <span>
                Creates <code className="bg-[#CAC7BA] px-1 py-0.5 rounded text-[#191E15]">operators</code>, <code className="bg-[#CAC7BA] px-1 py-0.5 rounded text-[#191E15]">missions</code>, <code className="bg-[#CAC7BA] px-1 py-0.5 rounded text-[#191E15]">recon_vault</code>, and pre-seeds base accounts.
              </span>
              <button
                type="button"
                onClick={handleCopySql}
                className="px-3 py-1.5 bg-[#5F7521] hover:bg-[#52661B] text-[#141A0E] text-xs font-chakra font-bold uppercase rounded-xs flex items-center gap-1.5 flex-shrink-0 transition-colors shadow-xs"
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'COPIED TO CLIPBOARD' : 'COPY SQL SCHEMA'}</span>
              </button>
            </div>
          </div>

          {/* STEP 2: PASTE SUPABASE ANON PUBLIC KEY */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#5F7521] flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#5F7521]" />
              Step 2: Enter Supabase Public API Key (anon key)
            </label>

            <form onSubmit={handleSaveKey} className="space-y-2.5">
              <div className="relative">
                <input
                  type="text"
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="Paste your 'anon' 'public' API key here (from Project Settings -> API)"
                  className="w-full bg-[#DFDDCF] border-2 border-[#277273] rounded-sm px-3.5 py-2.5 text-xs font-mono text-[#191E15] placeholder-[#8E9A86] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-[#5C6654]">
                <span>
                  Found in: <strong>Project Settings → API → Project API keys → anon (public)</strong>
                </span>

                <button
                  type="submit"
                  className="px-4 py-2 bg-[#277273] hover:bg-[#1f5a5b] text-white text-xs font-chakra font-bold uppercase rounded-xs transition-colors"
                >
                  {saveSuccess ? 'KEY SAVED & ACTIVE ✓' : 'SAVE & CONNECT'}
                </button>
              </div>
            </form>
          </div>

          {/* LIVE STATUS SUMMARY */}
          <div className="p-3 bg-[#DFDDCF] border border-[#CAC7BA] rounded-sm space-y-2 text-xs font-mono text-[#5C6654]">
            <div className="text-[11px] font-bold uppercase text-[#788470] tracking-wider">
              Backend Architecture:
            </div>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-[#E8E6DA] border border-[#CAC7BA] text-[#191E15]">
                REST Endpoint: <strong>/api/auth/*</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-[#E8E6DA] border border-[#CAC7BA] text-[#191E15]">
                Supabase URL: <strong>https://{status.projectRef}.supabase.co</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-[#E8E6DA] border border-[#CAC7BA] text-[#191E15]">
                Active Mode: <strong>{api.supabase.isConfigured() ? 'Cloud PostgreSQL' : 'Local Hybrid Station (Zero Error)'}</strong>
              </span>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="px-5 py-3 bg-[#DFDDCF] border-t border-[#CAC7BA] flex items-center justify-between text-xs font-mono text-[#5C6654]">
          <span>MIL-SPEC SUPABASE CONNECTOR v2.4</span>
          <button
            type="button"
            onClick={onClose}
            className="text-[#191E15] hover:underline font-bold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default SupabaseConnectModal;
