import React from 'react';
import { 
  Cpu, 
  X, 
  Layers, 
  ArrowRight, 
  Radar, 
  Camera, 
  Flame, 
  MapPin, 
  Wind, 
  BatteryCharging, 
  Radio, 
  Monitor,
  CheckCircle2
} from 'lucide-react';

const SystemArchitectureModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm font-mono-code">
      <div className="relative w-full max-w-4xl bg-white border border-slate-300 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-green-700">
            <Cpu className="w-5 h-5 text-green-700" />
            <h2 className="font-chakra text-lg font-bold tracking-wider text-slate-900">
              DRONE RESCUE & DETECTION SYSTEM ARCHITECTURE
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 bg-white">
          {/* Mission Motto Banner */}
          <div className="text-center p-3 rounded-xl bg-green-50 border border-green-200">
            <h3 className="font-chakra text-base font-bold text-green-900 tracking-wide">
              SEARCH • DETECT • RESCUE • SAVE LIVES
            </h3>
            <p className="text-[11px] text-green-800">
              Complete Hardware Integration & Sensor Telemetry Pipeline
            </p>
          </div>

          {/* System Connection Flow Chart */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 font-chakra text-sm mb-3">
              COMPLETE SYSTEM CONNECTION SCHEMATIC
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Column 1: 5 Onboard Sensors */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase">
                  1. Sensor Inputs
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center gap-2">
                  <Radar className="w-4 h-4 text-green-700" />
                  <div>
                    <div className="font-bold text-slate-900">Ultrasonic Sensor</div>
                    <div className="text-[10px] text-slate-500">Obstacle Detection</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center gap-2">
                  <Camera className="w-4 h-4 text-green-700" />
                  <div>
                    <div className="font-bold text-slate-900">Visual 4K Camera</div>
                    <div className="text-[10px] text-slate-500">Visual Detection</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-600" />
                  <div>
                    <div className="font-bold text-slate-900">Thermal Camera</div>
                    <div className="text-[10px] text-slate-500">Heat Signatures</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-700" />
                  <div>
                    <div className="font-bold text-slate-900">GPS Navigation</div>
                    <div className="text-[10px] text-slate-500">Tracking & Waypoints</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center gap-2">
                  <Wind className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-bold text-slate-900">Environmental Sensors</div>
                    <div className="text-[10px] text-slate-500">Temp, Hum, Press, AQI</div>
                  </div>
                </div>
              </div>

              {/* Column 2: Central Flight Controller & Battery */}
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="w-full p-4 rounded-xl bg-green-100/70 border-2 border-green-600 shadow-md">
                  <Cpu className="w-8 h-8 text-green-700 mx-auto mb-2" />
                  <div className="font-bold text-slate-900 font-chakra text-sm">
                    FLIGHT CONTROLLER
                  </div>
                  <div className="text-[10px] text-slate-700 mb-2">
                    Pixhawk 6X Pro Dual IMU
                  </div>
                  <p className="text-[10px] text-slate-600">
                    Stabilizes flight, fuses sensor inputs & controls autonomous SAR logic.
                  </p>
                </div>

                <div className="w-full p-3 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center gap-2">
                  <BatteryCharging className="w-4 h-4 text-green-700" />
                  <div className="text-left">
                    <div className="font-bold text-slate-900">Smart Battery System</div>
                    <div className="text-[10px] text-slate-500">6S 24.8V Powers System</div>
                  </div>
                </div>
              </div>

              {/* Column 3: Communication Module & Ground Station */}
              <div className="space-y-4">
                <div className="text-[11px] font-bold text-slate-500 uppercase">
                  2. Wireless Transmission
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Radio className="w-4 h-4 text-green-700" />
                    <span className="font-bold text-slate-900 font-chakra">
                      COMMUNICATION MODULE
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 mb-2">
                    Transmits high-speed telemetry, MAVLink packets & live dual 4K/thermal streams.
                  </p>
                  <div className="text-[10px] font-bold text-green-700">
                    2.4GHz MIMO RF (15 km Range)
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-green-50 border-2 border-green-500 shadow-md text-center">
                  <Monitor className="w-6 h-6 text-green-700 mx-auto mb-1.5" />
                  <div className="font-bold text-slate-900 font-chakra">
                    AEROSAR GROUND STATION
                  </div>
                  <div className="text-[10px] text-green-800 font-bold mb-1">
                    Real-time PC & Mobile Command
                  </div>
                  <p className="text-[9px] text-slate-600">
                    Live Dual Video • AI Detection • SOS Automation • Hospital & Blood Bank Link
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-all shadow-sm"
          >
            CLOSE DIAGRAM
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemArchitectureModal;
