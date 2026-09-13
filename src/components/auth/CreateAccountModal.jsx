import React, { useState } from 'react';
import { api } from '../../utils/api';
import { useDrone } from '../../context/DroneContext';
import { soundFX } from '../../utils/audioAlerts';
import { 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  UserPlus, 
  Radio, 
  Lock, 
  Mail, 
  User, 
  ChevronRight,
  Plane
} from 'lucide-react';

const CLEARANCE_OPTIONS = [
  'LEVEL-1 FIELD EMT / MEDIC',
  'LEVEL-2 SAR MISSION PILOT',
  'LEVEL-3 HIGH-COMMAND',
  'LEVEL-4 FLEET ADMIN'
];

const DRONE_UNITS = [
  'AERO-FALCON-01 [Dual Optical 4K + FLIR Boson]',
  'VALKYRIE-NIGHTSTALKER-04 [FLIR Boson LWIR]',
  'SKYGUARDIAN-HEX-09 [Rapid Trauma & Blood Carrier]',
  'HEAVY-LIFTER-02 [Dual 4K Spotlight + Life-Raft Pod]'
];

const SQUADRONS = [
  'Alpha Quick-Response Wing',
  'Wildfire FLIR Overwatch',
  'Mountain Medevac Squad',
  'Coastal Flood Rescue Unit'
];

