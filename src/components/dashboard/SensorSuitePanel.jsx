import React from 'react';
import { useDrone } from '../../context/DroneContext';
import { 
  Radar, 
  Camera, 
  Flame, 
  MapPin, 
  Thermometer, 
  Wind, 
  Droplets, 
  Gauge, 
  BatteryCharging, 
  Cpu, 
  Radio,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

const SensorSuitePanel = () => {
  const { ultrasonic, environmental, telemetry, droneConnection } = useDrone();

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 p-4 shadow-sm font-mono-code text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold font-chakra text-sm">
          <Cpu className="w-4 h-4 text-green-700" />
          <span>ONBOARD SENSORS & SYSTEM HARDWARE SUITE</span>
        </div>
        <span className="text-[11px] text-green-700 font-bold">
          8 OF 8 COMPONENTS ACTIVE & HEALTHY
        </span>
      </div>

      {/* Grid of All 8 Components matching User Diagram */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Ultrasonic Sensor */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-green-400 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-slate-900 flex items-center gap-1.5 font-chakra text-xs">
              <Radar className="w-4 h-4 text-green-700" />
              1. ULTRASONIC SENSOR
            </span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
              ultrasonic.status === 'CLEAR' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-amber-100 text-amber-800'
            }`}>
              {ultrasonic.status}
            </span>
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono-code mb-1">
            {ultrasonic.frontDistance} m <span className="text-xs font-normal text-slate-500">Distance</span>
          </div>
          <p className="text-[10px] text-slate-600">
            Detects obstacles & nearby terrain objects in flight path.
          </p>
        </div>

        {/* 2. Optical 4K Camera */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-green-400 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-slate-900 flex items-center gap-1.5 font-chakra text-xs">
              <Camera className="w-4 h-4 text-green-700" />
              2. VISUAL 4K CAMERA
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-green-100 text-green-800">
              60 FPS
            </span>
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono-code mb-1">
            3840x2160 <span className="text-xs font-normal text-slate-500">Ultra-HD</span>
          </div>
          <p className="text-[10px] text-slate-600">
            High-resolution video for visual survivor & hazard detection.
          </p>
        </div>

        {/* 3. Thermal FLIR Camera */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-green-400 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-slate-900 flex items-center gap-1.5 font-chakra text-xs">
              <Flame className="w-4 h-4 text-rose-600" />
              3. THERMAL FLIR CAM
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
              7.5-13.5µm
            </span>
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono-code mb-1">
            640x512 <span className="text-xs font-normal text-slate-500">NETD &lt;40mK</span>
          </div>
          <p className="text-[10px] text-slate-600">
            Detects human body heat signatures through foliage & dark.
          </p>
        </div>

        {/* 4. GPS Navigation */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-green-400 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-slate-900 flex items-center gap-1.5 font-chakra text-xs">
              <MapPin className="w-4 h-4 text-green-700" />
              4. GPS NAVIGATION
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-green-100 text-green-800">
              RTK FIXED
            </span>
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono-code mb-1">
            {telemetry.satellites} SATS <span className="text-xs font-normal text-slate-500">±1.8cm</span>
          </div>
          <p className="text-[10px] text-slate-600">
            Sub-centimeter location tracking, waypoint and route planning.
          </p>
        </div>

        {/* 5. Environmental Sensors Suite */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-green-400 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-slate-900 flex items-center gap-1.5 font-chakra text-xs">
              <Wind className="w-4 h-4 text-blue-600" />
              5. ENVIRONMENTAL
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
              AQI {environmental.aqi}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[11px] font-bold text-slate-800 mb-1">
            <div>Temp: <span className="text-slate-950">{environmental.ambientTemp}°C</span></div>
            <div>Hum: <span className="text-slate-950">{environmental.humidity}%</span></div>
            <div>Baro: <span className="text-slate-950">{environmental.pressure} hPa</span></div>
            <div>Air: <span className="text-green-700">CLEAN</span></div>
          </div>
          <p className="text-[10px] text-slate-600">
            Ambient weather & toxic hazard monitoring for safety.
          </p>
        </div>

        {/* 6. Battery Power System */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-green-400 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-slate-900 flex items-center gap-1.5 font-chakra text-xs">
              <BatteryCharging className="w-4 h-4 text-green-700" />
              6. BATTERY SYSTEM
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-green-100 text-green-800">
              {telemetry.battery}%
            </span>
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono-code mb-1">
            24.8 V <span className="text-xs font-normal text-slate-500">6S 22000mAh</span>
          </div>
          <p className="text-[10px] text-slate-600">
            Smart BMS powers flight controller, motors and payload pods.
          </p>
        </div>

        {/* 7. Flight Controller (Pixhawk FCU) */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-green-400 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-slate-900 flex items-center gap-1.5 font-chakra text-xs">
              <Cpu className="w-4 h-4 text-green-700" />
              7. FLIGHT CONTROLLER
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-green-100 text-green-800">
              PX4 SAR
            </span>
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono-code mb-1">
            Pixhawk 6X <span className="text-xs font-normal text-slate-500">Dual IMU</span>
          </div>
          <p className="text-[10px] text-slate-600">
            Stabilizes flight, coordinates all sensors and executes autopilot.
          </p>
        </div>

        {/* 8. Communication Module */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-green-400 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-slate-900 flex items-center gap-1.5 font-chakra text-xs">
              <Radio className="w-4 h-4 text-green-700" />
              8. COMM MODULE
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-green-100 text-green-800">
              99% LINK
            </span>
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono-code mb-1">
            2.4GHz MIMO <span className="text-xs font-normal text-slate-500">15km Range</span>
          </div>
          <p className="text-[10px] text-slate-600">
            Sends real-time telemetry & dual 4K/thermal streams to Ground Station.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SensorSuitePanel;
