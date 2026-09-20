import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bot,
  LoaderCircle,
  Send,
  Sparkles,
  X,
  Volume2,
  VolumeX,
  Compass,
  Camera,
  Zap,
  Thermometer,
  ShieldAlert,
  Crosshair,
  Activity,
  CheckCircle2,
  Navigation,
  Radio,
  Wifi
} from 'lucide-react';
import { useDrone } from '../../context/DroneContext';

const PRESET_GEO_COORDINATES = {
  'jaipur': { name: 'Jaipur, Rajasthan', lat: 26.9124, lng: 75.7873, zoom: 14 },
  'delhi': { name: 'Delhi NCR', lat: 28.6139, lng: 77.2090, zoom: 13 },
  'new delhi': { name: 'New Delhi', lat: 28.6139, lng: 77.2090, zoom: 14 },
  'mumbai': { name: 'Mumbai, Maharashtra', lat: 19.0760, lng: 72.8777, zoom: 13 },
  'bengaluru': { name: 'Bengaluru, Karnataka', lat: 12.9716, lng: 77.5946, zoom: 13 },
  'bangalore': { name: 'Bengaluru, Karnataka', lat: 12.9716, lng: 77.5946, zoom: 13 },
  'kolkata': { name: 'Kolkata, West Bengal', lat: 22.5726, lng: 88.3639, zoom: 13 },
  'chennai': { name: 'Chennai, Tamil Nadu', lat: 13.0827, lng: 80.2707, zoom: 13 },
  'hyderabad': { name: 'Hyderabad, Telangana', lat: 17.3850, lng: 78.4867, zoom: 13 },
  'pune': { name: 'Pune, Maharashtra', lat: 18.5204, lng: 73.8567, zoom: 13 },
  'ahmedabad': { name: 'Ahmedabad, Gujarat', lat: 23.0225, lng: 72.5714, zoom: 13 },
  'srinagar': { name: 'Srinagar, Jammu & Kashmir', lat: 34.0837, lng: 74.7973, zoom: 13 },
  'kedarnath': { name: 'Kedarnath Alpine Valley', lat: 30.7346, lng: 79.0669, zoom: 14 },
  'leh': { name: 'Leh Ladakh High-Altitude Zone', lat: 34.1526, lng: 77.5771, zoom: 13 },
  'manali': { name: 'Manali Valley, Himachal Pradesh', lat: 32.2396, lng: 77.1887, zoom: 14 },
  'rishikesh': { name: 'Rishikesh River Basin', lat: 30.0869, lng: 78.2676, zoom: 14 },
  'guwahati': { name: 'Guwahati, Brahmaputra Flood Sector', lat: 26.1445, lng: 91.7362, zoom: 13 },
  'kochi': { name: 'Kochi Coastal Zone, Kerala', lat: 9.9312, lng: 76.2673, zoom: 13 },
  'brahmaputra': { name: 'Brahmaputra Flood Basin', lat: 26.1445, lng: 91.7362, zoom: 13 }
};

const QUICK_ACTIONS = [
  { label: 'Lock Survivors', query: 'Report survivor triage and lock targets', icon: Crosshair, color: 'text-amber-400' },
  { label: 'Fly to Delhi', query: 'Fly to Delhi NCR', icon: Navigation, color: 'text-cyan-400' },
  { label: 'Snapshot Recon', query: 'Take recon snapshot and save evidence', icon: Camera, color: 'text-emerald-400' },
  { label: 'Ironbow Thermal', query: 'Switch thermal palette to ironbow', icon: Thermometer, color: 'text-rose-400' },
  { label: 'Battery & Health', query: 'What is drone battery and altitude?', icon: Activity, color: 'text-sky-400' },
  { label: 'Emergency RTH', query: 'Return to home', icon: Zap, color: 'text-yellow-400' },
];

