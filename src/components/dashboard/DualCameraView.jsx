import React, { useState } from 'react';
import { useDrone } from '../../context/DroneContext';
import CameraCanvasRGB from './CameraCanvasRGB';
import CameraCanvasThermal from './CameraCanvasThermal';
import { 
  Split, 
  Eye, 
  Flame, 
  ZoomIn, 
  Lightbulb, 
  Scan, 
  Maximize2, 
  Sparkles,
  Video,
  Camera
} from 'lucide-react';

const DualCameraView = () => {
  const { 
    cameraState, 
    setCameraMode, 
    setThermalPalette, 
    setZoom, 
    toggleSpotlight, 
    toggleDehaze, 
    toggleBoundingBoxes,
    droneConnection,
    captureLiveAreaIntel,
    activeSearchArea
  } = useDrone();

  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm ${isFullscreen ? 'fixed inset-4 z-50 bg-slate-100 p-2 shadow-2xl' : 'h-full'}`}>
      {/* Top Camera Toolbar in Light Theme */}
      <div className="bg-white border-b border-slate-200 px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 font-mono-code text-xs">
        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setCameraMode('sideBySide')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
              cameraState.viewMode === 'sideBySide'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>DUAL VIEW</span>
          </button>

          <button
            onClick={() => setCameraMode('optical')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
              cameraState.viewMode === 'optical'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>4K OPTICAL</span>
          </button>

          <button
            onClick={() => setCameraMode('thermal')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
              cameraState.viewMode === 'thermal'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>FLIR THERMAL</span>
          </button>

        </div>

        {/* Live Physical Camera Device Badge if active */}
        {droneConnection.useRealCamera && (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-green-100 text-green-800 border border-green-300 text-[10px] font-bold">
            <Video className="w-3 h-3 text-green-700 animate-pulse" />
            <span>LIVE HARDWARE CAM HOOKED</span>
          </div>
        )}

        {/* Thermal Palette Controls (when thermal or sideBySide or msx active) */}
        {cameraState.viewMode !== 'optical' && (
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-500 text-[10px] hidden sm:inline">PALETTE:</span>
            <div className="flex bg-slate-100 p-0.5 rounded border border-slate-200">
              {[
                { id: 'ironbow', label: 'IRONBOW' },
                { id: 'whiteHot', label: 'W-HOT' },
                { id: 'rainbow', label: 'RAINBOW' },
              ].map(pal => (
                <button
                  key={pal.id}
                  onClick={() => setThermalPalette(pal.id)}
                  className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold transition-all ${
                    cameraState.thermalPalette === pal.id
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {pal.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Zoom & Gimbal Enhancements */}
        <div className="flex items-center gap-2">
          {/* Zoom Level */}
          <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded border border-slate-200 text-[11px]">
            <ZoomIn className="w-3.5 h-3.5 text-green-700" />
            {[1, 2, 4, 8].map(z => (
              <button
                key={z}
                onClick={() => setZoom(z)}
                className={`px-1.5 py-0.5 rounded font-bold ${
                  cameraState.zoomLevel === z
                    ? 'bg-green-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {z}x
              </button>
            ))}
          </div>

          {/* Spotlight toggle */}
          <button
            onClick={toggleSpotlight}
            title="Toggle Gimbal SAR High-Lumen Spotlight"
            className={`p-1.5 rounded border transition-colors ${
              cameraState.spotlightOn
                ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-sm'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
          </button>

          {/* AI Bounding Box Toggle */}
          <button
            onClick={toggleBoundingBoxes}
            title="Toggle AI Object Detection Bounding Boxes"
            className={`p-1.5 rounded border transition-colors ${
              cameraState.aiBoundingBoxes
                ? 'bg-green-100 text-green-800 border-green-300 font-bold'
                : 'bg-slate-100 border-slate-200 text-slate-400 line-through'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
          </button>

          {/* De-haze toggle */}
          <button
            onClick={toggleDehaze}
            title="Toggle Atmospheric De-haze Filter"
            className={`p-1.5 rounded border transition-colors ${
              cameraState.dehazeOn
                ? 'bg-green-100 text-green-800 border-green-300'
                : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>

          {/* Snapshot Camera Feed to Recon Vault */}
          <button
            onClick={() => captureLiveAreaIntel(`Live Camera Feed [${activeSearchArea.name}]`)}
            title="Snapshot live optical/thermal feed to Recon Vault"
            className="p-1.5 rounded bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100 transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Expand */}
          <button
            onClick={toggleFullscreen}
            title="Expand Viewport"
            className="p-1.5 rounded bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Video Screen Container */}
      <div className="flex-1 relative min-h-[380px] lg:min-h-[460px] p-2 bg-slate-900 flex flex-col justify-center">
        {/* 1. SIDE BY SIDE MODE */}
        {cameraState.viewMode === 'sideBySide' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-full">
            <div className="relative h-full flex flex-col">
              <CameraCanvasRGB />
            </div>
            <div className="relative h-full flex flex-col">
              <CameraCanvasThermal />
            </div>
          </div>
        )}

        {/* 2. OPTICAL ONLY */}
        {cameraState.viewMode === 'optical' && (
          <div className="relative w-full h-full">
            <CameraCanvasRGB />
          </div>
        )}

        {/* 3. THERMAL ONLY */}
        {cameraState.viewMode === 'thermal' && (
          <div className="relative w-full h-full">
            <CameraCanvasThermal />
          </div>
        )}

      </div>
    </div>
  );
};

export default DualCameraView;
