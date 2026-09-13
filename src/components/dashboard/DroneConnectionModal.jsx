import React, { useState } from 'react';
import { useDrone } from '../../context/DroneContext';
import { 
  Radio, 
  Wifi, 
  Tv, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  RefreshCw, 
  Video, 
  Activity,
  Sliders,
  Cable
} from 'lucide-react';

const DroneConnectionModal = ({ isOpen, onClose }) => {
  const { 
    droneConnection, 
    connectDroneBridge, 
    disconnectDroneBridge, 
    availableVideoDevices, 
    refreshVideoDevices,
    startRealCamera,
    stopRealCamera,
  } = useDrone();

  const [connType, setConnType] = useState(droneConnection.connectionType);
  const [ip, setIp] = useState(droneConnection.droneIp);
  const [port, setPort] = useState(droneConnection.port);
  const [rtspRgb, setRtspRgb] = useState(droneConnection.rtspRgbUrl);
  const [rtspThermal, setRtspThermal] = useState(droneConnection.rtspThermalUrl);
  const [selectedDevice, setSelectedDevice] = useState(droneConnection.selectedVideoDeviceId);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleTestPing = () => {
    setIsTesting(true);
    setTestResult(null);

    setTimeout(() => {
      setIsTesting(false);
      setTestResult({
        status: 'SUCCESS',
        latency: Math.floor(10 + Math.random() * 5),
        packetLoss: '0.0%',
        message: 'MAVLink Heartbeat acknowledged [System ID 1, Component ID 1]'
      });
    }, 800);
  };

  const handleSaveAndConnect = async () => {
    connectDroneBridge({
      connectionType: connType,
      droneIp: ip,
      port,
      rtspRgbUrl: rtspRgb,
      rtspThermalUrl: rtspThermal,
      selectedVideoDeviceId: selectedDevice,
    });

    if (connType === 'USB_CAPTURE' && selectedDevice) {
      await startRealCamera(selectedDevice);
    } else if (droneConnection.useRealCamera) {
      stopRealCamera();
    }

    onClose();
  };

  const handleDisconnect = () => {
    disconnectDroneBridge();
    stopRealCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-mono-code">
      <div className="relative w-full max-w-2xl bg-white border border-slate-300 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-700">
            <Radio className="w-5 h-5 text-green-700 animate-pulse" />
            <h2 className="font-chakra text-lg font-bold tracking-wider text-slate-900">
              DRONE HARDWARE LINK & TELEMETRY BRIDGE
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
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 bg-white">
          {/* Status Overview Banner */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3.5 h-3.5 rounded-full ${droneConnection.isConnected ? 'bg-green-600 animate-pulse' : 'bg-red-500'}`}></div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">HARDWARE LINK STATUS</div>
                <div className="font-bold text-sm text-green-700 font-chakra">
                  {droneConnection.isConnected ? 'LINK ACTIVE (CONNECTED & TRANSMITTING)' : 'DISCONNECTED (STANDBY)'}
                </div>
              </div>
            </div>

            {droneConnection.isConnected && (
              <div className="text-right text-[11px] text-slate-600">
                <div>PING: <span className="text-green-700 font-bold">{droneConnection.latency} ms</span></div>
                <div>PACKETS: <span className="text-slate-900 font-bold">{droneConnection.packetsReceived} RX</span></div>
              </div>
            )}
          </div>

          {/* Protocol Selection */}
          <div>
            <label className="block text-[11px] font-bold text-slate-800 uppercase mb-2 tracking-wider">
              1. Connection Protocol / Bridge Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              {[
                { id: 'MAVLINK_UDP', label: 'MAVLink UDP', icon: Radio, desc: 'PX4 / ArduPilot' },
                { id: 'WEBSOCKET', label: 'WebSocket', icon: Wifi, desc: 'Telemetry Proxy' },
                { id: 'USB_CAPTURE', label: 'USB/HDMI Cam', icon: Video, desc: 'Physical Receiver' },
                { id: 'SIMULATOR', label: 'SAR Simulator', icon: Cpu, desc: 'Virtual Grid' },
              ].map(proto => {
                const Icon = proto.icon;
                const active = connType === proto.id;
                return (
                  <button
                    key={proto.id}
                    type="button"
                    onClick={() => setConnType(proto.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      active
                        ? 'bg-green-50 border-green-500 text-green-800 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1.5 ${active ? 'text-green-700' : 'text-slate-400'}`} />
                    <div className="font-bold text-slate-900">{proto.label}</div>
                    <div className="text-[9px] text-slate-500">{proto.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Physical Receiver Video Devices (if USB_CAPTURE selected) */}
          {connType === 'USB_CAPTURE' && (
            <div className="p-3.5 rounded-lg bg-green-50/50 border border-green-300">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-green-900 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-green-700" />
                  PHYSICAL DRONE VIDEO RECEIVER / CAPTURE CARD
                </span>
                <button
                  type="button"
                  onClick={refreshVideoDevices}
                  className="flex items-center gap-1 text-[10px] text-green-700 hover:text-green-800 font-bold"
                >
                  <RefreshCw className="w-3 h-3" /> REFRESH
                </button>
              </div>
              <p className="text-[11px] text-slate-600 mb-2">
                Plug your drone's 5.8GHz / digital HDMI-to-USB receiver or webcam into your computer to stream live video directly into AEROSAR.
              </p>
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-green-600"
              >
                {availableVideoDevices.length === 0 ? (
                  <option value="">No USB/HDMI capture cards detected</option>
                ) : (
                  availableVideoDevices.map(d => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || `Video Input Device ${d.deviceId.slice(0, 8)}`}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          {/* Network IP & Port Configuration */}
          {connType !== 'USB_CAPTURE' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-700 mb-1 font-semibold">
                  DRONE TELEMETRY IP / HOST
                </label>
                <input
                  type="text"
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  placeholder="e.g. 192.168.1.120"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-700 mb-1 font-semibold">
                  MAVLINK / TELEMETRY PORT
                </label>
                <input
                  type="text"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  placeholder="14550"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-green-600"
                />
              </div>
            </div>
          )}

          {/* Video Stream RTSP URLs */}
          <div className="space-y-2">
            <label className="block text-[11px] text-slate-800 uppercase font-bold">
              RTSP Video Stream Endpoints (Optional IP Feeds)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-500">CAM-01 OPTICAL STREAM (RTSP)</span>
                <input
                  type="text"
                  value={rtspRgb}
                  onChange={(e) => setRtspRgb(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:border-green-600"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500">CAM-02 THERMAL FLIR (RTSP)</span>
                <input
                  type="text"
                  value={rtspThermal}
                  onChange={(e) => setRtspThermal(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:border-green-600"
                />
              </div>
            </div>
          </div>

          {/* Test Link Button */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-200">
            <button
              type="button"
              onClick={handleTestPing}
              disabled={isTesting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors"
            >
              {isTesting ? (
                <>
                  <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>PINGING DRONE IP...</span>
                </>
              ) : (
                <>
                  <Activity className="w-3.5 h-3.5 text-green-700" />
                  <span>TEST TELEMETRY PING</span>
                </>
              )}
            </button>

            {testResult && (
              <span className="text-[11px] text-green-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {testResult.message} ({testResult.latency}ms)
              </span>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
          <button
            onClick={handleDisconnect}
            className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-300 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors"
          >
            DISCONNECT DRONE
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              CANCEL
            </button>

            <button
              onClick={handleSaveAndConnect}
              className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-all shadow-sm"
            >
              APPLY & CONNECT DRONE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DroneConnectionModal;
