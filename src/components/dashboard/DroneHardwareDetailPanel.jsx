import React from 'react';
import { useDrone } from '../../context/DroneContext';
import { 
  Radio, 
  BatteryCharging, 
  Compass, 
  MapPin, 
  Gauge, 
  Cpu, 
  Wifi, 
  Camera, 
  ShieldCheck, 
  Activity,
  Sliders
} from 'lucide-react';

const DroneHardwareDetailPanel = ({ onOpenConnectModal }) => {
  const { droneConnection, telemetry } = useDrone();

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 p-4 shadow-sm font-mono-code text-xs">
      {/* Header with Connection Pill & Modal Trigger */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 mb-3 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-green-100 text-green-700">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-chakra font-bold text-sm text-slate-900">
                {telemetry.droneModel}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 border border-green-300">
                HARDWARE LINKED
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Protocol: <span className="font-semibold text-slate-700">{droneConnection.protocolVersion}</span> ({droneConnection.droneIp}:{droneConnection.port})
            </div>
          </div>
        </div>

        <button
          onClick={onOpenConnectModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold transition-colors"
        >
          <Sliders className="w-3.5 h-3.5 text-green-600" />
          <span>CONFIGURE HARDWARE LINK</span>
        </button>
      </div>

      {/* Grid of All Real Drone Telemetry Details */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. RF Link & Latency */}
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-[10px] text-slate-500 flex items-center gap-1 mb-1">
            <Wifi className="w-3 h-3 text-green-600" /> RF LINK SIGNAL
          </div>
          <div className="font-bold text-slate-900 text-sm">{droneConnection.linkQuality}%</div>
          <div className="text-[10px] text-slate-500">
            {droneConnection.latency} ms | {droneConnection.rssi} dBm
          </div>
        </div>

        {/* 2. Battery & Power System */}
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-[10px] text-slate-500 flex items-center gap-1 mb-1">
            <BatteryCharging className="w-3 h-3 text-green-600" /> POWER & VOLTAGE
          </div>
          <div className="font-bold text-slate-900 text-sm">{telemetry.battery}% ({telemetry.voltage}V)</div>
          <div className="text-[10px] text-slate-500">
            {telemetry.cellVoltage} | {telemetry.currentDraw}A
          </div>
        </div>

        {/* 3. GPS & RTK Satellite Lock */}
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-[10px] text-slate-500 flex items-center gap-1 mb-1">
            <MapPin className="w-3 h-3 text-green-600" /> SATELLITES & RTK
          </div>
          <div className="font-bold text-slate-900 text-sm">{telemetry.satellites} SATS</div>
          <div className="text-[10px] text-green-700 font-bold">
            {telemetry.rtkAccuracy}
          </div>
        </div>

        {/* 4. Speed & Altitude */}
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-[10px] text-slate-500 flex items-center gap-1 mb-1">
            <Gauge className="w-3 h-3 text-green-600" /> FLIGHT DYNAMICS
          </div>
          <div className="font-bold text-slate-900 text-sm">{telemetry.speed} m/s</div>
          <div className="text-[10px] text-slate-500">
            ALT: {telemetry.altitude}m AGL ({telemetry.altitudeMsl}m MSL)
          </div>
        </div>

        {/* 5. Autopilot & Heading */}
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-[10px] text-slate-500 flex items-center gap-1 mb-1">
            <Compass className="w-3 h-3 text-green-600" /> AUTOPILOT
          </div>
          <div className="font-bold text-slate-900 text-sm">{telemetry.heading}° NE</div>
          <div className="text-[10px] text-slate-500">
            MODE: {telemetry.flightMode}
          </div>
        </div>

        {/* 6. Avionics & FCU Health */}
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-[10px] text-slate-500 flex items-center gap-1 mb-1">
            <Cpu className="w-3 h-3 text-green-600" /> FCU & GIMBAL
          </div>
          <div className="font-bold text-slate-900 text-sm">GIMBAL {telemetry.gimbalPitch}°</div>
          <div className="text-[10px] text-slate-500">
            IMU: {telemetry.imuTemp}°C | {droneConnection.flightController.split(' ')[0]}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DroneHardwareDetailPanel;
