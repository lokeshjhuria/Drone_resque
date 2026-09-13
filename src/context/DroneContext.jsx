import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { soundFX } from '../utils/audioAlerts';
import { generateAerialReconSnapshot } from '../utils/areaCapture';
import { api } from '../utils/api';

const DroneContext = createContext(null);

export const DroneProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('aerosar_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // 5-Stage Mission Workflow based on User Project Architecture
  const [workflowStage, setWorkflowStage] = useState(2); // 1: Takeoff, 2: Scanning & Detection, 3: Analysis & Decision, 4: Rescue Operation, 5: Live Monitoring

  // Ultrasonic Obstacle Detection Sensor
  const [ultrasonic, setUltrasonic] = useState({
    distanceMeters: 3.6,
    safeThreshold: 1.5,
    status: 'CLEAR', // 'CLEAR', 'CAUTION', 'OBSTACLE_ALERT'
    frontDistance: 3.6,
    downwardDistance: 4.2,
    health: 'OPTIMAL (HC-SR04 / US-100 Dual Sonar)',
  });

  // Environmental Sensor Suite (Temp, Humidity, Pressure, Air Quality)
  const [environmental, setEnvironmental] = useState({
    ambientTemp: 23.8, // °C (BME280 / SGP30)
    humidity: 46, // %
    pressure: 1013.2, // hPa
    aqi: 24, // AQI Air Quality Index
    airQualityStatus: 'CLEAN / SAFE (NO TOXIC HAZARDS)',
    gasDetected: false,
    health: 'ONLINE (I2C Sensor Bus OK)'
  });

  // Full Drone Hardware & Telemetry Link details
  const [droneConnection, setDroneConnection] = useState({
    isConnected: true,
    connectionType: 'MAVLINK_UDP',
    protocolVersion: 'MAVLink v2.0 Microhard Secure',
    droneIp: '192.168.1.120',
    port: '14550',
    baudRate: '115200',
    rtspRgbUrl: 'rtsp://192.168.1.120:8554/live/rgb',
    rtspThermalUrl: 'rtsp://192.168.1.120:8554/live/thermal',
    linkQuality: 99,
    latency: 12,
    packetsReceived: 21840,
    packetLoss: '0.0%',
    heartbeat: true,
    useRealCamera: false,
    selectedVideoDeviceId: '',
    flightController: 'Pixhawk 6X Pro Dual IMU',
    radioModule: 'Telemetry Comm Module 2.4GHz (15km Range)',
    rssi: -46,
    snr: 29,
    escTelemetry: 'All 6 ESCs OK (52°C Avg)',
  });

  const [liveMediaStream, setLiveMediaStream] = useState(null);
  const [availableVideoDevices, setAvailableVideoDevices] = useState([]);

  // Comprehensive Telemetry
  const [telemetry, setTelemetry] = useState({
    droneModel: 'AERO-FALCON-01 [Dual Optical 4K + FLIR Boson]',
    firmware: 'v4.2.1-PX4-SAR',
    status: 'HARDWARE LINKED - DUAL CAMERA STREAM OK',
    battery: 88,
    voltage: 24.8,
    cellVoltage: '4.13V / cell (6S LiPo)',
    currentDraw: 17.6,
    altitude: 46.2,
    altitudeMsl: 412.8,
    climbRate: 0.1,
    speed: 13.2,
    heading: 42,
    lat: 34.0537,
    lng: -118.2427,
    satellites: 22,
    rtkAccuracy: '±1.8 cm (RTK Fixed)',
    signalStrength: 99,
    flightMode: 'AUTO_SAR_GRID',
    gimbalPitch: -42,
    gimbalRoll: 0.4,
    gimbalYaw: 42.0,
    windSpeed: 3.1,
    imuTemp: 31.8,
    missionTime: 1820,
  });

  // Automated Multi-Agency Emergency SOS State
  const [sosState, setSosState] = useState({
    isActive: false,
    dispatchTime: null,
    targetId: 'SAR-TRG-01',
    rescueTeam: {
      callSign: 'SAR ALPHA-4 GROUND',
      vehicle: 'All-Terrain Paramedic 4x4',
      etaMinutes: 7,
      status: 'DISPATCHED & ENROUTE WITH ADVANCED TRAUMA KIT',
      crew: 'Capt. Miller, Paramedic Diaz (EMT-P)'
    },
    hospital: {
      name: 'St. Jude Emergency Trauma Center [Level-1]',
      contactNumber: 'TRAUMA HOTLINE: +1 (800) 555-9111',
      distance: '2.4 km (NE)',
      icuStatus: 'ICU BED & CRITICAL TRAUMA TEAM ON STANDBY',
      vitalsTransmitted: 'Core Temp 33.8°C (Hypothermia Warning), Pulse 78 bpm, SPO2 94%'
    },
    bloodBank: {
      facility: 'Regional Central Blood Bank & Plasma Depot',
      requisitionId: 'BB-TRAUMA-7892',
      unitsReserved: '4 Units O-Negative (Universal Donor) + 2 Units Frozen Plasma',
      courierStatus: 'EMERGENCY COURIER ENROUTE TO LZ',
      contact: 'EMERGENCY DISPATCH: EXT 402'
    },
    airAmbulance: {
      callSign: 'LIFEFLIGHT-02 (MEDEVAC)',
      status: 'SCRAMBLED - AIRBORNE',
      etaMinutes: 5,
      landingZone: 'LZ Bravo (34.0542N, 118.2415W) Marked via Drone Spotlight'
    },
    logs: []
  });

  // Camera Systems
  const [cameraState, setCameraState] = useState({
    viewMode: 'sideBySide',
    thermalPalette: 'ironbow',
    zoomLevel: 1,
    spotlightOn: false,
    dehazeOn: true,
    isothermLimit: 34.5,
    gridOverlay: true,
    aiBoundingBoxes: true,
  });

  // AI Person Detections
  const [detections, setDetections] = useState([
    {
      id: 'SAR-TRG-01',
      name: 'Survivor #1 (Adult Male)',
      type: 'HUMAN_DETECTED',
      confidence: 97.4,
      bodyTemp: 36.8,
      heatIntensity: 'HIGH (VITAL SIGN NORMAL)',
      lat: 34.0542,
      lng: -118.2415,
      distance: 38,
      status: 'AWAITING_TRIAGE',
      time: '19:28:10',
      elevation: 412,
      screenX: 48,
      screenY: 42,
      notes: 'Signaling with hand gestures. Visible in both Optical and FLIR thermal channel.'
    },
    {
      id: 'SAR-TRG-02',
      name: 'Survivor #2 (Cold Exposure)',
      type: 'HUMAN_DETECTED',
      confidence: 91.2,
      bodyTemp: 33.8,
      heatIntensity: 'MODERATE-LOW (HYPOTHERMIA RISK)',
      lat: 34.0558,
      lng: -118.2441,
      distance: 124,
      status: 'AWAITING_TRIAGE',
      time: '19:26:45',
      elevation: 405,
      screenX: 74,
      screenY: 65,
      notes: 'Lying in ravine foliage. Hard to spot on standard RGB; FLIR heat signature prominent.'
    }
  ]);

  const [activeTargetId, setActiveTargetId] = useState('SAR-TRG-01');

  // Active Searched Area
  const [activeSearchArea, setActiveSearchArea] = useState({
    name: 'Downtown Metro SAR Sector Bravo',
    lat: 34.0537,
    lng: -118.2427,
    zoom: 16,
    category: 'URBAN'
  });

  // Captured Recon Intel Archive
  const [capturedIntel, setCapturedIntel] = useState(() => {
    try {
      const saved = localStorage.getItem('aerosar_captured_intel');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Payloads
  const [payloads, setPayloads] = useState({
    medicalPods: 2,
    beaconActive: false,
    strobeActive: false,
    isDroppingPod: false,
  });

  // Event Logs
  const [missionLogs, setMissionLogs] = useState([
    { id: 1, time: '19:25:00', type: 'INFO', message: 'Takeoff verified: GPS RTK locked (22 Sats), ultrasonic sensors active.' },
    { id: 2, time: '19:26:45', type: 'ALERT', message: 'FLIR radiometric isotherm triggered: Survivor #2 (33.8°C body temp - Hypothermia alert).' },
    { id: 3, time: '19:28:10', type: 'CRITICAL', message: 'Dual Vision target confirmed: Survivor #1 locked at 34.0542N, -118.2415W (97.4% Conf).' },
  ]);

  const addLog = useCallback((type, message) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setMissionLogs(prev => [{ id: Date.now(), time, type, message }, ...prev.slice(0, 49)]);
  }, []);

  const toggleAudio = () => {
    const next = !isAudioMuted;
    setIsAudioMuted(next);
    soundFX.setMuted(next);
    if (!next) {
      soundFX.playClick();
    }
  };

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('aerosar_user', JSON.stringify(userData));
    soundFX.playClick();
    addLog('INFO', `Pilot ${userData.callSign} authenticated. Drone link: ${droneConnection.connectionType} ${droneConnection.droneIp}:${droneConnection.port}`);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aerosar_user');
    soundFX.playClick();
  };

  // Enumerate real cameras
  const refreshVideoDevices = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        setAvailableVideoDevices(videoInputs);
        if (videoInputs.length > 0 && !droneConnection.selectedVideoDeviceId) {
          setDroneConnection(prev => ({ ...prev, selectedVideoDeviceId: videoInputs[0].deviceId }));
        }
      } catch (err) {
        console.warn('Could not enumerate video devices:', err);
      }
    }
  }, [droneConnection.selectedVideoDeviceId]);

  useEffect(() => {
    refreshVideoDevices();
  }, [refreshVideoDevices]);

  // Connect Drone Bridge
  const connectDroneBridge = (config) => {
    soundFX.playClick();
    setDroneConnection(prev => ({
      ...prev,
      ...config,
      isConnected: true,
      packetsReceived: prev.packetsReceived + 1,
      latency: Math.floor(10 + Math.random() * 5),
      linkQuality: 99
    }));
    addLog('INFO', `Drone hardware link connected: ${config.connectionType} at ${config.droneIp}:${config.port}`);
  };

  const disconnectDroneBridge = () => {
    soundFX.playClick();
    setDroneConnection(prev => ({
      ...prev,
      isConnected: false,
      linkQuality: 0,
      heartbeat: false,
    }));
    addLog('ALERT', 'Drone hardware telemetry connection disconnected.');
  };

  const startRealCamera = async (deviceId) => {
    try {
      if (liveMediaStream) {
        liveMediaStream.getTracks().forEach(t => t.stop());
      }
      const constraints = deviceId ? { video: { deviceId: { exact: deviceId } } } : { video: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLiveMediaStream(stream);
      setDroneConnection(prev => ({ ...prev, useRealCamera: true, selectedVideoDeviceId: deviceId }));
      addLog('INFO', 'Live drone video receiver feed hooked up to CAM-01.');
      return true;
    } catch (err) {
      addLog('ALERT', `Failed to access physical camera: ${err.message}`);
      return false;
    }
  };

  const stopRealCamera = () => {
    if (liveMediaStream) {
      liveMediaStream.getTracks().forEach(t => t.stop());
      setLiveMediaStream(null);
    }
    setDroneConnection(prev => ({ ...prev, useRealCamera: false }));
    addLog('INFO', 'Switched back to internal high-precision SAR simulation feed.');
  };

  // SEARCH AREA & RELOCATE DRONE
  const searchAndFlyTo = (areaName, lat, lng, zoom = 16, category = 'CUSTOM') => {
    soundFX.playClick();
    setActiveSearchArea({ name: areaName, lat, lng, zoom, category });

    setTelemetry(prev => ({
      ...prev,
      lat,
      lng,
      status: `DEPLOYED TO SECTOR: ${areaName.toUpperCase()}`
    }));

    // Generate simulated survivor target in the newly searched sector
    const newTargetId = `SAR-TRG-${Math.floor(10 + Math.random() * 89)}`;
    const newSurvivor = {
      id: newTargetId,
      name: `Survivor at ${areaName.slice(0, 22)}`,
      type: 'HUMAN_DETECTED',
      confidence: +(94.5 + Math.random() * 4.5).toFixed(1),
      bodyTemp: +(36.2 + Math.random() * 1.1).toFixed(1),
      heatIntensity: 'HIGH (VITAL SIGN DETECTED)',
      lat: +(lat + 0.0008).toFixed(4),
      lng: +(lng + 0.0012).toFixed(4),
      distance: 42,
      status: 'AWAITING_TRIAGE',
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      elevation: 410,
      screenX: 52,
      screenY: 46,
      notes: `Thermal lock acquired at ${areaName}. Dual 4K and FLIR streams active.`
    };

    setDetections(prev => [newSurvivor, ...prev.slice(0, 2)]);
    setActiveTargetId(newTargetId);
    addLog('ALERT', `SEARCH SECTOR ACQUIRED: Drone deployed to ${areaName} (${lat.toFixed(4)}N, ${lng.toFixed(4)}W). Commencing aerial surveillance.`);
  };

  // CAPTURE LIVE AERIAL RECON INTEL SNAPSHOT
  const captureLiveAreaIntel = async (areaNameOverride = null) => {
    soundFX.playClick();
    const targetArea = areaNameOverride || activeSearchArea.name;
    const targetLat = telemetry.lat;
    const targetLng = telemetry.lng;

    try {
      const snapshot = await generateAerialReconSnapshot({
        areaName: targetArea,
        lat: targetLat,
        lng: targetLng,
        zoom: activeSearchArea.zoom || 16,
        altitude: telemetry.altitude,
        heading: telemetry.heading,
        droneModel: telemetry.droneModel,
        callSign: user?.callSign || 'COMMANDER-VANCE',
        environmental,
      });

      setCapturedIntel(prev => {
        const updated = [snapshot, ...prev];
        try {
          localStorage.setItem('aerosar_captured_intel', JSON.stringify(updated.slice(0, 25)));
        } catch (e) {
          console.warn('Storage quota limit:', e);
        }
        return updated;
      });

      // Synchronize with backend storage
      api.saveRecon(snapshot).catch(e => console.warn('Backend recon sync failed:', e));

      addLog('INFO', `📸 AERIAL INTEL CAPTURED: Live snapshot of ${targetArea} archived in Recon Vault & Backend.`);
      return snapshot;
    } catch (err) {
      console.error('Failed to capture area intel:', err);
      addLog('ALERT', 'Failed to generate aerial reconnaissance snapshot.');
      return null;
    }
  };

  const deleteCapturedIntel = (id) => {
    soundFX.playClick();
    setCapturedIntel(prev => {
      const updated = prev.filter(img => img.id !== id);
      try {
        localStorage.setItem('aerosar_captured_intel', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage error:', e);
      }
      return updated;
    });

    api.deleteRecon(id).catch(e => console.warn('Backend recon delete error:', e));
    addLog('INFO', `Archived recon snapshot deleted from local cache and backend.`);
  };

  const clearAllCapturedIntel = () => {
    soundFX.playClick();
    setCapturedIntel([]);
    try {
      localStorage.removeItem('aerosar_captured_intel');
    } catch (e) {
      console.warn('Storage error:', e);
    }
    addLog('INFO', 'All archived recon snapshots cleared.');
  };

  // AUTOMATED MULTI-AGENCY SOS EMERGENCY DISPATCH
  const triggerEmergencySOS = (targetIdOverride) => {
    const targetId = targetIdOverride || activeTargetId || 'SAR-TRG-01';
    const target = detections.find(d => d.id === targetId) || detections[0];

    soundFX.playSOSAlert();
    setWorkflowStage(4); // Advance workflow to Stage 4: Rescue Operation

    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const newLogs = [
      `[${timestamp}] 🚨 MULTI-AGENCY SOS TRIGGERED FOR ${target?.name} AT ${target?.lat}N, ${target?.lng}W`,
      `[${timestamp}] 🚑 RESCUE TEAM ALPHA-4 DISPATCHED (ETA: 7 MINS)`,
      `[${timestamp}] 🏥 METRO LEVEL-1 TRAUMA HOSPITAL ALERTED & ICU BED RESERVED`,
      `[${timestamp}] 🩸 REGIONAL BLOOD BANK: 4 UNITS O-NEGATIVE & PLASMA ALLOCATED`,
      `[${timestamp}] 🚁 LIFEFLIGHT-02 MEDEVAC SCRAMBLED - AIRBORNE TOWARDS LZ`,
    ];

    setSosState(prev => ({
      ...prev,
      isActive: true,
      dispatchTime: timestamp,
      targetId: target?.id,
      logs: newLogs,
    }));

    setDetections(prev => prev.map(d => d.id === target?.id ? { ...d, status: 'RESCUE_ENROUTE' } : d));
    addLog('CRITICAL', `EMERGENCY SOS INITIATED: Rescue Team Alpha, Trauma Hospital, Blood Bank & Air Medevac all dispatched to target ${target?.id}!`);
  };

  const cancelEmergencySOS = () => {
    soundFX.playClick();
    setSosState(prev => ({
      ...prev,
      isActive: false
    }));
    addLog('ALERT', 'Emergency SOS status stood down by Command.');
  };

  // Sensor & Telemetry simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Ultrasonic fluctuation
      setUltrasonic(prev => {
        const delta = (Math.random() - 0.5) * 0.15;
        const newDist = Math.max(1.1, +(prev.frontDistance + delta).toFixed(2));
        const status = newDist < 1.5 ? 'OBSTACLE_ALERT' : newDist < 2.5 ? 'CAUTION' : 'CLEAR';
        return {
          ...prev,
          frontDistance: newDist,
          status,
        };
      });

      // Environmental fluctuation
      setEnvironmental(prev => {
        const tempDelta = (Math.random() - 0.5) * 0.1;
        const humDelta = (Math.random() - 0.5) * 0.2;
        const pressDelta = (Math.random() - 0.5) * 0.1;
        return {
          ...prev,
          ambientTemp: +(prev.ambientTemp + tempDelta).toFixed(1),
          humidity: Math.round(prev.humidity + humDelta),
          pressure: +(prev.pressure + pressDelta).toFixed(1),
        };
      });

      // Drone Telemetry
      setTelemetry(prev => {
        if (!droneConnection.isConnected) return prev;
        const altDelta = (Math.random() - 0.5) * 0.2;
        const speedDelta = (Math.random() - 0.5) * 0.3;
        const headingDelta = (Math.random() - 0.48) * 0.5;
        const currentDelta = (Math.random() - 0.5) * 0.4;
        const batteryDrain = prev.missionTime % 60 === 0 ? 0.2 : 0;

        return {
          ...prev,
          missionTime: prev.missionTime + 1,
          altitude: Math.max(20, +(prev.altitude + altDelta).toFixed(1)),
          speed: Math.max(5, +(prev.speed + speedDelta).toFixed(1)),
          heading: Math.round((prev.heading + headingDelta + 360) % 360),
          currentDraw: +(17.6 + currentDelta).toFixed(1),
          battery: Math.max(10, +(prev.battery - batteryDrain).toFixed(1)),
        };
      });

      if (droneConnection.isConnected) {
        setDroneConnection(prev => ({
          ...prev,
          packetsReceived: prev.packetsReceived + 5,
          latency: Math.floor(10 + Math.random() * 5),
        }));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [droneConnection.isConnected]);

  const setCameraMode = (viewMode) => {
    soundFX.playClick();
    setCameraState(prev => ({ ...prev, viewMode }));
    addLog('INFO', `Viewport switched to: ${viewMode.toUpperCase()}`);
  };

  const setThermalPalette = (thermalPalette) => {
    soundFX.playClick();
    setCameraState(prev => ({ ...prev, thermalPalette }));
    addLog('INFO', `FLIR Thermal palette set to: ${thermalPalette.toUpperCase()}`);
  };

  const setZoom = (zoomLevel) => {
    soundFX.playClick();
    setCameraState(prev => ({ ...prev, zoomLevel }));
  };

  const toggleSpotlight = () => {
    soundFX.playClick();
    setCameraState(prev => {
      const next = !prev.spotlightOn;
      addLog('INFO', `Gimbal 8000-Lumen SAR Spotlight: ${next ? 'ACTIVATED' : 'DEACTIVATED'}`);
      return { ...prev, spotlightOn: next };
    });
  };

  const toggleDehaze = () => {
    soundFX.playClick();
    setCameraState(prev => ({ ...prev, dehazeOn: !prev.dehazeOn }));
  };

  const toggleBoundingBoxes = () => {
    soundFX.playClick();
    setCameraState(prev => ({ ...prev, aiBoundingBoxes: !prev.aiBoundingBoxes }));
  };

  const lockTarget = (targetId) => {
    soundFX.playClick();
    setActiveTargetId(targetId);
    const target = detections.find(d => d.id === targetId);
    if (target) {
      addLog('ALERT', `Camera Gimbal & Tracking Autolocked onto ${target.id} (${target.name})`);
    }
  };

  const setFlightDirective = (mode) => {
    soundFX.playClick();
    setTelemetry(prev => ({ ...prev, flightMode: mode }));
    addLog('ALERT', `Flight directive dispatched: ${mode}`);
  };

  const dropMedicalPod = (targetId) => {
    if (payloads.medicalPods <= 0 || payloads.isDroppingPod) return;
    
    setPayloads(prev => ({ ...prev, isDroppingPod: true }));
    soundFX.playClick();
    addLog('CRITICAL', `ARMING FIRST-AID POD RELEASE SEQUENCE FOR ${targetId}...`);

    setTimeout(() => {
      soundFX.playPayloadRelease();
      setPayloads(prev => ({
        ...prev,
        medicalPods: prev.medicalPods - 1,
        isDroppingPod: false
      }));

      setDetections(prev => prev.map(d => d.id === targetId ? { ...d, status: 'MEDICAL_DROPPED' } : d));
      addLog('CRITICAL', `PAYLOAD RELEASE CONFIRMED: First-Aid & Hypothermia Kit deployed over ${targetId}. Parachute deployed.`);
    }, 2200);
  };

  const deployBeacon = () => {
    soundFX.playBeaconAlert();
    setPayloads(prev => {
      const next = !prev.beaconActive;
      addLog('ALERT', `Acoustic 120dB SAR Siren & RF Transponder: ${next ? 'ONLINE' : 'STANDBY'}`);
      return { ...prev, beaconActive: next };
    });
  };

  const dispatchRescueTeam = (targetId) => {
    soundFX.playClick();
    setDetections(prev => prev.map(d => d.id === targetId ? { ...d, status: 'RESCUE_ENROUTE' } : d));
    const target = detections.find(d => d.id === targetId);
    addLog('CRITICAL', `Ground SAR Team Alpha dispatched to GPS (${target?.lat}, ${target?.lng}). ETA: 14 mins.`);
  };

  const markRescued = (targetId) => {
    soundFX.playClick();
    setDetections(prev => prev.map(d => d.id === targetId ? { ...d, status: 'RESCUED' } : d));
    addLog('INFO', `Target ${targetId} triage status updated: RESCUED.`);
  };

  const triggerNewDetection = () => {
    soundFX.playDetectionAlert();
    const newId = `SAR-TRG-0${detections.length + 1}`;
    const newTarget = {
      id: newId,
      name: `Survivor #${detections.length + 1} (Foliage Heat Signature)`,
      type: 'HUMAN_DETECTED',
      confidence: +(88 + Math.random() * 10).toFixed(1),
      bodyTemp: +(35.5 + Math.random() * 2.0).toFixed(1),
      heatIntensity: 'ELEVATED HEAT SIGNATURE',
      lat: +(34.053 + Math.random() * 0.005).toFixed(4),
      lng: +(-118.245 + Math.random() * 0.006).toFixed(4),
      distance: Math.round(45 + Math.random() * 100),
      status: 'AWAITING_TRIAGE',
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      elevation: 418,
      screenX: Math.round(25 + Math.random() * 50),
      screenY: Math.round(30 + Math.random() * 40),
      notes: 'New heat source detected via continuous FLIR IR sweep.'
    };
    setDetections(prev => [newTarget, ...prev]);
    setActiveTargetId(newId);
    addLog('CRITICAL', `NEW TARGET IDENTIFIED: ${newId} with ${newTarget.bodyTemp}°C thermal signature.`);
  };

  return (
    <DroneContext.Provider
      value={{
        user,
        login,
        logout,
        droneConnection,
        connectDroneBridge,
        disconnectDroneBridge,
        availableVideoDevices,
        refreshVideoDevices,
        startRealCamera,
        stopRealCamera,
        liveMediaStream,
        telemetry,
        activeSearchArea,
        searchAndFlyTo,
        capturedIntel,
        captureLiveAreaIntel,
        deleteCapturedIntel,
        clearAllCapturedIntel,
        ultrasonic,
        environmental,
        workflowStage,
        setWorkflowStage,
        sosState,
        triggerEmergencySOS,
        cancelEmergencySOS,
        cameraState,
        setCameraMode,
        setThermalPalette,
        setZoom,
        toggleSpotlight,
        toggleDehaze,
        toggleBoundingBoxes,
        detections,
        activeTargetId,
        lockTarget,
        payloads,
        dropMedicalPod,
        deployBeacon,
        dispatchRescueTeam,
        markRescued,
        triggerNewDetection,
        setFlightDirective,
        missionLogs,
        addLog,
        isAudioMuted,
        toggleAudio,
      }}
    >
      {children}
    </DroneContext.Provider>
  );
};

export const useDrone = () => {
  const context = useContext(DroneContext);
  if (!context) {
    throw new Error('useDrone must be used within a DroneProvider');
  }
  return context;
};
