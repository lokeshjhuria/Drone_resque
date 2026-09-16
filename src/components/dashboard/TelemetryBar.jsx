import React from 'react';
import { useDrone } from '../../context/DroneContext';
import { 
  BatteryCharging, 
  Compass, 
  ArrowUp, 
  Gauge, 
  MapPin, 
  Wind, 
  Camera, 
  Navigation,
  CheckCircle2,
  Cpu,
  Target
} from 'lucide-react';
import { formatTacticalCoordinates } from '../../utils/geocoding';

const TelemetryBar = () => {
  const { telemetry, setFlightDirective, droneConnection, activeSearchArea } = useDrone();

  const getBatteryColor = (level) => {
    if (level > 50) return 'text-green-800 border-green-300 bg-green-50';
    if (level > 25) return 'text-amber-800 border-amber-300 bg-amber-50';
    return 'text-rose-800 border-rose-300 bg-rose-50 animate-pulse';
  };

  const getCompassHeadingName = (deg) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  };

  return (
    <div className="w-full bg-slate-50 border-b border-slate-200 px-4 py-2 text-xs font-mono-code flex flex-wrap items-center justify-between gap-3 shadow-inner">
      {/* Flight Telemetry Strip in Light Theme */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        {/* Battery & Power */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${getBatteryColor(telemetry.battery)}`}>
          <BatteryCharging className="w-3.5 h-3.5 text-green-700" />
          <span className="font-bold">{telemetry.battery}%</span>
          <span className="text-[10px] opacity-80">({telemetry.voltage}V)</span>
        </div>

        {/* Altitude (AGL) */}
        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200 text-slate-700 shadow-2xl-sm">
          <ArrowUp className="w-3.5 h-3.5 text-green-700" />
          <span className="text-slate-500 text-[10px]">ALT:</span>
          <span className="text-slate-900 font-bold">{telemetry.altitude} m</span>
          <span className="text-[9px] text-slate-500">AGL</span>
        </div>

        {/* Ground Speed */}
        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200 text-slate-700">
          <Gauge className="w-3.5 h-3.5 text-green-700" />
          <span className="text-slate-500 text-[10px]">SPD:</span>
          <span className="text-slate-900 font-bold">{telemetry.speed} m/s</span>
          <span className="text-[9px] text-slate-500">({(telemetry.speed * 3.6).toFixed(0)} km/h)</span>
        </div>

        {/* Heading / Compass */}
        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200 text-slate-700">
          <Compass className="w-3.5 h-3.5 text-green-700" />
          <span className="text-slate-500 text-[10px]">HDG:</span>
          <span className="text-slate-900 font-bold">{telemetry.heading}°</span>
          <span className="text-[10px] text-green-700 font-bold">{getCompassHeadingName(telemetry.heading)}</span>
        </div>

        {/* GPS Coordinates & Active Sector */}
        <div className="hidden md:flex items-center gap-2 bg-white px-2.5 py-1 rounded-md border border-slate-200 text-slate-700">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-green-700" />
            <span className="text-slate-500 text-[10px]">GPS:</span>
            <span className="text-slate-800 font-semibold">{formatTacticalCoordinates(telemetry.lat, telemetry.lng)}</span>
          </div>
          {activeSearchArea?.name && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold truncate max-w-[160px]" title={activeSearchArea.name}>
              {activeSearchArea.name.split(',')[0]}
            </span>
          )}
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-green-100 text-green-800 border border-green-300 font-bold">
            RTK FIX
          </span>
        </div>

        {/* Wind Speed & Gimbal Pitch */}
        <div className="hidden xl:flex items-center gap-3 text-slate-600 text-[11px]">
          <span className="flex items-center gap-1">
            <Wind className="w-3 h-3 text-green-700" /> {telemetry.windSpeed} m/s Wind
          </span>
          <span className="flex items-center gap-1">
            <Camera className="w-3 h-3 text-green-700" /> Gimbal {telemetry.gimbalPitch}°
          </span>
        </div>
      </div>

      {/* Flight Mode Directive Switcher */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-500 uppercase hidden sm:inline">Autopilot:</span>
        <div className="flex items-center rounded-lg bg-slate-200/80 border border-slate-300 p-0.5">
          {[
            { id: 'AUTO_SAR_GRID', label: 'GRID SEARCH' },
            { id: 'ORBIT_TARGET', label: 'ORBIT TARGET' },
            { id: 'RTH', label: 'RTH (RETURN)' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setFlightDirective(mode.id)}
              className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase transition-all ${
                telemetry.flightMode === mode.id
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TelemetryBar;
