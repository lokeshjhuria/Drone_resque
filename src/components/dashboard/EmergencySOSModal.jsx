import React from 'react';
import { useDrone } from '../../context/DroneContext';
import { 
  AlertOctagon, 
  X, 
  Truck, 
  Building2, 
  Droplet, 
  Plane, 
  CheckCircle2, 
  Radio, 
  Clock, 
  ShieldAlert, 
  Printer, 
  MapPin,
  HeartPulse
} from 'lucide-react';

const EmergencySOSModal = ({ isOpen, onClose }) => {
  const { sosState, cancelEmergencySOS, detections } = useDrone();

  if (!isOpen || !sosState.isActive) return null;

  const target = detections.find(d => d.id === sosState.targetId) || detections[0];

  const handlePrintTicket = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm font-mono-code">
      <div className="relative w-full max-w-4xl bg-white border-2 border-red-500 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Urgent Header Banner */}
        <div className="bg-red-600 text-white px-6 py-3.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/20 animate-pulse">
              <AlertOctagon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-chakra text-lg font-bold tracking-wider">
                  AUTOMATED MULTI-AGENCY SOS DISPATCH ACTIVE
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white text-red-700 font-bold">
                  HIGH PRIORITY
                </span>
              </div>
              <p className="text-xs text-red-100">
                Rescue Team, Level-1 Hospital & Regional Blood Bank notified automatically via Drone Telemetry
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-800 bg-slate-50">
          {/* Survivor Location & Vitals Strip */}
          <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">SURVIVOR TARGET</div>
                <div className="text-slate-900 font-bold">{target?.name} ({target?.id})</div>
                <div className="text-[10px] text-slate-600">{target?.lat}°N, {Math.abs(target?.lng)}°W</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">BODY HEAT / VITALS</div>
                <div className="text-red-700 font-bold">{target?.bodyTemp}°C ({target?.heatIntensity})</div>
                <div className="text-[10px] text-slate-600">Elevation: {target?.elevation}m | Dist: {target?.distance}m</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600 flex-shrink-0" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">DISPATCH TIMESTAMP</div>
                <div className="text-slate-900 font-bold">{sosState.dispatchTime || '19:28:10'} UTC+5:30</div>
                <div className="text-[10px] text-green-700 font-bold">✓ ALL UNITS ACKNOWLEDGED</div>
              </div>
            </div>
          </div>

          {/* 4 Emergency Agency Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* 1. Rescue Ground Team */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-green-500 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-green-100 text-green-700">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 font-chakra">1. RESCUE TEAM ENROUTE</h3>
                    <div className="text-[10px] text-slate-500">{sosState.rescueTeam.callSign}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 border border-green-300 animate-pulse">
                  ETA: {sosState.rescueTeam.etaMinutes} MINS
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mb-2">
                {sosState.rescueTeam.status}
              </p>
              <div className="p-2 rounded bg-slate-50 text-[10px] space-y-0.5 border border-slate-100 text-slate-600">
                <div>• Vehicle: <span className="text-slate-800 font-semibold">{sosState.rescueTeam.vehicle}</span></div>
                <div>• Crew: <span className="text-slate-800 font-semibold">{sosState.rescueTeam.crew}</span></div>
              </div>
            </div>

            {/* 2. Trauma Hospital Notification */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-blue-500 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 font-chakra">2. HOSPITAL INFORMED</h3>
                    <div className="text-[10px] text-slate-500 truncate max-w-[180px]">{sosState.hospital.name}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                  TRAUMA READY
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mb-2">
                {sosState.hospital.icuStatus}
              </p>
              <div className="p-2 rounded bg-slate-50 text-[10px] space-y-0.5 border border-slate-100 text-slate-600">
                <div>• Distance: <span className="text-slate-800 font-semibold">{sosState.hospital.distance}</span></div>
                <div>• Hotline: <span className="text-blue-700 font-bold">{sosState.hospital.contactNumber}</span></div>
              </div>
            </div>

            {/* 3. Emergency Blood Bank Requisition */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-rose-500 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
                    <Droplet className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 font-chakra">3. BLOOD BANK NOTIFIED</h3>
                    <div className="text-[10px] text-slate-500 truncate max-w-[180px]">{sosState.bloodBank.facility}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                  RESERVED
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mb-2">
                {sosState.bloodBank.unitsReserved}
              </p>
              <div className="p-2 rounded bg-slate-50 text-[10px] space-y-0.5 border border-slate-100 text-slate-600">
                <div>• Requisition #: <span className="text-slate-800 font-semibold">{sosState.bloodBank.requisitionId}</span></div>
                <div>• Courier: <span className="text-green-700 font-bold">{sosState.bloodBank.courierStatus}</span></div>
              </div>
            </div>

            {/* 4. Air Medevac Helicopter Scrambled */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-amber-500 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                    <Plane className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 font-chakra">4. AIR AMBULANCE HELICOPTER</h3>
                    <div className="text-[10px] text-slate-500">{sosState.airAmbulance.callSign}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                  ETA: {sosState.airAmbulance.etaMinutes} MINS
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mb-2">
                {sosState.airAmbulance.status}
              </p>
              <div className="p-2 rounded bg-slate-50 text-[10px] space-y-0.5 border border-slate-100 text-slate-600">
                <div>• Drone Guided LZ: <span className="text-slate-800 font-semibold">{sosState.airAmbulance.landingZone}</span></div>
              </div>
            </div>
          </div>

          {/* Chronological Automated SOS Broadcast Log */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse" />
              MULTI-AGENCY TELEMETRY BROADCAST LOG
            </h4>
            <div className="space-y-1.5 p-3 rounded-lg bg-white border border-slate-200 text-[10px] text-slate-700 max-h-32 overflow-y-auto">
              {sosState.logs.map((msg, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0" />
                  <span className="font-mono-code">{msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between">
          <button
            onClick={cancelEmergencySOS}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors"
          >
            STAND DOWN SOS ALARM
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintTicket}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PRINT DISPATCH TICKET</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md shadow-red-500/20"
            >
              MONITOR IN DASHBOARD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencySOSModal;
