import React, { useState, useEffect } from 'react';
import { useDrone } from '../../context/DroneContext';
import { api } from '../../utils/api';
import CreateAccountModal from './CreateAccountModal';
import HudRadarBackground from './HudRadarBackground';
import { 
  ShieldCheck, 
  Radio, 
  Crosshair, 
  Cpu, 
  Lock, 
  UserCheck, 
  ChevronRight, 
  Activity,
  Flame,
  Droplets,
  HeartPulse,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  ArrowRight,
  ArrowUpRight
} from 'lucide-react';

const RESCUE_SCENARIOS = [
  {
    id: 'flood',
    title: 'Flood Disaster: Rooftop Survivor Rescue',
    shortTitle: 'Flood Rescue',
    category: 'WATERBORNE SAR',
    image: '/assets/rescue/flood_rescue.jpg',
    droneModel: 'AERO-HEAVY-LIFTER [Dual 4K Spotlight + Life-Raft Pod]',
    pilotEmail: 'vance.sar@response.team',
    pilotPreset: 'COMMANDER-VANCE',
    clearancePreset: 'LEVEL-3 HIGH-COMMAND',
    status: 'SURVIVORS LOCATED • EVAC SQUAD GUIDED',
    description: 'Heavy SAR drone hovers through torrential rain, illuminating stranded families on flooded roofs with 12,000-lumen spotlights and deploying autonomous buoyancy rafts to Zodiac rescue boats.',
    tagColor: 'bg-[#dce9f5] text-[#1e3a5f] border-[#a3c1e0]'
  },
  {
    id: 'fire',
    title: 'Wildfire SAR: FLIR Thermal Smoke Penetration',
    shortTitle: 'Wildfire FLIR',
    category: 'THERMAL RECON',
    image: '/assets/rescue/fire_rescue.jpg',
    droneModel: 'VALKYRIE-NIGHTSTALKER-04 [FLIR Boson 640 Radiometric]',
    pilotEmail: 'chen.flir@response.team',
    pilotPreset: 'CHEN-THERMAL-SPEC',
    clearancePreset: 'LEVEL-2 SAR MISSION PILOT',
    status: 'FLIR CORE LOCK • ESCAPE CORRIDOR MARKED',
    description: 'Long-wave infrared (LWIR) radiometric thermal imaging pierces dense midnight wildfire smoke to locate trapped forest civilians and firefighters, beaming escape paths directly to tactical HUDs.',
    tagColor: 'bg-[#f5ebd9] text-[#78350f] border-[#e0c297]'
  },
  {
    id: 'medevac',
    title: 'Emergency Medevac: Trauma Pod & Blood Supply Drop',
    shortTitle: 'Medical Airlift',
    category: 'AIR AMBULANCE',
    image: '/assets/rescue/medical_helo.jpg',
    droneModel: 'SKYGUARDIAN-HEX-09 [Rapid Trauma & Blood Carrier]',
    pilotEmail: 'morales.medevac@response.team',
    pilotPreset: 'DR-MORALES-AIRLIFT',
    clearancePreset: 'LEVEL-3 HIGH-COMMAND',
    status: 'TRAUMA KIT TRANSFERRED • HELICOPTER HOIST OK',
    description: 'Direct high-speed autonomous air-drop of O-negative blood units, automated external defibrillators (AED), and plasma packs directly to mountain paramedics preparing critical victims for emergency helicopter airlift.',
    tagColor: 'bg-[#dde7d4] text-[#2c3b1a] border-[#a6bd95]'
  }
];

