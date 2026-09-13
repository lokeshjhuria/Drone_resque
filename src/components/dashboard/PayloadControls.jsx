import React, { useState } from 'react';
import { useDrone } from '../../context/DroneContext';
import { 
  Package, 
  Radio, 
  ShieldAlert, 
  RotateCw, 
  Home, 
  Navigation, 
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  AlertOctagon
} from 'lucide-react';

const PayloadControls = () => {
  const { 
    payloads, 
    dropMedicalPod, 
    deployBeacon, 
    activeTargetId, 
    detections, 
    telemetry, 
    setFlightDirective,
    triggerEmergencySOS 
  } = useDrone();

  const [safetySwitchArmed, setSafetySwitchArmed] = useState(false);
  const activeTarget = detections.find(d => d.id === activeTargetId) || detections[0];

  const handleDropPod = () => {
    if (!safetySwitchArmed) return;
    if (activeTarget) {
      dropMedicalPod(activeTarget.id);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 p-4 shadow-sm font-mono-code text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold font-chakra text-sm">
          <Package className="w-4 h-4 text-amber-600" />
          <span>RESCUE PAYLOAD & AUTOPILOT CONTROLS</span>
        </div>
        <span className="text-[11px] text-slate-500 font-semibold">
          BAY STATUS: {payloads.medicalPods} OF 2 PODS READY
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Left: First-Aid Supply Drop Pod Controller */}
        <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-amber-900 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-amber-600" />
              FIRST-AID & HYPOTHERMIA POD
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-amber-800 border border-amber-300 font-bold">
              TARGET: {activeTarget?.id || 'NONE'}
            </span>
          </div>

          <p className="text-[11px] text-slate-600 mb-3">
            Contains automated external defibrillator (AED), thermal emergency foil blanket, water rations & VHF beacon.
          </p>

          {/* Safety Switch Toggle */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-amber-200 mb-3">
            <span className="text-slate-700 text-[11px] flex items-center gap-1 font-semibold">
              <ShieldAlert className={`w-4 h-4 ${safetySwitchArmed ? 'text-red-600' : 'text-slate-400'}`} />
              DROP SAFETY RELEASE LATCH:
            </span>
            <button
              onClick={() => setSafetySwitchArmed(!safetySwitchArmed)}
              className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                safetySwitchArmed
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {safetySwitchArmed ? 'ARMED (HOT)' : 'LOCKED (SAFE)'}
            </button>
          </div>

          {/* Drop Action Button */}
          <button
            onClick={handleDropPod}
            disabled={!safetySwitchArmed || payloads.medicalPods <= 0 || payloads.isDroppingPod}
            className={`w-full py-2.5 rounded-lg font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all ${
              payloads.isDroppingPod
                ? 'bg-amber-500 text-white animate-pulse'
                : safetySwitchArmed && payloads.medicalPods > 0
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {payloads.isDroppingPod ? (
              <span>DEPLOYING PARACHUTE POD OVER {activeTarget?.id}...</span>
            ) : (
              <>
                <Package className="w-4 h-4" />
                <span>RELEASE MEDICAL POD ({payloads.medicalPods} LEFT)</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Acoustic Beacon & Autopilot Modes */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-green-700" />
                120dB ACOUSTIC SIREN & STROBE
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${payloads.beaconActive ? 'bg-green-100 text-green-800 border-green-300' : 'bg-slate-200 text-slate-600 border-slate-300'}`}>
                {payloads.beaconActive ? 'TRANSMITTING' : 'STANDBY'}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 mb-3">
              Emits high-frequency SAR sound pulses & strobe flashes to guide missing persons toward the drone position.
            </p>

            <button
              onClick={deployBeacon}
              className={`w-full py-2 rounded-lg font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all mb-3 ${
                payloads.beaconActive
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-white hover:bg-green-50 text-green-700 border border-green-300'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{payloads.beaconActive ? 'DEACTIVATE ACOUSTIC SIREN' : 'ENGAGE 120dB SIREN & STROBE'}</span>
            </button>
          </div>

          {/* Quick Autopilot Directives */}
          <div className="pt-2 border-t border-slate-200 grid grid-cols-3 gap-1.5">
            <button
              onClick={() => setFlightDirective('AUTO_SAR_GRID')}
              className={`p-2 rounded-lg border text-[11px] font-bold text-center transition-colors ${
                telemetry.flightMode === 'AUTO_SAR_GRID'
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              AUTO GRID
            </button>

            <button
              onClick={() => setFlightDirective('ORBIT_TARGET')}
              className={`p-2 rounded-lg border text-[11px] font-bold text-center transition-colors ${
                telemetry.flightMode === 'ORBIT_TARGET'
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              ORBIT SPOT
            </button>

            <button
              onClick={() => setFlightDirective('RTH')}
              className={`p-2 rounded-lg border text-[11px] font-bold text-center transition-colors ${
                telemetry.flightMode === 'RTH'
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white border-slate-200 text-red-600 hover:bg-red-50'
              }`}
            >
              RETURN HOME
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayloadControls;
