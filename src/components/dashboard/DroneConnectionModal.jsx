import React, { useState, useEffect } from 'react';
import { useDrone } from '../../context/DroneContext';
import { api } from '../../utils/api';
import { soundFX } from '../../utils/audioAlerts';
import { 
  Radio, 
  Wifi, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  RefreshCw, 
  Video, 
  Activity,
  Signal,
  Lock,
  Unlock,
  Eye,
  Camera,
  Play,
  Check,
  ShieldCheck,
  ExternalLink,
  Laptop
} from 'lucide-react';

const PRESET_DRONE_STREAMS = [
  {
    id: 'tello',
    name: 'Ryze Tello (DJI/Intel)',
    category: 'MINI_SAR',
    defaultSsidPrefix: 'TELLO-',
    streamUrl: 'http://192.168.10.1:8080',
    type: 'MJPEG',
    desc: '720p HD Video over Wi-Fi (IP: 192.168.10.1:8080)'
  },
  {
    id: 'esp32',
    name: 'ESP32-CAM Micro-SAR',
    category: 'MICRO_UAV',
    defaultSsidPrefix: 'ESP32',
    streamUrl: 'http://192.168.4.1/stream',
    type: 'MJPEG',
    desc: 'OV2640 Tactical MJPEG Stream (IP: 192.168.4.1/stream)'
  },
  {
    id: 'dji',
    name: 'DJI Aerial (Phantom/Mavic)',
    category: 'TACTICAL',
    defaultSsidPrefix: 'DJI-',
    streamUrl: 'http://192.168.1.1:8080/video',
    type: 'MJPEG',
    desc: 'DJI Go/Wi-Fi Live Video Stream (IP: 192.168.1.1)'
  },
  {
    id: 'holystone',
    name: 'Holy Stone FPV GPS',
    category: 'FPV_EXPLORER',
    defaultSsidPrefix: 'HolyStone',
    streamUrl: 'http://192.168.0.1:8080/video',
    type: 'MJPEG',
    desc: '1080p/4K FPV Live Video (IP: 192.168.0.1:8080)'
  },
  {
    id: 'custom',
    name: 'Custom Wi-Fi IP Camera',
    category: 'CUSTOM',
    defaultSsidPrefix: '',
    streamUrl: 'http://192.168.1.100:8080/stream',
    type: 'MJPEG',
    desc: 'RTSP/MJPEG HTTP Stream over local Wi-Fi'
  }
];

