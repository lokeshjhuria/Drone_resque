import React, { useRef, useEffect } from 'react';
import { useDrone } from '../../context/DroneContext';

const CameraCanvasRGB = () => {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const { cameraState, detections, activeTargetId, telemetry, droneConnection, liveMediaStream } = useDrone();

  // Attach live video stream to hidden video element if real camera is enabled
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

      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-w / 2, -h / 2);

      // 1. If physical drone video stream is active, draw live webcam / capture card feed
      if (droneConnection.useRealCamera && videoRef.current && videoRef.current.readyState >= 2) {
        ctx.drawImage(videoRef.current, 0, 0, w, h);
      } else {
        // Procedural aerial search terrain in tactical green/earth tones
        const bgGrad = ctx.createLinearGradient(0, 0, w, h);
        bgGrad.addColorStop(0, '#0c1a12');
        bgGrad.addColorStop(0.5, '#13281b');
        bgGrad.addColorStop(1, '#09140e');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Moving ground texture
        const driftY = (tick * 15) % 80;
        ctx.strokeStyle = 'rgba(74, 222, 128, 0.15)';
        ctx.lineWidth = 1;
        for (let y = -80 + driftY; y < h + 80; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.bezierCurveTo(w * 0.3, y + 10, w * 0.7, y - 10, w, y);
          ctx.stroke();
        }

        // Topography hill contour
        ctx.beginPath();
        ctx.moveTo(0, h * 0.3);
        ctx.bezierCurveTo(w * 0.4, h * 0.25, w * 0.6, h * 0.55, w, h * 0.4);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.fillStyle = 'rgba(10, 26, 16, 0.45)';
        ctx.fill();

        // Trees & foliage clusters
        const trees = [
          { x: 180, y: 220, r: 45 }, { x: 320, y: 150, r: 60 },
          { x: 880, y: 180, r: 50 }, { x: 1050, y: 340, r: 70 },
          { x: 250, y: 520, r: 55 }, { x: 920, y: 560, r: 65 },
          { x: 480, y: 610, r: 40 }, { x: 740, y: 220, r: 35 }
        ];

        trees.forEach((t, i) => {
          const sway = Math.sin(tick + i) * 2;
          ctx.beginPath();
          ctx.arc(t.x + sway, t.y, t.r, 0, Math.PI * 2);
          ctx.fillStyle = '#0a1d12';
          ctx.fill();
          ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
          ctx.stroke();
        });
      }

      // Render Detected Survivors with dynamic movement and realistic detail
      detections.forEach((det, idx) => {
        const posX = (det.screenX / 100) * w;
        const posY = (det.screenY / 100) * h;
        const isLocked = det.id === activeTargetId;

        // Ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(posX, posY + 22, 16, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // High-vis Orange rescue jacket vs blue
        const wave = Math.sin(tick * 4 + idx) * 8;

        // Body torso
        ctx.fillStyle = idx === 0 ? '#ea580c' : '#10b981';
        ctx.beginPath();
        ctx.ellipse(posX, posY + 4, 12, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath();
        ctx.arc(posX, posY - 10, 7, 0, Math.PI * 2);
        ctx.fill();

        // Arm waving SOS signal
        if (idx === 0) {
          ctx.strokeStyle = '#ea580c';
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(posX + 8, posY);
          ctx.lineTo(posX + 20, posY - 15 + wave);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(posX - 8, posY);
          ctx.lineTo(posX - 18, posY - 10 - wave);
          ctx.stroke();
        }

        // AI Object Detection Bounding Box in Light Green
        if (cameraState.aiBoundingBoxes) {
          const boxW = 84;
          const boxH = 96;
          const bx = posX - boxW / 2;
          const by = posY - boxH / 2 - 2;

          const boxColor = isLocked ? '#22c55e' : '#4ade80';

          // Outer Bounding Box
          ctx.strokeStyle = boxColor;
          ctx.lineWidth = isLocked ? 2.5 : 1.5;
          ctx.strokeRect(bx, by, boxW, boxH);

          // Corner Brackets
          const cLen = 12;
          ctx.lineWidth = 3;
          // TL
          ctx.beginPath(); ctx.moveTo(bx, by + cLen); ctx.lineTo(bx, by); ctx.lineTo(bx + cLen, by); ctx.stroke();
          // TR
          ctx.beginPath(); ctx.moveTo(bx + boxW - cLen, by); ctx.lineTo(bx + boxW, by); ctx.lineTo(bx + boxW, by + cLen); ctx.stroke();
          // BL
          ctx.beginPath(); ctx.moveTo(bx, by + boxH - cLen); ctx.lineTo(bx, by + boxH); ctx.lineTo(bx + cLen, by + boxH); ctx.stroke();
          // BR
          ctx.beginPath(); ctx.moveTo(bx + boxW - cLen, by + boxH); ctx.lineTo(bx + boxW, by + boxH); ctx.lineTo(bx + boxW, by + boxH - cLen); ctx.stroke();

          // Target Label Plate in Light Green
          ctx.fillStyle = isLocked ? 'rgba(34, 197, 94, 0.95)' : 'rgba(74, 222, 128, 0.9)';
          ctx.fillRect(bx, by - 24, boxW + 40, 22);

          ctx.fillStyle = '#000000';
          ctx.font = 'bold 11px monospace';
          ctx.fillText(`PERSON ${det.confidence}%`, bx + 4, by - 8);

          // Sub-plate info
          ctx.fillStyle = 'rgba(5, 12, 8, 0.88)';
          ctx.fillRect(bx, by + boxH + 2, boxW + 44, 18);
          ctx.fillStyle = isLocked ? '#4ade80' : '#86efac';
          ctx.font = '10px monospace';
          ctx.fillText(`DIST:${det.distance}m | ${det.id}`, bx + 4, by + boxH + 15);

          if (det.status === 'MEDICAL_DROPPED') {
            ctx.fillStyle = '#22c55e';
            ctx.fillText('MED-POD DISPATCHED', bx + 4, by + boxH + 30);
          }
        }
      });

      // Spotlight beam cone if enabled
      if (cameraState.spotlightOn) {
        const spotGrad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, 380);
        spotGrad.addColorStop(0, 'rgba(255, 255, 230, 0.45)');
        spotGrad.addColorStop(0.6, 'rgba(255, 255, 200, 0.15)');
        spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = spotGrad;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.restore(); // Restore zoom

      // De-haze filter
      if (cameraState.dehazeOn) {
        ctx.fillStyle = 'rgba(34, 197, 94, 0.03)';
        ctx.fillRect(0, 0, w, h);
      }

      // HUD & Gimbal Reticle in Light Green
      if (cameraState.gridOverlay) {
        const cx = w / 2;
        const cy = h / 2;
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.7)';
        ctx.lineWidth = 1.5;

        // Center circle
        ctx.beginPath();
        ctx.arc(cx, cy, 32, 0, Math.PI * 2);
        ctx.stroke();

        // Crosshair ticks
        ctx.beginPath();
        ctx.moveTo(cx - 50, cy); ctx.lineTo(cx - 36, cy);
        ctx.moveTo(cx + 36, cy); ctx.lineTo(cx + 50, cy);
        ctx.moveTo(cx, cy - 50); ctx.lineTo(cx, cy - 36);
        ctx.moveTo(cx, cy + 36); ctx.lineTo(cx, cy + 50);
        ctx.stroke();

        // 4 Corner brackets for FOV
        const fovPad = 50;
        const fovLen = 30;
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(fovPad, fovPad + fovLen); ctx.lineTo(fovPad, fovPad); ctx.lineTo(fovPad + fovLen, fovPad); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w - fovPad - fovLen, fovPad); ctx.lineTo(w - fovPad, fovPad); ctx.lineTo(w - fovPad, fovPad + fovLen); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(fovPad, h - fovPad - fovLen); ctx.lineTo(fovPad, h - fovPad); ctx.lineTo(fovPad + fovLen, h - fovPad); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w - fovPad - fovLen, h - fovPad); ctx.lineTo(w - fovPad, h - fovPad); ctx.lineTo(w - fovPad, h - fovPad - fovLen); ctx.stroke();

        // Gimbal pitch ladder
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.35)';
        ctx.lineWidth = 1;
        [-20, 0, 20].forEach((offset) => {
          ctx.beginPath();
          ctx.moveTo(cx - 90, cy + offset * 3);
          ctx.lineTo(cx - 70, cy + offset * 3);
          ctx.moveTo(cx + 70, cy + offset * 3);
          ctx.lineTo(cx + 90, cy + offset * 3);
          ctx.stroke();
          ctx.fillStyle = 'rgba(74, 222, 128, 0.7)';
          ctx.font = '9px monospace';
          ctx.fillText(`${telemetry.gimbalPitch + offset}°`, cx + 95, cy + offset * 3 + 3);
        });
      }

      // Top-left channel badge
      ctx.fillStyle = 'rgba(5, 12, 8, 0.85)';
      ctx.fillRect(16, 16, 230, 36);
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(16, 16, 230, 36);

      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(droneConnection.useRealCamera ? 'CAM-01: LIVE HARDWARE FEED' : 'CAM-01: OPTICAL 4K RGB', 26, 32);
      ctx.fillStyle = '#a7f3d0';
      ctx.font = '10px monospace';
      ctx.fillText(`FOV 84° | ${cameraState.zoomLevel}X OPTICAL | 60 FPS`, 26, 46);

      // Top-right recording / live indicator
      ctx.fillStyle = 'rgba(5, 12, 8, 0.85)';
      ctx.fillRect(w - 140, 16, 124, 30);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.strokeRect(w - 140, 16, 124, 30);

      const recAlpha = (Math.sin(tick * 5) + 1) / 2;
      ctx.fillStyle = `rgba(239, 68, 68, ${0.4 + recAlpha * 0.6})`;
      ctx.beginPath();
      ctx.arc(w - 124, 31, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('AI REC LIVE', w - 110, 35);

      // Bottom Telemetry Overlay in Light Green
      ctx.fillStyle = 'rgba(5, 12, 8, 0.88)';
      ctx.fillRect(16, h - 42, w - 32, 28);
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
      ctx.strokeRect(16, h - 42, w - 32, 28);

      ctx.fillStyle = '#86efac';
      ctx.font = '11px monospace';
      ctx.fillText(`GPS: ${telemetry.lat.toFixed(5)}N, ${Math.abs(telemetry.lng).toFixed(5)}W | ALT: ${telemetry.altitude}m AGL | HDG: ${telemetry.heading}° | GIMBAL: ${telemetry.gimbalPitch}°`, 26, h - 24);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [cameraState, detections, activeTargetId, telemetry, droneConnection]);

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden border border-green-500/30 group">
      {/* Hidden video element for streaming live webcam or HDMI capture card */}
      <video ref={videoRef} playsInline muted className="hidden" />
      <canvas ref={canvasRef} className="w-full h-full object-cover block" />
      <div className="scanlines-overlay absolute inset-0 opacity-20 pointer-events-none"></div>
    </div>
  );
};

export default CameraCanvasRGB;
