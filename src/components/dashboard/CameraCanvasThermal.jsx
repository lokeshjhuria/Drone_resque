import React, { useRef, useEffect } from 'react';
import { useDrone } from '../../context/DroneContext';

const CameraCanvasThermal = () => {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const imgStreamRef = useRef(null);
  const { cameraState, detections, activeTargetId, telemetry, droneConnection, liveMediaStream } = useDrone();

  useEffect(() => {
    if (videoRef.current && liveMediaStream) {
      videoRef.current.srcObject = liveMediaStream;
      videoRef.current.play().catch(e => console.log('Video play interrupted:', e));
    }
  }, [liveMediaStream]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let tick = 0;

    canvas.width = 1280;
    canvas.height = 720;

    const render = () => {
      tick += 0.02;
      const w = canvas.width;
      const h = canvas.height;
      const zoom = cameraState.zoomLevel;
      const palette = cameraState.thermalPalette; // 'ironbow', 'rainbow', 'whiteHot'

      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-w / 2, -h / 2);

      // 1. If physical drone video stream is active, render live feed with FLIR radiometric filter
      let renderedRealThermal = false;
      if (droneConnection?.useRealCamera) {
        const source = (videoRef.current && videoRef.current.readyState >= 2)
          ? videoRef.current
          : (imgStreamRef.current && imgStreamRef.current.complete && imgStreamRef.current.naturalWidth > 0 ? imgStreamRef.current : null);

        if (source) {
          try {
            if (palette === 'whiteHot') {
              ctx.filter = 'grayscale(100%) contrast(160%) brightness(85%) invert(100%)';
            } else if (palette === 'ironbow') {
              ctx.filter = 'contrast(170%) brightness(75%) sepia(80%) hue-rotate(275deg) saturate(350%)';
            } else {
              ctx.filter = 'contrast(160%) brightness(80%) hue-rotate(180deg) saturate(300%)';
            }
            ctx.drawImage(source, 0, 0, w, h);
            ctx.filter = 'none';
            renderedRealThermal = true;
          } catch (err) {}
        }
      }

      if (!renderedRealThermal) {
        // Cold background terrain gradient according to palette
        let bgGrad = ctx.createLinearGradient(0, 0, w, h);
      if (palette === 'ironbow') {
        bgGrad.addColorStop(0, '#0a031a');
        bgGrad.addColorStop(0.5, '#1e0836');
        bgGrad.addColorStop(1, '#2c0d45');
      } else if (palette === 'whiteHot') {
        bgGrad.addColorStop(0, '#101010');
        bgGrad.addColorStop(0.5, '#1e1e1e');
        bgGrad.addColorStop(1, '#181818');
      } else {
        // Rainbow
        bgGrad.addColorStop(0, '#030c26');
        bgGrad.addColorStop(0.5, '#052b47');
        bgGrad.addColorStop(1, '#084b54');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Ground thermal noise & cooling contours
      const driftY = (tick * 15) % 80;
      for (let y = -80 + driftY; y < h + 80; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(w * 0.3, y + 15, w * 0.7, y - 15, w, y);
        ctx.strokeStyle = palette === 'whiteHot' ? 'rgba(80, 80, 80, 0.15)' : 'rgba(100, 20, 140, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Cooler foliage / trees in thermal (usually colder than bare earth at night)
      const trees = [
        { x: 180, y: 220, r: 45 }, { x: 320, y: 150, r: 60 },
        { x: 880, y: 180, r: 50 }, { x: 1050, y: 340, r: 70 },
        { x: 250, y: 520, r: 55 }, { x: 920, y: 560, r: 65 },
        { x: 480, y: 610, r: 40 }, { x: 740, y: 220, r: 35 }
      ];

      trees.forEach((t) => {
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
        ctx.fillStyle = palette === 'whiteHot' ? '#080808' : '#080214';
        ctx.fill();
        ctx.strokeStyle = palette === 'whiteHot' ? '#222222' : '#1d0838';
        ctx.stroke();
      });
    }

    // 2. Render Intense Human Body Thermal Heat Signatures
      detections.forEach((det, idx) => {
        const posX = (det.screenX / 100) * w;
        const posY = (det.screenY / 100) * h;
        const isLocked = det.id === activeTargetId;
        const temp = det.bodyTemp; // e.g. 36.8 or 33.8
        const isHypo = temp < 35.0;

        // Radiant heat glow corona around human body
        const heatRadius = isHypo ? 55 : 75;
        const heatGlow = ctx.createRadialGradient(posX, posY, 4, posX, posY, heatRadius);

        if (palette === 'ironbow') {
          // Ironbow: White center -> Yellow -> Bright Red/Orange -> Purple -> Transparent
          heatGlow.addColorStop(0, '#ffffff');
          heatGlow.addColorStop(0.2, '#fffb00');
          heatGlow.addColorStop(0.45, '#ff4500');
          heatGlow.addColorStop(0.7, '#a81566');
          heatGlow.addColorStop(0.9, '#4a084a');
          heatGlow.addColorStop(1, 'rgba(30, 0, 40, 0)');
        } else if (palette === 'whiteHot') {
          // White hot: pure glowing white to dark gray
          heatGlow.addColorStop(0, '#ffffff');
          heatGlow.addColorStop(0.3, '#f0f0f0');
          heatGlow.addColorStop(0.6, '#b0b0b0');
          heatGlow.addColorStop(0.85, '#505050');
          heatGlow.addColorStop(1, 'rgba(20, 20, 20, 0)');
        } else {
          // Rainbow
          heatGlow.addColorStop(0, '#ffffff');
          heatGlow.addColorStop(0.25, '#ff0000');
          heatGlow.addColorStop(0.5, '#ffff00');
          heatGlow.addColorStop(0.75, '#00ff00');
          heatGlow.addColorStop(1, 'rgba(0, 100, 255, 0)');
        }

        ctx.fillStyle = heatGlow;
        ctx.beginPath();
        ctx.arc(posX, posY, heatRadius, 0, Math.PI * 2);
        ctx.fill();

        // Distinct Human Core Silhouette radiating heat
        const pulse = Math.sin(tick * 3 + idx) * 1.5;
        ctx.fillStyle = '#ffffff';
        // Head
        ctx.beginPath();
        ctx.arc(posX, posY - 12, 7 + pulse * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Torso & Limbs
        ctx.beginPath();
        ctx.ellipse(posX, posY + 4, 12 + pulse, 18 + pulse, 0, 0, Math.PI * 2);
        ctx.fill();

        // AI Thermal Isotherm Detection Box
        if (cameraState.aiBoundingBoxes) {
          const boxW = 90;
          const boxH = 104;
          const bx = posX - boxW / 2;
          const by = posY - boxH / 2 - 2;

          const boxColor = isHypo ? '#f59e0b' : '#ff3366';

          ctx.strokeStyle = boxColor;
          ctx.lineWidth = isLocked ? 2.5 : 1.5;
          ctx.strokeRect(bx, by, boxW, boxH);

          // Thermal Tag Plate
          ctx.fillStyle = isHypo ? 'rgba(245, 158, 11, 0.9)' : 'rgba(255, 51, 102, 0.9)';
          ctx.fillRect(bx, by - 26, boxW + 50, 24);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px monospace';
          ctx.fillText(`FLIR: ${temp.toFixed(1)}°C`, bx + 6, by - 10);

          // Sub plate
          ctx.fillStyle = 'rgba(7, 11, 18, 0.9)';
          ctx.fillRect(bx, by + boxH + 2, boxW + 50, 20);
          ctx.fillStyle = isHypo ? '#fbbf24' : '#ff3366';
          ctx.font = 'bold 10px monospace';
          ctx.fillText(isHypo ? '⚠ HYPOTHERMIA RISK' : '✓ VITAL HEAT NORMAL', bx + 4, by + boxH + 16);
        }
      });

      ctx.restore(); // Restore zoom

      // 3. FLIR HUD Overlays
      if (cameraState.gridOverlay) {
        const cx = w / 2;
        const cy = h / 2;

        // Spot Thermometer Crosshair at screen center
        ctx.strokeStyle = '#ff3366';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - 24, cy); ctx.lineTo(cx + 24, cy);
        ctx.moveTo(cx, cy - 24); ctx.lineTo(cx, cy + 24);
        ctx.stroke();

        ctx.fillStyle = '#ff3366';
        ctx.font = 'bold 11px monospace';
        const centerTemp = (36.2 + Math.sin(tick) * 0.4).toFixed(1);
        ctx.fillText(`+ SPOT ${centerTemp}°C`, cx + 12, cy - 10);

        // Reticle Corner brackets
        const fovPad = 50;
        const fovLen = 25;
        ctx.strokeStyle = 'rgba(255, 51, 102, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(fovPad, fovPad + fovLen); ctx.lineTo(fovPad, fovPad); ctx.lineTo(fovPad + fovLen, fovPad); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w - fovPad - fovLen, fovPad); ctx.lineTo(w - fovPad, fovPad); ctx.lineTo(w - fovPad, fovPad + fovLen); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(fovPad, h - fovPad - fovLen); ctx.lineTo(fovPad, h - fovPad); ctx.lineTo(fovPad + fovLen, h - fovPad); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w - fovPad - fovLen, h - fovPad); ctx.lineTo(w - fovPad, h - fovPad); ctx.lineTo(w - fovPad, h - fovPad - fovLen); ctx.stroke();
      }

      // Thermal Calibration & Sensor Header
      ctx.fillStyle = 'rgba(7, 11, 18, 0.8)';
      const badgeWidth = droneConnection?.connectedWifiSsid ? 280 : 230;
      ctx.fillRect(16, 16, badgeWidth, 36);
      ctx.strokeStyle = droneConnection?.isDroneWifi ? 'rgba(56, 189, 248, 0.6)' : 'rgba(255, 51, 102, 0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(16, 16, badgeWidth, 36);

      ctx.fillStyle = droneConnection?.isDroneWifi ? '#38bdf8' : '#ff3366';
      ctx.font = 'bold 12px monospace';
      const thermTitle = droneConnection?.isDroneWifi
        ? `CAM-02: FLIR [${droneConnection.connectedWifiSsid}]`
        : (droneConnection?.useRealCamera ? 'CAM-02: LIVE THERMAL FX' : 'CAM-02: FLIR THERMAL LWIR');
      ctx.fillText(thermTitle, 26, 32);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '10px monospace';
      ctx.fillText(`NETD <40mK | 7.5-13.5µm | ${palette.toUpperCase()}`, 26, 46);

      // Temperature Gradient Reference Bar on right
      const barX = w - 40;
      const barY = 70;
      const barH = 220;
      const barW = 16;

      const barGrad = ctx.createLinearGradient(0, barY, 0, barY + barH);
      if (palette === 'ironbow') {
        barGrad.addColorStop(0, '#ffffff');
        barGrad.addColorStop(0.2, '#fffb00');
        barGrad.addColorStop(0.5, '#ff4500');
        barGrad.addColorStop(0.8, '#a81566');
        barGrad.addColorStop(1, '#0a031a');
      } else if (palette === 'whiteHot') {
        barGrad.addColorStop(0, '#ffffff');
        barGrad.addColorStop(1, '#000000');
      } else {
        barGrad.addColorStop(0, '#ff0000');
        barGrad.addColorStop(0.5, '#ffff00');
        barGrad.addColorStop(0.75, '#00ff00');
        barGrad.addColorStop(1, '#030c26');
      }

      ctx.fillStyle = barGrad;
      ctx.fillRect(barX, barY, barW, barH);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.strokeRect(barX, barY, barW, barH);

      // Scale limits
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('39°C', barX - 32, barY + 10);
      ctx.fillStyle = '#ff3366';
      ctx.fillText('36°C', barX - 32, barY + barH * 0.35);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('14°C', barX - 32, barY + barH - 4);

      // Bottom Bar with FLIR Radiometric data
      ctx.fillStyle = 'rgba(7, 11, 18, 0.85)';
      ctx.fillRect(16, h - 42, w - 32, 28);
      ctx.strokeStyle = 'rgba(255, 51, 102, 0.3)';
      ctx.strokeRect(16, h - 42, w - 32, 28);

      ctx.fillStyle = '#ff3366';
      ctx.font = '11px monospace';
      ctx.fillText(`RADIOMETRIC ISOTHERM: THRESHOLD ≥ ${cameraState.isothermLimit}°C | FLIR BOSON CALIBRATION: NUC OK | NFOV`, 26, h - 24);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [cameraState, detections, activeTargetId, telemetry, droneConnection]);

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden border border-hud-infrared/40 group">
      {/* Hidden video element for live webcam / capture card feed */}
      <video ref={videoRef} playsInline muted className="hidden" />
      {/* Hidden image element for live Wi-Fi MJPEG / HTTP stream */}
      {droneConnection?.useRealCamera && (droneConnection?.streamProxyUrl || droneConnection?.cameraStreamUrl) && (
        <img
          ref={imgStreamRef}
          src={droneConnection.streamProxyUrl || droneConnection.cameraStreamUrl}
          crossOrigin="anonymous"
          alt="Drone Thermal Stream"
          className="hidden"
          onError={(e) => {
            // Fallback or retry silently
          }}
        />
      )}
      <canvas ref={canvasRef} className="w-full h-full object-cover block" />
      <div className="scanlines-overlay absolute inset-0 opacity-20 pointer-events-none"></div>
    </div>
  );
};

export default CameraCanvasThermal;
