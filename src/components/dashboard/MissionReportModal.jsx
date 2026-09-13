import React from 'react';
import { useDrone } from '../../context/DroneContext';
import { 
  FileText, 
  Download, 
  Printer, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  Radio,
  Clock
} from 'lucide-react';

const MissionReportModal = ({ isOpen, onClose }) => {
  const { user, telemetry, detections, missionLogs, payloads, droneConnection } = useDrone();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const reportData = {
      missionId: 'AEROSAR-OPS-2026-B',
      timestamp: new Date().toISOString(),
      pilot: user?.callSign || 'COMMANDER-VANCE',
      clearance: user?.clearance || 'LEVEL-3',
      droneUnit: telemetry.droneModel,
      hardwareLink: droneConnection,
      telemetrySnapshot: telemetry,
      detections,
      payloadStatus: payloads,
      logs: missionLogs
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AEROSAR_Mission_Report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-mono-code">
      <div className="relative w-full max-w-3xl bg-white border border-slate-300 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-700">
            <FileText className="w-5 h-5 text-green-700" />
            <h2 className="font-chakra text-lg font-bold tracking-wider text-slate-900">
              SAR MISSION INCIDENT & TELEMETRY REPORT
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 bg-white">
          {/* Mission Meta Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <div className="text-[10px] text-slate-500 font-bold">OPERATION ID</div>
              <div className="text-green-700 font-bold text-sm">AEROSAR-OPS-B</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold">COMMANDER</div>
              <div className="text-slate-900 font-bold">{user?.callSign || 'VANCE-ALPHA-1'}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold">HARDWARE LINK</div>
              <div className="text-slate-900 font-semibold truncate">{droneConnection.connectionType}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold">TOTAL FLIGHT TIME</div>
              <div className="text-green-700 font-bold">{Math.floor(telemetry.missionTime / 60)} min {telemetry.missionTime % 60} sec</div>
            </div>
          </div>

          {/* Detections Summary Table */}
          <div>
            <h3 className="text-sm font-chakra font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-green-700" />
              CONFIRMED SURVIVOR IDENTIFICATIONS ({detections.length})
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-[11px] text-slate-700 font-bold">
                    <th className="p-2.5">TARGET</th>
                    <th className="p-2.5">CONFIDENCE</th>
                    <th className="p-2.5">FLIR BODY TEMP</th>
                    <th className="p-2.5">GPS COORDINATES</th>
                    <th className="p-2.5">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {detections.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">{d.id} ({d.name.split(' ')[0]})</td>
                      <td className="p-2.5 text-green-700 font-bold">{d.confidence}%</td>
                      <td className="p-2.5">
                        <span className={d.bodyTemp < 35 ? 'text-amber-700 font-bold' : 'text-rose-700 font-bold'}>
                          {d.bodyTemp}°C
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-600">{d.lat.toFixed(4)}N, {Math.abs(d.lng).toFixed(4)}W</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-green-100 text-green-800 border border-green-300 font-bold">
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payload Deployments & Avionics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-amber-800 mb-2">PAYLOAD BAY TELEMETRY</h4>
              <ul className="space-y-1 text-slate-600 text-[11px]">
                <li>• Medical Emergency Pods Left: <span className="text-slate-900 font-bold">{payloads.medicalPods} / 2</span></li>
                <li>• Acoustic Siren Transponder: <span className="text-slate-900 font-bold">{payloads.beaconActive ? 'ACTIVE (120dB)' : 'STANDBY'}</span></li>
                <li>• High-Lumen Spotlight: <span className="text-slate-900 font-bold">OPERATIONAL</span></li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-green-800 mb-2">FLIGHT STATS & AVIONICS</h4>
              <ul className="space-y-1 text-slate-600 text-[11px]">
                <li>• Battery State of Charge: <span className="text-slate-900 font-bold">{telemetry.battery}% ({telemetry.voltage}V)</span></li>
                <li>• Search Altitude (AGL): <span className="text-slate-900 font-bold">{telemetry.altitude} meters</span></li>
                <li>• Ground Speed: <span className="text-slate-900 font-bold">{telemetry.speed} m/s ({(telemetry.speed * 3.6).toFixed(0)} km/h)</span></li>
              </ul>
            </div>
          </div>

          {/* Chronological Mission Log Extract */}
          <div>
            <h4 className="text-xs font-chakra font-bold text-slate-700 uppercase tracking-wider mb-2">
              RECENT EVENT AUDIT LOG
            </h4>
            <div className="space-y-1.5 max-h-36 overflow-y-auto p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px]">
              {missionLogs.map((l) => (
                <div key={l.id} className="flex items-center gap-2">
                  <span className="text-slate-400">{l.time}</span>
                  <span className="text-green-700 font-bold">[{l.type}]</span>
                  <span className="text-slate-700 truncate">{l.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors"
          >
            CLOSE
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PRINT REPORT</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionReportModal;