const DroneConnectionModal = ({ isOpen, onClose }) => {
  const { 
    droneConnection, 
    connectDroneBridge, 
    disconnectDroneBridge, 
    availableVideoDevices, 
    refreshVideoDevices,
    startRealCamera,
    stopRealCamera,
    wifiNetworks,
    activeWifi,
    isScanningWifi,
    scanWifiNetworks,
    connectWifiNetwork,
    startDroneWifiCamera,
    stopDroneWifiCamera
  } = useDrone();

  const [activeTab, setActiveTab] = useState('DRONE_WIFI');
  const [selectedWifiSsid, setSelectedWifiSsid] = useState(droneConnection.connectedWifiSsid || '');
  const [wifiPassword, setWifiPassword] = useState('');
  const [connectingSsid, setConnectingSsid] = useState(null);
  const [connectMessage, setConnectMessage] = useState(null);
  
  // Drone camera stream config
  const [cameraStreamUrl, setCameraStreamUrl] = useState(
    droneConnection.cameraStreamUrl || 'http://192.168.4.1/stream'
  );
  const [cameraStreamType, setCameraStreamType] = useState(
    droneConnection.cameraStreamType || 'MJPEG'
  );
  const [selectedDevice, setSelectedDevice] = useState(droneConnection.selectedVideoDeviceId);
  const [isPinging, setIsPinging] = useState(false);
  const [pingStatus, setPingStatus] = useState(null);
  const [previewActive, setPreviewActive] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  // MAVLink / Legacy configs
  const [ip, setIp] = useState(droneConnection.droneIp || '192.168.4.1');
  const [port, setPort] = useState(droneConnection.port || '80');

  useEffect(() => {
    if (isOpen) {
      scanWifiNetworks();
      if (activeWifi?.connectedSsid) {
        setSelectedWifiSsid(activeWifi.connectedSsid);
      }
    }
  }, [isOpen, scanWifiNetworks, activeWifi?.connectedSsid]);

  if (!isOpen) return null;

  // Select a detected Wi-Fi network
  const handleSelectNetwork = (net) => {
    soundFX.playClick();
    setSelectedWifiSsid(net.ssid);
    setConnectMessage(null);

    // If this network is a known drone, auto-fill its camera URL
    if (net.isDrone && net.droneInfo) {
      if (net.droneInfo.defaultStream) {
        setCameraStreamUrl(net.droneInfo.defaultStream);
      }
      if (net.droneInfo.defaultIp) {
        setIp(net.droneInfo.defaultIp);
      }
    }
  };

  // Connect to the selected Wi-Fi network via backend Windows netsh bridge
  const handleConnectWifi = async (ssidToConnect) => {
    const targetSsid = ssidToConnect || selectedWifiSsid;
    if (!targetSsid) return;

    setConnectingSsid(targetSsid);
    setConnectMessage(null);

    try {
      const res = await connectWifiNetwork(targetSsid, wifiPassword);
      if (res.success) {
        setConnectMessage({
          type: 'SUCCESS',
          text: `Connected to Wi-Fi: ${targetSsid}. Radio handshake verified.`
        });
        setSelectedWifiSsid(targetSsid);
        setWifiPassword('');
      } else {
        setConnectMessage({
          type: 'ERROR',
          text: res.message || res.error || `Failed to connect to ${targetSsid}. Check password or signal.`
        });
      }
    } catch (err) {
      setConnectMessage({
        type: 'ERROR',
        text: `Connection error: ${err.message}`
      });
    } finally {
      setConnectingSsid(null);
    }
  };

  // Apply a preset drone camera model
  const handleSelectDronePreset = (preset) => {
    soundFX.playClick();
    setCameraStreamUrl(preset.streamUrl);
    setCameraStreamType(preset.type);
    setPreviewError(false);
  };

  // Test Ping the drone camera IP
  const handlePingCamera = async () => {
    setIsPinging(true);
    setPingStatus(null);
    soundFX.playClick();

    try {
      const res = await api.wifi.pingCamera(cameraStreamUrl);
      setIsPinging(false);
      if (res.success) {
        setPingStatus({
          success: true,
          message: `Camera responding! Latency: ${res.latencyMs}ms (HTTP ${res.status})`
        });
        setPreviewActive(true);
        setPreviewError(false);
      } else {
        setPingStatus({
          success: false,
          message: res.message || 'Camera did not respond on this IP. Check Wi-Fi connection.'
        });
      }
    } catch (err) {
      setIsPinging(false);
      setPingStatus({
        success: false,
        message: `Network ping error: ${err.message}`
      });
    }
  };

  // Connect Real Drone Camera & Stream to Cockpit
  const handleLinkRealDroneCamera = () => {
    soundFX.playClick();

    if (activeTab === 'DRONE_WIFI') {
      startDroneWifiCamera(cameraStreamUrl, cameraStreamType, selectedWifiSsid);
    } else if (activeTab === 'USB_CAPTURE') {
      if (selectedDevice) {
        startRealCamera(selectedDevice);
      }
    } else {
      connectDroneBridge({
        connectionType: activeTab,
        droneIp: ip,
        port,
        selectedVideoDeviceId: selectedDevice
      });
    }

    onClose();
  };

  // Disconnect Drone
  const handleDisconnectDrone = () => {
    soundFX.playClick();
    disconnectDroneBridge();
    stopRealCamera();
    stopDroneWifiCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm font-mono-code">
      <div className="relative w-full max-w-3xl bg-white border border-slate-300 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-700">
            <Radio className="w-5 h-5 text-emerald-600 animate-pulse" />
            <div>
              <h2 className="font-chakra text-lg font-bold tracking-wider text-slate-900 leading-tight">
                REAL DRONE WI-FI LINK & CAMERA COMMAND
              </h2>
              <p className="text-[10px] text-slate-500 font-mono-code">
                Connect physical drone cameras via 2.4/5.8GHz Wi-Fi, RTSP, or UVC Capture Cards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Protocol Switcher */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 py-2 flex items-center gap-2 overflow-x-auto text-xs">
          {[
            { id: 'DRONE_WIFI', label: 'WI-FI DRONE SCANNER & CAM', icon: Wifi, badge: 'RECOMMENDED' },
            { id: 'USB_CAPTURE', label: 'USB/HDMI RECEIVER', icon: Video },
            { id: 'MAVLINK_UDP', label: 'MAVLINK TELEMETRY', icon: Radio },
            { id: 'SIMULATOR', label: 'SAR SIMULATOR', icon: Cpu },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                  active
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] px-1 py-0.2 rounded font-mono-code font-bold ${
                    active ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700 bg-white">
          
          {/* Active Link Status Strip */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className={`w-3.5 h-3.5 rounded-full ${droneConnection.isConnected ? 'bg-emerald-600 animate-pulse' : 'bg-rose-500'}`}></div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">HARDWARE LINK STATUS</div>
                <div className="font-bold text-sm text-emerald-700 font-chakra">
                  {droneConnection.isConnected 
                    ? `CONNECTED TO: ${droneConnection.connectedWifiSsid || droneConnection.connectionType}` 
                    : 'DISCONNECTED (SEARCHING FOR DRONE)'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-600">
              <div>PROTOCOL: <span className="font-bold text-slate-900">{droneConnection.connectionType}</span></div>
              <div>PING: <span className="text-emerald-700 font-bold">{droneConnection.latency} ms</span></div>
              <div>VIDEO: <span className="text-slate-900 font-bold">{droneConnection.useRealCamera ? 'REAL FEED ACTIVE' : 'SIMULATED'}</span></div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: DRONE WI-FI SCANNER & REAL CAMERA (PRIMARY) */}
          {/* ========================================================================= */}
          {activeTab === 'DRONE_WIFI' && (
            <div className="space-y-4">
              
              {/* 1. Wi-Fi Scanner Bar */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-900 font-chakra uppercase tracking-wide">
                      AVAILABLE WI-FI NETWORKS & DRONE HOTSPOTS ({wifiNetworks.length})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={scanWifiNetworks}
                    disabled={isScanningWifi}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-300 hover:border-emerald-500 text-slate-700 hover:text-emerald-700 font-bold text-xs transition-colors shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isScanningWifi ? 'animate-spin text-emerald-600' : ''}`} />
                    <span>{isScanningWifi ? 'SCANNING RADIOS...' : 'RE-SCAN WI-FI'}</span>
                  </button>
                </div>

                {/* Host Wi-Fi Radio Info */}
                {activeWifi && (
                  <div className="text-[11px] text-slate-600 mb-3 flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                    <Laptop className="w-3.5 h-3.5 text-slate-500" />
                    <span>Active Wireless NIC: <strong className="text-slate-900">Wi-Fi (802.11ax/ac/n)</strong></span>
                    <span className="text-slate-400">•</span>
                    <span>Currently Connected: <strong className="text-emerald-700">{activeWifi.connectedSsid || 'None'}</strong></span>
                    {activeWifi.signal > 0 && <span className="text-slate-500">({activeWifi.signal}% Signal)</span>}
                  </div>
                )}

                {/* Available Networks List */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {wifiNetworks.map((net, idx) => {
                    const isSelected = selectedWifiSsid === net.ssid;
                    const isCurrent = activeWifi?.connectedSsid === net.ssid;

                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectNetwork(net)}
                        className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-emerald-50/80 border-emerald-500 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {/* Signal Bars Visual */}
                          <div className="flex items-end gap-0.5 h-4 w-4 flex-shrink-0" title={`Signal: ${net.signal}%`}>
                            <div className={`w-1 rounded-xs ${net.signal >= 20 ? 'bg-emerald-600' : 'bg-slate-300'} h-1.5`}></div>
                            <div className={`w-1 rounded-xs ${net.signal >= 45 ? 'bg-emerald-600' : 'bg-slate-300'} h-2.5`}></div>
                            <div className={`w-1 rounded-xs ${net.signal >= 70 ? 'bg-emerald-600' : 'bg-slate-300'} h-3.5`}></div>
                            <div className={`w-1 rounded-xs ${net.signal >= 85 ? 'bg-emerald-600' : 'bg-slate-300'} h-4`}></div>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 truncate">
                                {net.ssid}
                              </span>
                              
                              {/* Drone Detected Badge */}
                              {net.isDrone && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-bold animate-pulse flex items-center gap-1 flex-shrink-0">
                                  <span>🚁</span>
                                  <span>DRONE DETECTED ({net.droneInfo?.brand?.split(' ')[0] || 'UAV'})</span>
                                </span>
                              )}

                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-bold flex-shrink-0">
                                  ACTIVE CONNECTION
                                </span>
                              )}
                            </div>

                            <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>{net.band || '2.4 GHz'}</span>
                              <span>•</span>
                              <span>{net.auth || 'WPA2'}</span>
                              <span>•</span>
                              <span>Signal: {net.signal}%</span>
                              {net.channel > 0 && <span>• CH {net.channel}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                          {isCurrent ? (
                            <button
                              type="button"
                              onClick={() => handleSelectNetwork(net)}
                              className="px-2.5 py-1 rounded bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>LINKED</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleConnectWifi(net.ssid)}
                              disabled={connectingSsid === net.ssid}
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-emerald-600 text-slate-700 hover:text-white border border-slate-300 hover:border-emerald-600 text-[11px] font-bold transition-colors flex items-center gap-1"
                            >
                              {connectingSsid === net.ssid ? (
                                <>
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                  <span>CONNECTING...</span>
                                </>
                              ) : (
                                <>
                                  <Wifi className="w-3 h-3" />
                                  <span>CONNECT</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Password input if selected Wi-Fi is secured and not yet connected */}
                {selectedWifiSsid && selectedWifiSsid !== activeWifi?.connectedSsid && (
                  <div className="mt-3 p-3 rounded-lg bg-white border border-slate-200 flex flex-wrap items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] text-slate-700 font-bold whitespace-nowrap">
                      Password for "{selectedWifiSsid}":
                    </span>
                    <input
                      type="password"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      placeholder="Enter Wi-Fi Password (leave empty if open drone network)..."
                      className="flex-1 min-w-[180px] bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() => handleConnectWifi(selectedWifiSsid)}
                      disabled={connectingSsid === selectedWifiSsid}
                      className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      {connectingSsid === selectedWifiSsid ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Wifi className="w-3 h-3" />}
                      <span>CONNECT RADIO</span>
                    </button>
                  </div>
                )}

                {/* Status Messages */}
                {connectMessage && (
                  <div className={`mt-2 p-2 rounded-lg text-[11px] font-bold flex items-center gap-1.5 ${
                    connectMessage.type === 'SUCCESS' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}>
                    {connectMessage.type === 'SUCCESS' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    <span>{connectMessage.text}</span>
                  </div>
                )}
              </div>

              {/* 2. Drone Camera Stream Configuration & Presets */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 font-chakra uppercase tracking-wide flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    REAL DRONE CAMERA STREAM ENDPOINT
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Target: <strong className="text-emerald-700">{selectedWifiSsid || 'Active Wi-Fi Link'}</strong>
                  </span>
                </div>

                {/* Quick Model Presets */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                  <span className="text-slate-500 font-bold whitespace-nowrap text-[10px]">PRESETS:</span>
                  {PRESET_DRONE_STREAMS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectDronePreset(preset)}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                        cameraStreamUrl === preset.streamUrl
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>

                {/* Stream URL Input & Ping Checker */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-8">
                    <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                      DRONE VIDEO STREAM URL (MJPEG / HTTP / RTSP)
                    </label>
                    <input
                      type="text"
                      value={cameraStreamUrl}
                      onChange={(e) => { setCameraStreamUrl(e.target.value); setPreviewError(false); }}
                      placeholder="e.g. http://192.168.4.1/stream or http://192.168.10.1:8080"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono-code focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="sm:col-span-4 flex items-end gap-2">
                    <button
                      type="button"
                      onClick={handlePingCamera}
                      disabled={isPinging || !cameraStreamUrl}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      {isPinging ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" /> : <Activity className="w-3.5 h-3.5 text-emerald-600" />}
                      <span>TEST PING CAM</span>
                    </button>
                  </div>
                </div>

                {/* Ping Result Notification */}
                {pingStatus && (
                  <div className={`p-2 rounded-lg text-[11px] font-bold flex items-center gap-1.5 ${
                    pingStatus.success ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    {pingStatus.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    <span>{pingStatus.message}</span>
                  </div>
                )}

                {/* Live Embedded Video Preview Window */}
                <div className="mt-2 border border-slate-300 rounded-lg p-2.5 bg-slate-900 text-white">
                  <div className="flex items-center justify-between text-[11px] mb-2 font-mono-code">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="font-bold tracking-wider">LIVE REAL DRONE CAMERA MONITOR</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      RESOLUTION: 1280×720 • 30 FPS
                    </span>
                  </div>

                  <div className="relative w-full h-44 bg-black rounded overflow-hidden flex items-center justify-center">
                    {/* Live Image Stream */}
                    {cameraStreamUrl && !previewError ? (
                      <img
                        src={api.wifi.getStreamProxyUrl(cameraStreamUrl)}
                        alt="Drone Live Stream"
                        crossOrigin="anonymous"
                        onError={() => setPreviewError(true)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Camera className="w-8 h-8 text-slate-600 mx-auto mb-2 animate-pulse" />
                        <div className="text-xs text-slate-400 font-bold">DRONE CAMERA STANDBY</div>
                        <p className="text-[10px] text-slate-500 max-w-sm mx-auto mt-1">
                          Connect to your drone's Wi-Fi network (e.g. <strong>TELLO-XXXX</strong>, <strong>ESP32-CAM</strong>, <strong>DJI-XXXX</strong>) and click <strong>APPLY & STREAM TO DASHBOARD</strong> below.
                        </p>
                      </div>
                    )}

                    {/* HUD Reticle Overlay */}
                    <div className="absolute inset-0 pointer-events-none border border-emerald-500/20 p-2 flex flex-col justify-between">
                      <div className="flex justify-between text-[9px] font-mono-code text-emerald-400">
                        <span>REC ● 00:14:28</span>
                        <span>BAT: 88% (24.8V)</span>
                      </div>
                      <div className="self-center border border-emerald-500/50 w-8 h-8 rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      </div>
                      <div className="flex justify-between text-[9px] font-mono-code text-emerald-400">
                        <span>CAM-01 [OPTICAL 4K]</span>
                        <span>RADIO: 802.11 WI-FI</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PHYSICAL USB / HDMI RECEIVER */}
          {/* ========================================================================= */}
          {activeTab === 'USB_CAPTURE' && (
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-300 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 flex items-center gap-2">
                  <Video className="w-4 h-4 text-emerald-700" />
                  PHYSICAL 5.8GHZ FPV RECEIVER / HDMI-TO-USB CAPTURE CARD
                </span>
                <button
                  type="button"
                  onClick={refreshVideoDevices}
                  className="flex items-center gap-1 text-[10px] text-emerald-700 hover:text-emerald-800 font-bold"
                >
                  <RefreshCw className="w-3 h-3" /> REFRESH CAMERAS
                </button>
              </div>
              <p className="text-[11px] text-slate-600">
                Plug your drone's 5.8GHz analog receiver (Eachine/Skydroid) or HDMI capture card directly into your PC's USB port to stream live zero-latency video.
              </p>
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
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

          {/* ========================================================================= */}
          {/* TAB 3: MAVLINK TELEMETRY UDP */}
          {/* ========================================================================= */}
          {activeTab === 'MAVLINK_UDP' && (
            <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-900 font-chakra">
                MAVLINK UDP TELEMETRY BRIDGE (PX4 / ARDUPILOT)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                    AUTOPILOT IP ADDRESS
                  </label>
                  <input
                    type="text"
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                    placeholder="192.168.1.120"
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                    MAVLINK UDP PORT
                  </label>
                  <input
                    type="text"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder="14550"
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: SAR SIMULATOR */}
          {/* ========================================================================= */}
          {activeTab === 'SIMULATOR' && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <Cpu className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="font-bold text-slate-900 font-chakra text-sm">
                SYNTHETIC TACTICAL SAR SIMULATION
              </div>
              <p className="text-[11px] text-slate-600 max-w-md mx-auto">
                Operates without physical drone hardware. Generates procedural dual 4K/thermal optical feeds, ultrasonic avoidance data, and synthetic SAR survivor signatures.
              </p>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between">
          <button
            onClick={handleDisconnectDrone}
            className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors"
          >
            DISCONNECT DRONE
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              CANCEL
            </button>

            <button
              onClick={handleLinkRealDroneCamera}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 font-chakra tracking-wider flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>APPLY & STREAM TO DASHBOARD</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DroneConnectionModal;