const LoginPage = () => {
  const { login } = useDrone();

  const [activeScenarioIndex, setActiveScenarioIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Form Fields matching User Reference Image
  const [operatorEmail, setOperatorEmail] = useState('operator@response.team');
  const [accessKey, setAccessKey] = useState('••••••••••••');
  const [showAccessKey, setShowAccessKey] = useState(false);
  const [rememberStation, setRememberStation] = useState(true);

  // Background Telemetry assignments
  const [clearance, setClearance] = useState('LEVEL-3 HIGH-COMMAND');
  const [droneUnit, setDroneUnit] = useState('AERO-FALCON-01 [Dual Optical 4K + FLIR Boson]');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isRecoverOpen, setIsRecoverOpen] = useState(false);
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);

  const currentScenario = RESCUE_SCENARIOS[activeScenarioIndex];

  // Auto-cycle through rescue missions every 7 seconds if not paused
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveScenarioIndex((prev) => (prev + 1) % RESCUE_SCENARIOS.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const selectScenario = (idx) => {
    setActiveScenarioIndex(idx);
    const scenario = RESCUE_SCENARIOS[idx];
    setDroneUnit(scenario.droneModel);
    setOperatorEmail(scenario.pilotEmail);
    setClearance(scenario.clearancePreset);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!operatorEmail.trim()) {
      setErrorMsg('Operator Email or Call Sign is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const response = await api.login(operatorEmail.trim(), accessKey);
      if (response.success && response.user) {
        login({
          ...response.user,
          droneUnit: response.user.droneUnit || droneUnit,
          clearance: response.user.clearance || clearance,
          authCode: 'SAR-POST-AUTH',
          loginTime: new Date().toISOString(),
        });
      } else {
        setErrorMsg(response.error || 'Authentication denied. Verify credentials.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please verify your email / call sign and access key.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectAccess = () => {
    login({
      callSign: 'COMMANDER-VANCE',
      email: 'vance.sar@response.team',
      clearance: 'LEVEL-3 HIGH-COMMAND',
      droneUnit: 'AERO-FALCON-01 [Dual Optical 4K + FLIR Boson]',
      authCode: 'SAR-8924',
      loginTime: new Date().toISOString(),
    });
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-[#E8E6DA] font-sans text-[#191E15] overflow-x-hidden selection:bg-[#5F7521] selection:text-white">
      {/* Light Tactical Khaki Radar in Background */}
      <HudRadarBackground />

      {/* TOP BRAND BAR */}
      <header className="relative z-20 w-full px-5 sm:px-10 py-3.5 border-b border-[#D1CEC0] bg-[#E8E6DA]/90 backdrop-blur-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#5F7521] text-white flex items-center justify-center font-chakra font-bold text-xs shadow-xs">
            <Crosshair className="w-4 h-4 animate-spin" style={{ animationDuration: '14s' }} />
          </div>
          <span className="font-chakra font-black tracking-widest text-lg text-[#191E15]">
            AERO<span className="text-[#277273]">SAR</span>
          </span>
          <span className="hidden sm:inline-block text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-[#DFDDCF] text-[#5C6654] border border-[#CAC7BA]">
            AIRBORNE SEARCH & RESCUE COMMAND
          </span>
        </div>

        <button
          onClick={handleDirectAccess}
          className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#4C5643] hover:text-[#277273] transition-colors"
        >
          <span>BACK TO COMMAND</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </header>

      {/* MAIN HERO STAGE */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: REAL DISASTER RESCUE SHOWCASE (6 cols) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#5F7521] inline-flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#5F7521]" />
                  ACTIVE SEARCH & RESCUE DEPLOYMENTS
                </span>

                {/* Pause/Play slideshow */}
                <button
                  type="button"
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className="p-1 px-2.5 rounded bg-[#DFDDCF] border border-[#CAC7BA] text-[#5C6654] hover:text-[#191E15] transition-colors text-[10px] flex items-center gap-1 font-mono font-bold uppercase"
                  title={isAutoPlaying ? 'Pause Slideshow' : 'Resume Slideshow'}
                >
                  {isAutoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-[#5F7521]" />}
                  <span>{isAutoPlaying ? 'PAUSE' : 'AUTO'}</span>
                </button>
              </div>

              <h2 className="text-xl sm:text-2xl font-chakra font-bold text-[#191E15] mt-1.5 leading-tight">
                Autonomous Drone Rescue in Floods, Wildfires & Mountain Evacuations
              </h2>
            </div>

            {/* PURE RESCUE IMAGE DISPLAY (CLEAN & BRIGHT) */}
            <div className="relative rounded-xl overflow-hidden border-2 border-[#CAC7BA] bg-[#DFDDCF] p-1.5 shadow-sm group">
              <div className="relative aspect-video sm:aspect-[16/10] w-full overflow-hidden rounded-lg bg-[#CAC7BA]">
                <img
                  src={currentScenario.image}
                  alt={currentScenario.title}
                  className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-102"
                />

                {/* Minimal Clean Tag in Corner */}
                <div className="absolute top-3 left-3 z-10">
                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border shadow-sm flex items-center gap-1.5 ${currentScenario.tagColor}`}>
                    {currentScenario.id === 'flood' && <Droplets className="w-3 h-3" />}
                    {currentScenario.id === 'fire' && <Flame className="w-3 h-3" />}
                    {currentScenario.id === 'medevac' && <HeartPulse className="w-3 h-3" />}
                    <span>{currentScenario.shortTitle}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* INTERACTIVE SCENARIO SELECTOR BUTTONS */}
            <div className="grid grid-cols-3 gap-2.5">
              {RESCUE_SCENARIOS.map((sc, idx) => {
                const isSelected = idx === activeScenarioIndex;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => selectScenario(idx)}
                    className={`p-2.5 rounded-lg text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#DFDDCF] border-2 border-[#277273] shadow-xs'
                        : 'bg-[#E8E6DA] border border-[#CAC7BA] hover:bg-[#DFDDCF]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#5F7521]">
                        MISSION 0{idx + 1}
                      </span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#277273]"></span>
                      )}
                    </div>
                    <div className="text-xs font-bold font-chakra text-[#191E15] truncate">
                      {sc.shortTitle}
                    </div>
                  </button>
                );
              })}
            </div>

          </div>

          {/* RIGHT COLUMN: AUTHENTICATION CONSOLE (MATCHING USER SCREENSHOT 1:1) */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="w-full max-w-lg mx-auto space-y-6">
              
              {/* TOP LABELS & BACK LINK */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#788470] leading-none mb-1">
                    OPERATOR ACCESS
                  </div>
                  <div className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#5F7521] leading-none">
                    WELCOME BACK
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDirectAccess}
                  className="text-xs font-mono font-bold uppercase tracking-wider text-[#4C5643] hover:text-[#277273] transition-colors inline-flex items-center gap-1"
                >
                  <span>BACK TO COMMAND</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              {/* MAIN HERO HEADLINE */}
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black font-chakra tracking-tight leading-[0.92] text-[#191E15] uppercase">
                  SIGN IN TO <br />
                  <span className="text-[#277273]">YOUR COMMAND POST.</span>
                </h1>
                <p className="text-sm sm:text-base text-[#5C6654] mt-3 font-normal">
                  Use your authorized operator credentials to continue.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded bg-[#F8E3E3] border border-[#E0A8A8] text-[#901F1F] text-xs font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-[#C0392B]" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* FORM FIELDS (EXACT STYLING FROM IMAGE) */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                
                {/* 1. OPERATOR EMAIL */}
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-widest text-[#8E9A86] mb-1.5">
                    OPERATOR EMAIL
                  </label>
                  <input
                    type="text"
                    value={operatorEmail}
                    onChange={(e) => setOperatorEmail(e.target.value)}
                    placeholder="operator@response.team"
                    required
                    className="w-full bg-[#DFDDCF] border border-[#CAC7BA] rounded-none sm:rounded-sm px-4 py-3 text-sm font-mono text-[#191E15] placeholder-[#8E9A86] focus:outline-none focus:border-[#277273] transition-colors"
                  />
                </div>

                {/* 2. ACCESS KEY (WITH SHOW / HIDE TOGGLE) */}
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-widest text-[#8E9A86] mb-1.5">
                    ACCESS KEY
                  </label>
                  <div className="relative">
                    <input
                      type={showAccessKey ? 'text' : 'password'}
                      value={accessKey}
                      onChange={(e) => setAccessKey(e.target.value)}
                      placeholder="Enter access key"
                      required
                      className="w-full bg-[#DFDDCF] border-2 border-[#277273] rounded-none sm:rounded-sm px-4 py-3 pr-16 text-sm font-mono text-[#191E15] placeholder-[#8E9A86] focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAccessKey(!showAccessKey)}
                      className="absolute right-3.5 top-3.5 text-xs font-mono font-bold text-[#277273] hover:text-[#1d5758] uppercase tracking-wider transition-colors"
                    >
                      {showAccessKey ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>
                </div>

                {/* 3. REMEMBER THIS STATION & RECOVER ACCESS */}
                <div className="flex items-center justify-between text-xs font-mono text-[#5C6654] pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberStation}
                      onChange={(e) => setRememberStation(e.target.checked)}
                      className="w-4 h-4 rounded-none border-[#CAC7BA] bg-[#DFDDCF] text-[#5F7521] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#5F7521]"
                    />
                    <span>Remember this station</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsRecoverOpen(true)}
                    className="text-[#5C6654] hover:text-[#191E15] transition-colors hover:underline"
                  >
                    Recover access
                  </button>
                </div>

                {/* 4. ENTER COMMAND BUTTON (ARMY OLIVE #5F7521 WITH ARROW) */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#5F7521] hover:bg-[#52661B] text-[#141A0E] font-chakra font-black text-sm tracking-widest uppercase py-4 px-6 rounded-none sm:rounded-sm flex items-center justify-between transition-colors shadow-sm mt-2"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#141A0E] border-t-transparent rounded-full animate-spin"></div>
                      AUTHENTICATING WITH BASE COMMAND...
                    </span>
                  ) : (
                    <>
                      <span className="font-chakra font-black tracking-wider text-base">ENTER COMMAND</span>
                      <span className="text-xl font-bold">→</span>
                    </>
                  )}
                </button>

                {/* 5. NEW OPERATOR? CREATE AN ACCOUNT */}
                <div className="pt-2 text-xs font-sans text-[#5C6654]">
                  <span>New operator? </span>
                  <button
                    type="button"
                    onClick={() => setIsCreateAccountOpen(true)}
                    className="text-[#DE802B] hover:text-[#B86419] underline font-medium transition-colors"
                  >
                    Create an account
                  </button>
                </div>

              </form>

            </div>
          </div>

        </div>
      </main>

      {/* CREATE ACCOUNT MODAL */}
      <CreateAccountModal
        isOpen={isCreateAccountOpen}
        onClose={() => setIsCreateAccountOpen(false)}
        onAccountCreated={(newUser) => {
          setOperatorEmail(newUser.email);
          setAccessKey(newUser.password || '');
        }}
      />

      {/* RECOVER ACCESS MODAL */}
      {isRecoverOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-sans">
          <div className="relative w-full max-w-md bg-[#DFDDCF] border-2 border-[#277273] p-6 shadow-2xl text-[#191E15]">
            <h3 className="text-xl font-chakra font-bold uppercase text-[#191E15] mb-2">
              Operator Access Recovery
            </h3>
            <p className="text-xs font-mono text-[#5C6654] mb-4 leading-relaxed">
              Authorized military recovery protocol: Default tactical keys are active for registered operators. You can also create a new authorized account using "Create an account" or click "Instant Bypass" to enter the console directly.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsRecoverOpen(false)}
                className="px-4 py-2 bg-[#CAC7BA] hover:bg-[#BDBAA9] text-xs font-mono font-bold uppercase transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => { setIsRecoverOpen(false); handleDirectAccess(); }}
                className="px-4 py-2 bg-[#5F7521] hover:bg-[#52661B] text-[#141A0E] text-xs font-chakra font-bold uppercase transition-colors"
              >
                Instant Bypass →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="relative z-10 w-full px-5 sm:px-10 py-3.5 border-t border-[#D1CEC0] bg-[#E8E6DA]/90 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-[#788470]">
        <div>
          <span>AEROSAR MIL-SPEC PLATFORM // SECTOR: LEVEL-3 OPS</span>
        </div>
        <div>
          <span>STATION ID: CMD-8924-AIR</span>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
