import React, { useEffect, useRef } from 'react';

const HudRadarBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let angle = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Simulated blips on the radar in tactical army colors
    const blips = [
      { r: 0.35, theta: 0.8, size: 4.5, label: 'DRONE-01', color: '#5F7521' },
      { r: 0.62, theta: 2.3, size: 5, label: 'SURVIVOR-LOC', color: '#DC2626' },
      { r: 0.8, theta: 4.1, size: 4, label: 'BASE-ALPHA', color: '#277273' },
      { r: 0.5, theta: 5.2, size: 4.5, label: 'MEDEVAC-02', color: '#DE802B' },
    ];

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w * 0.5;
      const cy = h * 0.5;
      const maxRadius = Math.min(w, h) * 0.45;

      // Warm khaki/sand parchment canvas trail matching user reference image
      ctx.fillStyle = 'rgba(232, 230, 218, 0.35)';
      ctx.fillRect(0, 0, w, h);

      // Subtle light tactical grid lines in military olive
      ctx.strokeStyle = 'rgba(95, 117, 33, 0.07)';
      ctx.lineWidth = 1;
      const gridSize = 48;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Concentric Radar Rings in military olive
      [0.25, 0.5, 0.75, 1.0].forEach((fraction) => {
        ctx.beginPath();
        ctx.arc(cx, cy, maxRadius * fraction, 0, Math.PI * 2);
        ctx.strokeStyle = fraction === 1.0 ? 'rgba(95, 117, 33, 0.22)' : 'rgba(95, 117, 33, 0.1)';
        ctx.lineWidth = fraction === 1.0 ? 1.5 : 1;
        ctx.stroke();
      });

      // Axis lines
      ctx.beginPath();
      ctx.moveTo(cx - maxRadius, cy);
      ctx.lineTo(cx + maxRadius, cy);
      ctx.moveTo(cx, cy - maxRadius);
      ctx.lineTo(cx, cy + maxRadius);
      ctx.strokeStyle = 'rgba(95, 117, 33, 0.12)';
      ctx.stroke();

      // Sweeping radar beam in tactical army olive
      angle += 0.015;
      const sweepGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius);
      sweepGradient.addColorStop(0, 'rgba(95, 117, 33, 0.18)');
      sweepGradient.addColorStop(1, 'rgba(95, 117, 33, 0.0)');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxRadius, angle - 0.35, angle, false);
      ctx.closePath();
      ctx.fillStyle = sweepGradient;
      ctx.fill();

      // Sweeping beam leading line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * maxRadius, cy + Math.sin(angle) * maxRadius);
      ctx.strokeStyle = 'rgba(95, 117, 33, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Blips
      blips.forEach(b => {
        const bx = cx + Math.cos(b.theta) * (maxRadius * b.r);
        const by = cy + Math.sin(b.theta) * (maxRadius * b.r);

        let diff = (angle - b.theta) % (Math.PI * 2);
        if (diff < 0) diff += Math.PI * 2;
        const opacity = Math.max(0.2, 1 - (diff / (Math.PI * 1.5)));

        ctx.fillStyle = b.color;
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(bx, by, b.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = b.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(bx, by, b.size + 4, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#191E15';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(b.label, bx + 10, by + 3);
        ctx.globalAlpha = 1.0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

export default HudRadarBackground;
