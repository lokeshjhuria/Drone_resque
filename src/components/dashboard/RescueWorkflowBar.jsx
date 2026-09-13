import React from 'react';
import { useDrone } from '../../context/DroneContext';
import { 
  Compass, 
  Scan, 
  Cpu, 
  Package, 
  Radio, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

const RescueWorkflowBar = () => {
  const { workflowStage, setWorkflowStage } = useDrone();

  const stages = [
    {
      num: 1,
      name: 'Takeoff & Navigation',
      icon: Compass,
      desc: 'GPS route planning & FCU stabilization',
      detail: 'Waypoint grid loaded, RTK Fix ±1.8cm, Pixhawk IMU active.'
    },
    {
      num: 2,
      name: 'Scanning & Detection',
      icon: Scan,
      desc: 'Ultrasonic + Camera + Thermal + Env Sensors',
      detail: 'Dual 4K/FLIR feeds scanning terrain, obstacle sonar active.'
    },
    {
      num: 3,
      name: 'Analysis & Decision',
      icon: Cpu,
      desc: 'Onboard AI processes hazards & distress',
      detail: 'YOLO-SAR detecting humans, FLIR isotherm classifying body temp.'
    },
    {
      num: 4,
      name: 'Rescue Operation',
      icon: Package,
      desc: 'Drop first-aid kit & guide ground team',
      detail: 'Payload bay armed, acoustic siren & emergency convoy dispatched.'
    },
    {
      num: 5,
      name: 'Live Monitoring & Alert',
      icon: Radio,
      desc: 'Stream live to Ground Station & Hospital',
      detail: 'Telecomm module streaming telemetry, hospital & blood bank informed.'
    },
  ];

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm font-mono-code text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold font-chakra text-sm">
          <ShieldCheck className="w-4 h-4 text-green-700" />
          <span>SAR SYSTEM WORKFLOW PIPELINE (SEARCH • DETECT • RESCUE • SAVE LIVES)</span>
        </div>
        <span className="text-[11px] text-green-700 font-bold">
          CURRENT PHASE: {workflowStage} OF 5
        </span>
      </div>

      {/* Interactive 5-Stage Stepper */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {stages.map((stage) => {
          const Icon = stage.icon;
          const isCurrent = workflowStage === stage.num;
          const isCompleted = workflowStage > stage.num;

          return (
            <button
              key={stage.num}
              type="button"
              onClick={() => setWorkflowStage(stage.num)}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                isCurrent
                  ? 'bg-green-50 border-green-600 shadow-sm ring-1 ring-green-600'
                  : isCompleted
                    ? 'bg-slate-50 border-green-300 text-slate-700'
                    : 'bg-slate-50/50 border-slate-200 text-slate-400 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCurrent 
                      ? 'bg-green-600 text-white' 
                      : isCompleted 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-slate-200 text-slate-500'
                  }`}>
                    {isCompleted ? '✓' : stage.num}
                  </span>
                  <span className={`font-bold font-chakra text-xs ${isCurrent ? 'text-green-900' : 'text-slate-800'}`}>
                    {stage.name}
                  </span>
                </div>
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-green-700' : 'text-slate-400'}`} />
              </div>

              <div className="text-[10px] text-slate-600 font-semibold mb-1">
                {stage.desc}
              </div>
              <div className="text-[9px] text-slate-500 leading-tight">
                {stage.detail}
              </div>

              {isCurrent && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-600 animate-pulse"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RescueWorkflowBar;
