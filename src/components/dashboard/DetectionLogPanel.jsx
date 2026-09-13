import React, { useState } from 'react';
import { useDrone } from '../../context/DroneContext';
import { 
  Users, 
  Target, 
  Thermometer, 
  ShieldAlert, 
  CheckCircle2, 
  Send, 
  Package, 
  Clock, 
  ListFilter,
  Activity,
  AlertTriangle,
  AlertOctagon
} from 'lucide-react';

const DetectionLogPanel = () => {
  const { 
    detections, 
    activeTargetId, 
    lockTarget, 
    dropMedicalPod, 
    dispatchRescueTeam, 
    markRescued,
    triggerEmergencySOS,
    missionLogs,
    payloads 
  } = useDrone();

  const [activeTab, setActiveTab] = useState('targets');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filteredDetections = detections.filter(d => {
    if (filterStatus === 'ALL') return true;
    return d.status === filterStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AWAITING_TRIAGE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">TRIAGE PENDING</span>;
      case 'MEDICAL_DROPPED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">MED-POD DROPPED</span>;
      case 'RESCUE_ENROUTE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300 animate-pulse">RESCUE ENROUTE</span>;
      case 'RESCUED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 border border-green-300">RESCUED</span>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm font-mono-code">
      {/* Tab Header in Light Theme */}
      <div className="bg-white border-b border-slate-200 px-3 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('targets')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
              activeTab === 'targets'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>AI DETECTIONS ({detections.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
              activeTab === 'logs'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>MISSION LOGS</span>
          </button>
        </div>

        {activeTab === 'targets' && (
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-[11px] text-slate-700 focus:outline-none focus:border-green-600"
          >
            <option value="ALL">ALL STATUS</option>
            <option value="AWAITING_TRIAGE">TRIAGE PENDING</option>
            <option value="MEDICAL_DROPPED">MED DROPPED</option>
            <option value="RESCUED">RESCUED</option>
          </select>
        )}
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeTab === 'targets' ? (
          filteredDetections.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No survivor targets match the filter.
            </div>
          ) : (
            filteredDetections.map((det) => {
              const isLocked = det.id === activeTargetId;
              const isHypo = det.bodyTemp < 35.0;

              return (
                <div
                  key={det.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isLocked
                      ? 'bg-green-50/50 border-green-500 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${isHypo ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                        <Target className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 font-chakra">{det.id}</span>
                          {getStatusBadge(det.status)}
                        </div>
                        <div className="text-[11px] text-slate-500">{det.name}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-green-700">
                        {det.confidence}% CONF
                      </div>
                      <div className="text-[10px] text-slate-400">{det.time}</div>
                    </div>
                  </div>

                  {/* Vitals & Thermal telemetry */}
                  <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-white border border-slate-200 text-[11px] mb-2">
                    <div className="flex items-center gap-1.5">
                      <Thermometer className={`w-3.5 h-3.5 ${isHypo ? 'text-amber-600' : 'text-rose-600'}`} />
                      <span className="text-slate-500">TEMP:</span>
                      <span className={`font-bold ${isHypo ? 'text-amber-700' : 'text-rose-700'}`}>
                        {det.bodyTemp}°C
                      </span>
                      {isHypo && <span className="text-[9px] text-amber-600">⚠️ HYPO</span>}
                    </div>

                    <div className="text-right text-slate-600">
                      <span>DIST: </span>
                      <span className="text-slate-900 font-bold">{det.distance}m</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 mb-2.5 italic">
                    "{det.notes}"
                  </p>

                  {/* Actions buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => lockTarget(det.id)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all ${
                        isLocked
                          ? 'bg-green-600 text-white'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      <Target className="w-3 h-3" />
                      <span>{isLocked ? 'GIMBAL LOCKED' : 'LOCK GIMBAL'}</span>
                    </button>

                    {/* DIRECT SOS BUTTON FOR THIS SURVIVOR */}
                    <button
                      onClick={() => triggerEmergencySOS(det.id)}
                      className="px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all"
                    >
                      <AlertOctagon className="w-3 h-3 text-white" />
                      <span>SOS DISPATCH</span>
                    </button>

                    {det.status === 'AWAITING_TRIAGE' && (
                      <button
                        onClick={() => dropMedicalPod(det.id)}
                        disabled={payloads.medicalPods <= 0 || payloads.isDroppingPod}
                        className="px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-all disabled:opacity-50"
                      >
                        <Package className="w-3 h-3" />
                        <span>DROP MED-POD ({payloads.medicalPods})</span>
                      </button>
                    )}

                    {det.status !== 'RESCUED' && det.status !== 'AWAITING_TRIAGE' && (
                      <button
                        onClick={() => markRescued(det.id)}
                        className="px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 bg-green-100 hover:bg-green-200 text-green-900 border border-green-300 transition-all"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>MARK RESCUED</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )
        ) : (
          /* Live Event Logs Tab */
          <div className="space-y-2">
            {missionLogs.map((log) => {
              let typeClass = 'text-green-800 bg-green-100 border-green-300';
              if (log.type === 'ALERT') typeClass = 'text-amber-800 bg-amber-100 border-amber-300';
              if (log.type === 'CRITICAL') typeClass = 'text-rose-800 bg-rose-100 border-rose-300 font-bold';

              return (
                <div key={log.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] flex items-start gap-2">
                  <span className="text-slate-400 text-[10px] flex-shrink-0 pt-0.5">{log.time}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border flex-shrink-0 ${typeClass}`}>
                    {log.type}
                  </span>
                  <span className="text-slate-700 leading-snug">{log.message}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetectionLogPanel;
