import React from 'react';
import { useDrone } from '../../context/DroneContext';
import { 
  Crosshair, 
  Radio, 
  Volume2, 
  VolumeX, 
  User, 
  LogOut, 
  FileText, 
  PlusCircle, 
  AlertOctagon, 
  Clock, 
  Cable, 
  Cpu,
  Layers,
  Camera,
  Database
} from 'lucide-react';

const TopNavbar = ({ onOpenReportModal, onOpenDroneModal, onOpenSOSModal, onOpenDiagramModal, onOpenVaultModal, onOpenSupabaseModal }) => {
  const { 
    user, 
    logout, 
    telemetry, 
    detections, 
    triggerNewDetection, 
    isAudioMuted, 
    toggleAudio,
    droneConnection,
    sosState,
    capturedIntel
  } = useDrone();

  const pendingDetections = detections.filter(d => d.status === 'AWAITING_TRIAGE').length;

  const formatMissionTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <header className="w-full bg-white/95 border-b border-slate-200 backdrop-blur-md px-4 py-2.5 flex items-center justify-between z-30 sticky top-0 shadow-sm">
      {/* Brand & Call Sign */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 border border-green-300 text-green-700">
            <Crosshair className="w-4 h-4 animate-spin" style={{ animationDuration: '10s' }} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-600 rounded-full border-2 border-white animate-pulse"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-chakra font-bold text-lg tracking-wider text-green-700">
                AERO<span className="text-slate-900">SAR</span>
              </span>
              <span className="hidden md:inline-block text-[10px] font-mono-code px-1.5 py-0.5 rounded bg-green-100 text-green-800 border border-green-300 font-semibold">
                SAR MISSION COMMAND
              </span>
            </div>
          </div>
        </div>

        <div className="hidden lg:block h-6 w-px bg-slate-200"></div>

        {/* Active Drone & Mission Clock */}
        <div className="hidden lg:flex items-center gap-4 font-mono-code text-xs text-slate-700">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-green-600 animate-pulse" />
            <span className="text-slate-400 text-[11px]">UNIT:</span>
            <span className="text-slate-800 font-bold truncate max-w-[200px]">
              {telemetry.droneModel.split(' ')[0]}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            <Clock className="w-3 h-3 text-slate-500" />
            <span className="text-slate-500 text-[10px]">TIME:</span>
            <span className="text-slate-800 font-bold">{formatMissionTime(telemetry.missionTime)}</span>
          </div>
        </div>
      </div>

      {/* Center Alert or Active SOS Alert */}
      {sosState.isActive ? (
        <button
          onClick={onOpenSOSModal}
          className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white font-mono-code text-xs font-bold animate-pulse shadow-md shadow-red-500/30"
        >
          <AlertOctagon className="w-4 h-4 text-white" />
          <span>🚨 SOS ACTIVE: RESCUE, HOSPITAL & BLOOD BANK ENROUTE</span>
        </button>
      ) : pendingDetections > 0 ? (
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-mono-code text-xs font-semibold">
          <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
          <span>{pendingDetections} HUMAN SIGNATURE(S) PENDING TRIAGE</span>
        </div>
      ) : null}

      {/* Right Controls & User Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5 font-mono-code">
        {/* BIG HIGH-VISIBILITY SOS BUTTON */}
        <button
          onClick={onOpenSOSModal}
          title="Emergency Multi-Agency SOS: Automatically alerts Rescue Team, Trauma Hospital, and Blood Bank"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-chakra font-bold text-xs tracking-wider uppercase shadow-md shadow-red-500/20 hover:shadow-red-500/40 transition-all"
        >
          <AlertOctagon className="w-4 h-4 text-white" />
          <span>EMERGENCY SOS</span>
        </button>

        {/* DRONE HARDWARE LINK BUTTON */}
        <button
          onClick={onOpenDroneModal}
          title="Configure physical drone connection (MAVLink / RTSP / USB Capture Card)"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
            droneConnection.isConnected
              ? 'bg-green-50 border-green-300 text-green-800 hover:bg-green-100'
              : 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${droneConnection.isConnected ? 'bg-green-600 animate-pulse' : 'bg-rose-500'}`}></div>
          <Cable className="w-3.5 h-3.5 text-green-700" />
          <span className="hidden sm:inline text-[11px] font-chakra tracking-wide">
            {droneConnection.isConnected ? 'DRONE LINKED' : 'CONNECT DRONE'}
          </span>
        </button>

        {/* SUPABASE CLOUD DATABASE BUTTON */}
        <button
          onClick={onOpenSupabaseModal}
          title="Supabase Cloud Database Sync (Project: hwhozwfaazlaqriiewko)"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold transition-all shadow-sm"
        >
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline text-[11px] font-chakra tracking-wide">
            SUPABASE
          </span>
        </button>

        {/* SYSTEM SCHEMATIC BUTTON */}
        <button
          onClick={onOpenDiagramModal}
          title="View Complete Drone System Architecture & Sensor Schematic"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold transition-colors"
        >
          <Layers className="w-3.5 h-3.5 text-green-700" />
          <span className="hidden md:inline text-[11px]">DIAGRAM</span>
        </button>

        {/* Simulate AI Detection */}
        <button
          onClick={triggerNewDetection}
          title="Simulate AI Target Detection in live feed"
          className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5 text-green-700" />
          <span className="text-[11px]">DETECT</span>
        </button>

        {/* Audio Mute/Unmute */}
        <button
          onClick={toggleAudio}
          title={isAudioMuted ? 'Unmute tactical audio' : 'Mute tactical audio'}
          className="p-1.5 rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors"
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-green-700" />}
        </button>

        {/* Recon Intel Vault */}
        <button
          onClick={onOpenVaultModal}
          title="View Captured Aerial Reconnaissance Intel Snapshots"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold transition-colors"
        >
          <Camera className="w-3.5 h-3.5 text-emerald-700" />
          <span className="hidden md:inline text-[11px] font-chakra tracking-wide">
            RECON VAULT ({capturedIntel.length})
          </span>
        </button>

        {/* Mission Report */}
        <button
          onClick={onOpenReportModal}
          title="View and Export SAR Mission Report"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-amber-600" />
          <span className="hidden md:inline text-[11px]">REPORT</span>
        </button>

        {/* Pilot Profile & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-slate-900 font-chakra leading-tight">
              {user?.callSign || 'PILOT-SAR'}
            </span>
            <span className="text-[9px] text-slate-500 font-mono-code leading-tight">
              {user?.clearance?.split(' ')[0] || 'LVL-3'}
            </span>
          </div>

          <button
            onClick={logout}
            title="Disconnect & Sign Out"
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 border border-slate-300 hover:border-rose-300 text-slate-600 hover:text-rose-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
