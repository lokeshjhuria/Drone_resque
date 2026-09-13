import React, { useState } from 'react';
import { useDrone } from '../../context/DroneContext';
import { 
  Camera, 
  Download, 
  Trash2, 
  X, 
  ExternalLink, 
  Crosshair, 
  Navigation, 
  Clock, 
  ShieldCheck, 
  Layers,
  MapPin,
  CheckCircle2
} from 'lucide-react';

const ReconVaultModal = ({ isOpen, onClose }) => {
  const { capturedIntel, deleteCapturedIntel, clearAllCapturedIntel, activeSearchArea } = useDrone();
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  if (!isOpen) return null;

  const currentImage = (capturedIntel && capturedIntel.find(img => img.id === selectedImageId)) 
    || (capturedIntel && capturedIntel[0]) 
    || null;

  const handleDownload = (img) => {
    if (!img) return;
    const a = document.createElement('a');
    a.href = img.dataUrl;
    const sanitizedName = (img.areaName || 'SAR_Area').replace(/[^a-zA-Z0-9_-]/g, '_');
    a.download = `AEROSAR_Recon_${sanitizedName}_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyCoordinates = (img) => {
    if (!img) return;
    const coordStr = `${img.lat.toFixed(6)}, ${img.lng.toFixed(6)}`;
    navigator.clipboard?.writeText(coordStr);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border-2 border-emerald-500/40 text-slate-900 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Reticle Corner Brackets */}
        <div className="absolute top-2 left-2 w-4 h-4 corner-bracket-tl pointer-events-none z-10"></div>
        <div className="absolute top-2 right-2 w-4 h-4 corner-bracket-tr pointer-events-none z-10"></div>
        <div className="absolute bottom-2 left-2 w-4 h-4 corner-bracket-bl pointer-events-none z-10"></div>
        <div className="absolute bottom-2 right-2 w-4 h-4 corner-bracket-br pointer-events-none z-10"></div>

        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-emerald-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <Camera className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-chakra font-bold text-lg sm:text-xl text-emerald-400 tracking-wider">
                  AERIAL RECON INTEL VAULT
                </h2>
                <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  {capturedIntel.length} SNAPSHOTS CAPTURED
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono-code">
                GEO-REFERENCED LIVE SATELLITE & DRONE RECONNAISSANCE ARCHIVE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {capturedIntel.length > 1 && (
              <button
                onClick={clearAllCapturedIntel}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/50 text-xs font-mono-code transition-all"
                title="Clear all captured snapshots"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {capturedIntel.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-400">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-chakra font-bold text-slate-800">
                No Recon Snapshots Captured Yet
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto font-mono-code text-xs leading-relaxed">
                Use the <span className="font-bold text-emerald-700">"Search Area"</span> input on the Tactical Radar map to find any disaster location, then click <span className="font-bold text-emerald-700">"Capture Live Area"</span> to record high-resolution aerial reconnaissance photos with live telemetry.
              </p>
            </div>
          ) : (
            <div>
              {currentImage && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  
                  {/* Big Preview (8 cols) */}
                  <div className="lg:col-span-8 space-y-3">
                    <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500/40 bg-slate-950 shadow-lg group">
                      <img
                        src={currentImage.dataUrl}
                        alt={currentImage.areaName}
                        className="w-full h-auto object-contain max-h-[480px] mx-auto block"
                      />

                      {/* Download Floating Overlay Button */}
                      <button
                        onClick={() => handleDownload(currentImage)}
                        className="absolute bottom-3 right-3 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono-code text-xs font-bold shadow-lg flex items-center gap-1.5 transition-transform hover:scale-105"
                      >
                        <Download className="w-4 h-4" />
                        <span>DOWNLOAD HIGH-RES PNG</span>
                      </button>
                    </div>

                    {/* Quick Caption */}
                    <div className="flex items-center justify-between text-xs font-mono-code text-slate-600 px-1">
                      <span>CLASSIFICATION: SAR TACTICAL INTEL</span>
                      <span>RESOLUTION: 1280 × 800 PX</span>
                    </div>
                  </div>

                  {/* Metadata & Actions (4 cols) */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <div>
                        <div className="text-[10px] font-mono-code uppercase tracking-wider text-emerald-700 font-bold">
                          TARGET SECTOR
                        </div>
                        <h4 className="font-chakra font-bold text-lg text-slate-900 leading-tight">
                          {currentImage.areaName}
                        </h4>
                      </div>

                      <div className="space-y-2 text-xs font-mono-code pt-2 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600" /> GPS Coords:
                          </span>
                          <button
                            onClick={() => handleCopyCoordinates(currentImage)}
                            className="font-bold text-emerald-800 hover:underline flex items-center gap-1"
                            title="Click to copy GPS coordinates"
                          >
                            <span>{currentImage.lat.toFixed(4)}N, {Math.abs(currentImage.lng).toFixed(4)}W</span>
                          </button>
                        </div>
                        {copiedNotification && (
                          <div className="text-[10px] text-emerald-600 font-bold text-right">
                            ✓ Copied to clipboard!
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1">
                            <Navigation className="w-3.5 h-3.5 text-emerald-600" /> Altitude:
                          </span>
                          <span className="font-bold text-slate-800">{currentImage.altitude?.toFixed(1) || 46.2}m AGL</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-emerald-600" /> Timestamp:
                          </span>
                          <span className="text-slate-800 font-bold">{currentImage.createdAt || currentImage.timestamp}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Drone Unit:
                          </span>
                          <span className="text-slate-800 text-[10px] truncate max-w-[140px]">{currentImage.droneModel}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-slate-200 space-y-2">
                        <button
                          onClick={() => handleDownload(currentImage)}
                          className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-chakra font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span>SAVE / DOWNLOAD TO PC</span>
                        </button>

                        <button
                          onClick={() => deleteCapturedIntel(currentImage.id)}
                          className="w-full py-2 rounded-lg bg-slate-100 hover:bg-rose-100 text-rose-700 border border-slate-300 hover:border-rose-400 font-mono-code text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>DELETE THIS SNAPSHOT</span>
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* Thumbnails list of previously captured images */}
              {capturedIntel.length > 1 && (
                <div className="pt-4 border-t border-slate-200">
                  <div className="text-xs font-mono-code text-slate-600 uppercase tracking-wider mb-2 font-bold">
                    Captured Snapshot History:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {capturedIntel.map((img) => {
                      const isSelected = img.id === (currentImage && currentImage.id);
                      return (
                        <button
                          key={img.id}
                          onClick={() => setSelectedImageId(img.id)}
                          className={`relative rounded-lg overflow-hidden border-2 text-left transition-all p-1 bg-slate-900 group ${
                            isSelected
                              ? 'border-emerald-500 ring-2 ring-emerald-400/50 shadow-md'
                              : 'border-slate-300 hover:border-emerald-400'
                          }`}
                        >
                          <img
                            src={img.dataUrl}
                            alt={img.areaName}
                            className="w-full h-20 object-cover rounded"
                          />
                          <div className="mt-1 px-1">
                            <div className="text-[10px] font-chakra font-bold text-white truncate">
                              {img.areaName}
                            </div>
                            <div className="text-[9px] font-mono-code text-emerald-400 truncate">
                              {img.createdAt}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs font-mono-code text-slate-500">
          <span>AEROSAR MIL-SPEC IMAGERY SUBSYSTEM</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition-colors"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
};

export default ReconVaultModal;