const AeroOrb = ({ isOpen }) => (
  <div className={`relative flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 ${isOpen ? 'shadow-[0_0_25px_rgba(34,211,238,0.7)]' : 'shadow-[0_0_18px_rgba(16,185,129,0.6)]'}`}>
    <span className="absolute inset-[-4px] rounded-full border border-cyan-400/80 animate-[spin_5s_linear_infinite]" />
    <span className="absolute inset-[-8px] rounded-full border border-emerald-400/40 border-l-transparent border-b-transparent animate-[spin_3s_linear_infinite_reverse]" />
    <span className="absolute h-6 w-6 rounded-full bg-gradient-to-tr from-emerald-400 via-cyan-400 to-indigo-500 blur-[2px]" />
    <Bot className="relative z-10 h-5 w-5 text-white" />
  </div>
);

const AICopilot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Aero SAR Tactical Copilot online. Ready for mission directives, live telemetry reporting, FLIR camera controls, and survivor triage.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: ['Check battery and altitude', 'Scan for survivors', 'Switch thermal to Ironbow', 'Take recon snapshot']
    }
  ]);

  const messagesEndRef = useRef(null);

  const {
    telemetry,
    activeSearchArea,
    searchAndFlyTo,
    captureLiveAreaIntel,
    cameraState,
    setThermalPalette,
    setZoom,
    detections,
    activeTargetId,
    dropMedicalPod,
    triggerEmergencySOS,
    setFlightDirective,
    scanWifiNetworks,
    addLog,
    droneConnection
  } = useDrone();

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Voice speech synthesis
  const speakText = useCallback((text) => {
    if (!isVoiceEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      // Remove markdown bullet points and technical brackets for natural speech
      const clean = text.replace(/[*•#_`\[\]()]/g, ' ').replace(/\s+/g, ' ').slice(0, 240);
      const utter = new SpeechSynthesisUtterance(clean);
      utter.rate = 1.05;
      utter.pitch = 0.95;
      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }, [isVoiceEnabled]);

  // Client-side fallback action runner
  const runClientAction = useCallback((action) => {
    if (!action || !action.type) return;
    try {
      switch (action.type) {
        case 'SEARCH_AND_FLY': {
          const { areaName, lat, lng, zoom } = action.params;
          searchAndFlyTo(areaName, lat, lng, zoom || 14);
          addLog('SUCCESS', `AERO COPILOT: Vectoring aircraft to ${areaName} (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          break;
        }
        case 'SET_THERMAL_PALETTE': {
          setThermalPalette(action.params.palette);
          addLog('INFO', `AERO COPILOT: FLIR Thermal palette switched to ${action.params.palette.toUpperCase()}`);
          break;
        }
        case 'SET_ZOOM': {
          setZoom(action.params.zoomLevel);
          addLog('INFO', `AERO COPILOT: Camera zoom set to ${action.params.zoomLevel}X`);
          break;
        }
        case 'CAPTURE_INTEL': {
          captureLiveAreaIntel();
          addLog('SUCCESS', 'AERO COPILOT: High-resolution recon snapshot captured to Vault & Supabase');
          break;
        }
        case 'SET_FLIGHT_MODE': {
          if (setFlightDirective) setFlightDirective(action.params.mode);
          addLog('ALERT', `AERO COPILOT: Flight directive engaged -> ${action.params.mode}`);
          break;
        }
        case 'DEPLOY_PAYLOAD': {
          dropMedicalPod(activeTargetId || detections[0]?.id);
          addLog('CRITICAL', 'AERO COPILOT: Medical trauma kit deployed to survivor target');
          break;
        }
        case 'TRIGGER_SOS': {
          triggerEmergencySOS();
          addLog('CRITICAL', 'AERO COPILOT: Emergency SOS multi-agency dispatch broadcast');
          break;
        }
        case 'SCAN_WIFI': {
          scanWifiNetworks();
          addLog('INFO', 'AERO COPILOT: Scanning local spectrum for active drone Wi-Fi networks');
          break;
        }
        default:
          break;
      }
    } catch (err) {
      console.warn('Failed executing copilot action:', err);
    }
  }, [searchAndFlyTo, setThermalPalette, setZoom, captureLiveAreaIntel, setFlightDirective, dropMedicalPod, triggerEmergencySOS, scanWifiNetworks, addLog, activeTargetId, detections]);

  // Client-side local heuristic fallback if network fails
  const getClientSideAnswer = (content) => {
    const q = content.toLowerCase();

    // 1. Navigation
    const navMatch = q.match(/(?:fly to|search area|search for|go to|head to|navigate to|vector to|relocate to)\s+(.+)/i);
    if (navMatch) {
      const rawTarget = navMatch[1].trim();
      const coordMatch = rawTarget.match(/(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/);
      if (coordMatch) {
        const lat = parseFloat(coordMatch[1]);
        const lng = parseFloat(coordMatch[2]);
        if (!isNaN(lat) && !isNaN(lng)) {
          return {
            answer: `Vectoring aircraft to coordinates ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E. Tactical search grid and ArcGIS satellite feeds are updating to frame the target zone.`,
            action: { type: 'SEARCH_AND_FLY', params: { areaName: `GPS Target (${lat.toFixed(3)}, ${lng.toFixed(3)})`, lat, lng, zoom: 14 }, description: `Vectoring to ${lat.toFixed(4)}, ${lng.toFixed(4)}` },
            suggestions: ['Lock survivors in area', 'Switch thermal to Ironbow', 'Take recon snapshot']
          };
        }
      }
      for (const [key, loc] of Object.entries(PRESET_GEO_COORDINATES)) {
        if (rawTarget.includes(key)) {
          return {
            answer: `Flight vector confirmed for ${loc.name} (${loc.lat.toFixed(4)}°N, ${loc.lng.toFixed(4)}°E). Relocating tactical search grid, waypoint corridors, and optical sweeps now.`,
            action: { type: 'SEARCH_AND_FLY', params: { areaName: loc.name, lat: loc.lat, lng: loc.lng, zoom: loc.zoom }, description: `Vectoring to ${loc.name}` },
            suggestions: ['Scan area with FLIR thermal', 'Capture recon snapshot', 'Check battery & flight envelope']
          };
        }
      }
    }

    if (q.includes('rth') || q.includes('return to home') || q.includes('return home')) {
      return {
        answer: 'Autonomous Return-To-Home (RTH) engaged. Aircraft is ascending to 150m AGL safe obstacle clearance altitude and following the recorded corridor back to launch station.',
        action: { type: 'SET_FLIGHT_MODE', params: { mode: 'RTH' }, description: 'Initiated Autonomous Return-To-Home (RTH)' },
        suggestions: ['Hold position (Loiter)', 'Resume Auto Survey', 'Check battery status']
      };
    }

    if (q.includes('ironbow')) {
      return {
        answer: 'Applied FLIR Ironbow Thermal Palette to Camera 02. High-heat human body signatures (36°C-39°C) are rendered in glowing white-yellow over deep violet terrain.',
        action: { type: 'SET_THERMAL_PALETTE', params: { palette: 'ironbow' }, description: 'Applied FLIR Ironbow Palette' },
        suggestions: ['Zoom in 2x', 'Capture recon snapshot', 'Check detection triage']
      };
    }

    if (q.includes('rainbow')) {
      return {
        answer: 'Switched Camera 02 to High-Contrast Rainbow thermal palette. Optimal for isolating subtle temperature differences across water and flood surfaces.',
        action: { type: 'SET_THERMAL_PALETTE', params: { palette: 'rainbow' }, description: 'Applied FLIR Rainbow Palette' },
        suggestions: ['Switch to Ironbow', 'Reset zoom', 'Capture recon snapshot']
      };
    }

    if (q.includes('white hot') || q.includes('whitehot')) {
      return {
        answer: 'Set Camera 02 to White-Hot thermal palette. Warm bodies appear as bright white silhouettes against cold dark background, ideal for thick forest canopy penetration.',
        action: { type: 'SET_THERMAL_PALETTE', params: { palette: 'whiteHot' }, description: 'Applied FLIR White-Hot Palette' },
        suggestions: ['Switch to Ironbow', 'Zoom camera 3x', 'Save recon frame']
      };
    }

    if (q.includes('recon') || q.includes('snapshot') || q.includes('capture') || q.includes('intel')) {
      return {
        answer: 'High-resolution tactical snapshot captured! Telemetry metadata, GPS coordinates, and active AI target bounding boxes are archived to the RECON VAULT and synchronized with Supabase.',
        action: { type: 'CAPTURE_INTEL', params: {}, description: 'Captured Recon Intel to Vault & Supabase' },
        suggestions: ['Open Recon Vault', 'Deploy medical pod', 'Fly to next waypoint']
      };
    }

    if (q.includes('payload') || q.includes('drop') || q.includes('medical kit')) {
      return {
        answer: 'Medical Trauma Pod deployment sequence armed and dispatched to locked survivor coordinates. Parachute deployed, beacon transmitting on 406 MHz.',
        action: { type: 'DEPLOY_PAYLOAD', params: {}, description: 'Dispatched Emergency Medical Pod' },
        suggestions: ['Trigger Emergency SOS', 'Take recon snapshot', 'Return to Home']
      };
    }

    if (q.includes('battery') || q.includes('power') || q.includes('charge')) {
      const batt = telemetry?.battery || 86;
      return {
        answer: `Aircraft Battery Status: ${batt}% (22.4V 6S LiPo). Estimated flight endurance remaining: ~${Math.round(batt * 0.32)} minutes under current throttle. RTH failsafe threshold is set at 20%.`,
        suggestions: ['Check full diagnostics', 'Fly to safe waypoint', 'Emergency RTH']
      };
    }

    if (q.includes('altitude') || q.includes('height') || q.includes('speed')) {
      return {
        answer: `Flight Telemetry: Altitude is ${telemetry?.altitude || 120}m AGL, Ground Speed is ${telemetry?.speed || 14.2} m/s, Heading is ${telemetry?.heading || 42}° NE. Mode is ${telemetry?.flightMode || 'AUTO_SURVEY'}.`,
        suggestions: ['Hold position (Loiter)', 'Zoom in 2x', 'Capture recon snapshot']
      };
    }

    if (q.includes('survivor') || q.includes('target') || q.includes('detection')) {
      const count = detections?.length || 0;
      return {
        answer: `ACTIVE DETECTION TRIAGE: ${count} survivor(s) detected in sector ${activeSearchArea?.name || ''}. Thermal body temperatures range from 33.4°C to 36.8°C. Medical drop ready.`,
        suggestions: ['Deploy medical supply pod', 'Trigger Emergency SOS', 'Capture recon snapshot']
      };
    }

    return {
      answer: `Acknowledged, Operator. Monitoring aircraft telemetry (${telemetry?.altitude || 120}m AGL, ${telemetry?.battery || 86}% battery, heading ${telemetry?.heading || 42}° over ${activeSearchArea?.name || 'Active Zone'}). You can issue flight commands ("Fly to [City/Coords]", "RTH"), thermal sensor controls ("Ironbow", "Zoom 2x"), or recon captures ("Snapshot").`,
      suggestions: ['Check battery & diagnostics', 'Switch thermal to Ironbow', 'Take recon snapshot', 'Emergency RTH']
    };
  };

  const askAero = async (value = query) => {
    const content = value.trim();
    if (!content || isLoading) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { role: 'user', content, timestamp: time };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setQuery('');
    setIsLoading(true);

    const payloadContext = {
      telemetry: {
        lat: telemetry.lat,
        lng: telemetry.lng,
        altitude: telemetry.altitude,
        speed: telemetry.speed,
        battery: telemetry.battery,
        heading: telemetry.heading,
        flightMode: telemetry.flightMode,
        voltage: 22.4
      },
      activeSearchArea,
      detections: detections.map(d => ({
        id: d.id,
        bodyTemp: d.bodyTemp,
        confidence: d.confidence,
        status: d.status,
        screenX: d.screenX,
        screenY: d.screenY
      })),
      cameraState: {
        cameraMode: cameraState.cameraMode,
        thermalPalette: cameraState.thermalPalette,
        zoomLevel: cameraState.zoomLevel,
        isothermLimit: cameraState.isothermLimit
      },
      droneConnection: {
        isConnected: droneConnection.isConnected,
        connectionType: droneConnection.connectionType,
        connectedWifiSsid: droneConnection.connectedWifiSsid,
        isDroneWifi: droneConnection.isDroneWifi
      }
    };

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map(m => ({ role: m.role, content: m.content })),
          context: payloadContext
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMsg = {
          role: 'assistant',
          content: data.answer || 'Aero acknowledged request.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: data.action,
          suggestions: data.suggestions || ['Check battery status', 'Switch thermal to Ironbow', 'Capture recon snapshot']
        };

        setMessages((current) => [...current, assistantMsg]);

        if (data.action) {
          runClientAction(data.action);
        }

        speakText(assistantMsg.content);
      } else {
        // Fallback to local heuristic engine
        const fallback = getClientSideAnswer(content);
        const assistantMsg = {
          role: 'assistant',
          content: fallback.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: fallback.action,
          suggestions: fallback.suggestions
        };
        setMessages((current) => [...current, assistantMsg]);
        if (fallback.action) runClientAction(fallback.action);
        speakText(assistantMsg.content);
      }
    } catch {
      // Local fallback on network error
      const fallback = getClientSideAnswer(content);
      const assistantMsg = {
        role: 'assistant',
        content: fallback.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: fallback.action,
        suggestions: fallback.suggestions
      };
      setMessages((current) => [...current, assistantMsg]);
      if (fallback.action) runClientAction(fallback.action);
      speakText(assistantMsg.content);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <aside className="fixed bottom-4 right-4 z-40 flex w-[min(460px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-cyan-400/50 bg-slate-950/95 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl transition-all duration-300">
          {/* Header Bar */}
          <div className="relative overflow-hidden border-b border-cyan-500/20 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/80 px-4 py-3 text-white">
            <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-cyan-400/20 blur-2xl" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AeroOrb isOpen />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-chakra text-lg font-bold tracking-wider text-cyan-100">AERO</span>
                    <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 font-mono-code text-[9px] font-semibold tracking-wider text-cyan-300 border border-cyan-400/30">
                      AUTONOMOUS COPILOT
                    </span>
                  </div>
                  <div className="font-mono-code text-[9px] tracking-wider text-slate-400">
                    SEARCH & RESCUE MISSION INTEL
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsVoiceEnabled(v => !v)}
                  title={isVoiceEnabled ? 'Mute Aero Voice' : 'Enable Tactical Voice Readout'}
                  className={`rounded-lg p-1.5 transition-colors ${isVoiceEnabled ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
                >
                  {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close Aero"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Live Telemetry Status Strip */}
            <div className="mt-2.5 flex items-center justify-between border-t border-cyan-500/20 pt-2 font-mono-code text-[10px] text-slate-300">
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>ALT: <span className="font-bold text-white">{telemetry?.altitude || 120}m</span></span>
              </div>
              <div>BATT: <span className={`font-bold ${(telemetry?.battery || 86) < 25 ? 'text-red-400' : 'text-emerald-400'}`}>{telemetry?.battery || 86}%</span></div>
              <div>TARGETS: <span className="font-bold text-amber-300">{detections?.length || 0}</span></div>
              <div className="flex items-center gap-1">
                <Radio className="h-3 w-3 text-cyan-400" />
                <span className="text-cyan-300 uppercase">{telemetry?.flightMode || 'AUTO'}</span>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div className="max-h-[min(480px,58vh)] space-y-3 overflow-y-auto bg-slate-900/60 p-3.5 scrollbar-thin scrollbar-thumb-slate-700">
            {/* Quick Action Chips */}
            <div className="space-y-1.5 pb-1">
              <div className="flex items-center gap-1 font-mono-code text-[9px] font-semibold tracking-wider text-slate-400 uppercase">
                <Sparkles className="h-3 w-3 text-cyan-400" /> Direct Tactical Directives:
              </div>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      onClick={() => askAero(action.query)}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-700/70 bg-slate-800/80 px-2.5 py-1.5 text-left font-mono-code text-[10px] text-slate-200 transition-all hover:border-cyan-400 hover:bg-slate-700 hover:text-white"
                    >
                      <Icon className={`h-3.5 w-3.5 shrink-0 ${action.color}`} />
                      <span className="truncate">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conversation Stream */}
            {messages.map((message, index) => {
              const isUser = message.role === 'user';
              return (
                <div key={`${message.role}-${index}`} className="space-y-1.5">
                  <div
                    className={`rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      isUser
                        ? 'ml-8 bg-cyan-950/80 text-cyan-50 border border-cyan-500/30'
                        : 'border border-slate-700/80 bg-slate-950/90 text-slate-200 shadow-md'
                    }`}
                  >
                    {!isUser && (
                      <div className="mb-1.5 flex items-center justify-between border-b border-slate-800 pb-1 font-mono-code text-[9px] text-slate-400">
                        <div className="flex items-center gap-1 font-bold text-cyan-400">
                          <Sparkles className="h-3 w-3" /> AERO MISSION COPILOT
                        </div>
                        <span>{message.timestamp}</span>
                      </div>
                    )}

                    <div className="whitespace-pre-line">{message.content}</div>

                    {/* Action Executed Badge */}
                    {message.action && (
                      <div className="mt-2 flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-950/40 px-2 py-1 font-mono-code text-[10px] font-medium text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>ACTION EXECUTED: {message.action.description}</span>
                      </div>
                    )}
                  </div>

                  {/* Suggestion Chips under latest assistant message */}
                  {!isUser && index === messages.length - 1 && message.suggestions && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {message.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => askAero(sug)}
                          disabled={isLoading}
                          className="rounded-full border border-slate-700/60 bg-slate-800/60 px-2.5 py-0.5 font-mono-code text-[9px] text-slate-300 hover:border-cyan-400 hover:bg-slate-700 hover:text-cyan-200"
                        >
                          → {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-slate-950/60 px-3 py-2 text-xs font-mono-code text-cyan-300">
                <LoaderCircle className="h-4 w-4 animate-spin text-cyan-400" />
                <span>Aero evaluating tactical directive...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Command Input Form */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              askAero();
            }}
            className="flex items-center gap-2 border-t border-slate-800 bg-slate-950 p-3"
          >
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ask telemetry, 'Fly to Delhi', 'Ironbow', 'Snapshot'..."
              aria-label="Ask Aero mission assistant"
              className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2 font-mono-code text-xs text-white placeholder-slate-500 outline-none transition-all focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
            <button
              type="submit"
              title="Send directive to Aero"
              disabled={isLoading || !query.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500 text-slate-950 shadow-md transition-all hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </aside>
      )}

      {/* Floating Tactical Orb Button */}
      <button
        onClick={() => setIsOpen((open) => !open)}
        title="Open Aero mission assistant"
        className="fixed bottom-4 right-4 z-30 flex items-center gap-3 rounded-full border border-cyan-400/80 bg-slate-950 py-1.5 pl-1.5 pr-4 text-white shadow-xl shadow-slate-900/50 transition-all hover:scale-105 hover:border-cyan-300"
      >
        <AeroOrb isOpen={isOpen} />
        <div className="text-left">
          <div className="font-chakra text-sm font-bold tracking-wider text-cyan-100">AERO</div>
          <div className="font-mono-code text-[8px] font-semibold text-emerald-400">AI COPILOT ACTIVE</div>
        </div>
      </button>
    </>
  );
};

export default AICopilot;