export const CreateAccountModal = ({ isOpen, onClose, onAccountCreated }) => {
  const { login } = useDrone();

  const [formData, setFormData] = useState({
    name: '',
    callSign: '',
    email: '',
    clearance: 'LEVEL-2 SAR MISSION PILOT',
    droneUnit: 'AERO-FALCON-01 [Dual Optical 4K + FLIR Boson]',
    squadron: 'Alpha Quick-Response Wing',
    password: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    soundFX.playClick();

    if (!formData.name.trim()) {
      setErrorMsg('Operator full name is required.');
      return;
    }
    if (!formData.callSign.trim()) {
      setErrorMsg('Tactical call sign is required (e.g. VIPER-9).');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMsg('A valid SAR / military email address is required.');
      return;
    }
    if (formData.password.length < 4) {
      setErrorMsg('Access Key must be at least 4 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Access keys do not match. Please verify.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await api.register({
        name: formData.name.trim(),
        callSign: formData.callSign.trim().toUpperCase(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        clearance: formData.clearance,
        droneUnit: formData.droneUnit,
        squadron: formData.squadron,
        role: formData.clearance.includes('HIGH-COMMAND') ? 'Mission Flight Commander' : 'Field SAR Drone Pilot'
      });

      if (response.success && response.user) {
        soundFX.playClick();
        setSuccessMsg(`Operator ${response.user.callSign} commissioned! Logging in...`);

        // Automatically log operator into context and localStorage
        setTimeout(() => {
          login({
            ...response.user,
            authCode: 'SAR-COMMISSIONED',
            loginTime: new Date().toISOString()
          });

          if (onAccountCreated) {
            onAccountCreated(response.user);
          }
          onClose();
        }, 800);
      } else {
        setErrorMsg(response.error || 'Registration rejected by Base Command.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to connect to Base Command server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div className="relative w-full max-w-xl bg-[#E8E6DA] border-2 border-[#277273] shadow-2xl flex flex-col max-h-[94vh] overflow-hidden text-[#191E15] rounded-none sm:rounded-sm">
        
        {/* MODAL HEADER */}
        <div className="px-5 py-4 bg-[#DFDDCF] border-b border-[#CAC7BA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#5F7521] text-white flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#5F7521]">
                AEROSAR MILITARY REGISTRY
              </div>
              <h3 className="text-lg font-chakra font-black uppercase text-[#191E15] tracking-tight">
                Create Operator Account
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

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          
          <div className="p-3 bg-[#DFDDCF] border border-[#CAC7BA] rounded-sm text-xs font-mono text-[#5C6654] leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#277273] flex-shrink-0 mt-0.5" />
            <span>
              Create a persistent operator profile in the AeroSAR tactical database. Your assigned clearance and drone squadron will be linked to your call sign.
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-sm bg-[#F8E3E3] border border-[#E0A8A8] text-[#901F1F] text-xs font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-[#C0392B]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-sm bg-[#E0F2E9] border border-[#86C9A3] text-[#1E5C3B] text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#2E7D32]" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* ROW 1: NAME & CALL SIGN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-widest text-[#788470] mb-1">
                  Full Operator Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Capt. Sarah Connor"
                    required
                    className="w-full bg-[#DFDDCF] border border-[#CAC7BA] rounded-none sm:rounded-sm px-3.5 py-2.5 text-sm font-mono text-[#191E15] placeholder-[#8E9A86] focus:outline-none focus:border-[#277273]"
                  />
                  <User className="w-3.5 h-3.5 text-[#8E9A86] absolute right-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-widest text-[#788470] mb-1">
                  Tactical Call Sign *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="callSign"
                    value={formData.callSign}
                    onChange={handleChange}
                    placeholder="e.g. VIPER-9"
                    required
                    className="w-full bg-[#DFDDCF] border border-[#CAC7BA] rounded-none sm:rounded-sm px-3.5 py-2.5 text-sm font-mono uppercase text-[#191E15] placeholder-[#8E9A86] focus:outline-none focus:border-[#277273]"
                  />
                  <Radio className="w-3.5 h-3.5 text-[#8E9A86] absolute right-3 top-3.5" />
                </div>
              </div>
            </div>

            {/* ROW 2: SAR EMAIL */}
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-widest text-[#788470] mb-1">
                Official SAR Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. s.connor@aerosar.mil"
                  required
                  className="w-full bg-[#DFDDCF] border border-[#CAC7BA] rounded-none sm:rounded-sm px-3.5 py-2.5 text-sm font-mono text-[#191E15] placeholder-[#8E9A86] focus:outline-none focus:border-[#277273]"
                />
                <Mail className="w-3.5 h-3.5 text-[#8E9A86] absolute right-3 top-3.5" />
              </div>
            </div>

            {/* ROW 3: CLEARANCE & SQUADRON */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-widest text-[#788470] mb-1">
                  Security Clearance Level
                </label>
                <select
                  name="clearance"
                  value={formData.clearance}
                  onChange={handleChange}
                  className="w-full bg-[#DFDDCF] border border-[#CAC7BA] rounded-none sm:rounded-sm px-3.5 py-2.5 text-xs font-mono text-[#191E15] focus:outline-none focus:border-[#277273]"
                >
                  {CLEARANCE_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-widest text-[#788470] mb-1">
                  Assigned Squadron
                </label>
                <select
                  name="squadron"
                  value={formData.squadron}
                  onChange={handleChange}
                  className="w-full bg-[#DFDDCF] border border-[#CAC7BA] rounded-none sm:rounded-sm px-3.5 py-2.5 text-xs font-mono text-[#191E15] focus:outline-none focus:border-[#277273]"
                >
                  {SQUADRONS.map(sq => (
                    <option key={sq} value={sq}>{sq}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ROW 4: PRIMARY DRONE UNIT */}
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-widest text-[#788470] mb-1">
                Primary UAV Aircraft Assignment
              </label>
              <div className="relative">
                <select
                  name="droneUnit"
                  value={formData.droneUnit}
                  onChange={handleChange}
                  className="w-full bg-[#DFDDCF] border border-[#CAC7BA] rounded-none sm:rounded-sm px-3.5 py-2.5 text-xs font-mono text-[#191E15] focus:outline-none focus:border-[#277273]"
                >
                  {DRONE_UNITS.map(du => (
                    <option key={du} value={du}>{du}</option>
                  ))}
                </select>
                <Plane className="w-3.5 h-3.5 text-[#8E9A86] absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* ROW 5: ACCESS KEY & CONFIRM KEY */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-widest text-[#788470] mb-1">
                  Tactical Access Key (Password) *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 4 characters"
                    required
                    className="w-full bg-[#DFDDCF] border-2 border-[#277273] rounded-none sm:rounded-sm px-3.5 py-2.5 text-sm font-mono text-[#191E15] placeholder-[#8E9A86] focus:outline-none"
                  />
                  <Lock className="w-3.5 h-3.5 text-[#277273] absolute right-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-widest text-[#788470] mb-1">
                  Confirm Access Key *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter access key"
                    required
                    className="w-full bg-[#DFDDCF] border border-[#CAC7BA] rounded-none sm:rounded-sm px-3.5 py-2.5 text-sm font-mono text-[#191E15] placeholder-[#8E9A86] focus:outline-none focus:border-[#277273]"
                  />
                  <Lock className="w-3.5 h-3.5 text-[#8E9A86] absolute right-3 top-3.5" />
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#5F7521] hover:bg-[#52661B] text-[#141A0E] font-chakra font-black text-sm tracking-widest uppercase py-3.5 px-6 rounded-none sm:rounded-sm flex items-center justify-between transition-colors shadow-sm"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#141A0E] border-t-transparent rounded-full animate-spin"></div>
                    COMMISSIONING OPERATOR CREDENTIALS...
                  </span>
                ) : (
                  <>
                    <span className="font-chakra font-black tracking-wider text-sm sm:text-base">
                      COMMISSION OPERATOR & ENTER POST
                    </span>
                    <ChevronRight className="w-5 h-5 font-bold" />
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

        {/* MODAL FOOTER */}
        <div className="px-5 py-3 bg-[#DFDDCF] border-t border-[#CAC7BA] flex items-center justify-between text-[11px] font-mono text-[#5C6654]">
          <span>MIL-STD-810H CERTIFIED BACKEND</span>
          <button
            type="button"
            onClick={onClose}
            className="hover:text-[#191E15] underline"
          >
            Cancel and return
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateAccountModal;
