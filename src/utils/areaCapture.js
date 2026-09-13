// Utility for capturing high-resolution tactical aerial reconnaissance imagery of any searched area

// Convert latitude and longitude to Slippy tile numbers (Web Mercator)
export function latLngToTile(lat, lng, zoom) {
  const latRad = (lat * Math.PI) / 180;
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
  return { x, y, zoom };
}

// Convert tile coordinates back to top-left lat/lng of that tile
export function tileToLatLng(x, y, zoom) {
  const n = Math.pow(2, zoom);
  const lonDeg = (x / n) * 360 - 180;
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n)));
  const latDeg = (latRad * 180) / Math.PI;
  return { lat: latDeg, lng: lonDeg };
}

// Predefined tactical disaster search areas for instant testing
export const DISASTER_SEARCH_PRESETS = [
  {
    id: 'brazos-flood',
    name: 'Brazos Valley Flood Zone',
    region: 'Texas, USA',
    category: 'FLOOD',
    lat: 29.5821,
    lng: -95.7608,
    zoom: 16,
    disasterType: 'Catastrophic River Overflow & Stranded Rooftop Survivors',
    hazards: 'Flash flood depth 3.8m, rapid water currents',
    targetConfidence: '98.6% Conf (4 Survivors)'
  },
  {
    id: 'sierra-wildfire',
    name: 'Sierra Ridge Wildfire Sector',
    region: 'California, USA',
    category: 'WILDFIRE',
    lat: 37.2840,
    lng: -119.2940,
    zoom: 16,
    disasterType: 'Zero-Visibility Pine Forest Smoke & Rapid Fireline',
    hazards: 'Ambient flame 410°C, high wind turbulence',
    targetConfidence: '97.4% Conf (6 Firefighters/Civilians)'
  },
  {
    id: 'shasta-medevac',
    name: 'Mount Shasta Alpine LZ',
    region: 'California, USA',
    category: 'ALPINE_MEDEVAC',
    lat: 41.4092,
    lng: -122.1949,
    zoom: 16,
    disasterType: 'Mountain Avalanche & Hypothermia Trauma Extraction',
    hazards: 'Sub-zero temperatures (-8°C), rocky cliff face',
    targetConfidence: '99.1% Conf (2 Climbers)'
  },
  {
    id: 'kochi-flood',
    name: 'Kochi Coastal Monsoon Basin',
    region: 'Kerala, India',
    category: 'FLOOD',
    lat: 9.9312,
    lng: 76.2673,
    zoom: 16,
    disasterType: 'Submerged Residential Sector & Water Inundation',
    hazards: 'Waterlogged electrical grid, isolation',
    targetConfidence: '96.8% Conf (5 Survivors)'
  },
  {
    id: 'metro-la',
    name: 'Downtown Metro SAR Sector Bravo',
    region: 'Los Angeles, USA',
    category: 'URBAN',
    lat: 34.0537,
    lng: -118.2427,
    zoom: 16,
    disasterType: 'Urban Structural Collapse & High-Rise Evac',
    hazards: 'Urban debris, multipath radio reflections',
    targetConfidence: '97.8% Conf (3 Survivors)'
  },
  {
    id: 'himalayan-sar',
    name: 'Rishikesh Valley SAR Base',
    region: 'Uttarakhand, India',
    category: 'ALPINE_MEDEVAC',
    lat: 30.0869,
    lng: 78.2676,
    zoom: 16,
    disasterType: 'Glacial Flood Surge & Remote Trekker Rescue',
    hazards: 'Steep gorges, restricted GPS sightlines',
    targetConfidence: '98.2% Conf (2 Trekkers)'
  }
];

// Helper to load an image with CORS
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load tile: ${url}`));
    img.src = url;
  });
}

// Generate the high-resolution tactical aerial reconnaissance snapshot
export async function generateAerialReconSnapshot({
  areaName,
  lat,
  lng,
  zoom = 16,
  altitude = 46.2,
  heading = 42,
  droneModel = 'AERO-FALCON-01 [Dual Optical 4K + FLIR]',
  callSign = 'COMMANDER-VANCE',
  survivorInfo = null,
  environmental = null,
}) {
  const width = 1280;
  const height = 800;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // 1. Calculate tile grid around the target
  const centerTile = latLngToTile(lat, lng, zoom);
  const tileSize = 256;

  // We load a 3x3 grid around the center tile
  const tilePromises = [];
  const coords = [];

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const tx = centerTile.x + dx;
      const ty = centerTile.y + dy;
      const url = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${ty}/${tx}`;
      coords.push({ dx, dy, tx, ty });
      tilePromises.push(loadImage(url).catch(() => null));
    }
  }

  // Draw background fallback
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, height);

  try {
    const images = await Promise.all(tilePromises);
    const startX = width / 2 - (tileSize * 3) / 2;
    const startY = height / 2 - (tileSize * 3) / 2;

    images.forEach((img, idx) => {
      if (img) {
        const { dx, dy } = coords[idx];
        const px = startX + (dx + 1) * tileSize;
        const py = startY + (dy + 1) * tileSize;
        ctx.drawImage(img, px, py, tileSize, tileSize);
      }
    });

    // If none of the tiles loaded, draw synthetic tactical grid
    const loadedCount = images.filter(Boolean).length;
    if (loadedCount === 0) {
      drawSyntheticAerialGrid(ctx, width, height, areaName);
    }
  } catch (err) {
    console.warn('Tile load issue, using synthetic grid:', err);
    drawSyntheticAerialGrid(ctx, width, height, areaName);
  }

  // 2. Tactical Post-Processing: Subtle Vignette & Contrast
  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    height * 0.3,
    width / 2,
    height / 2,
    width * 0.65
  );
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.05)');
  gradient.addColorStop(0.7, 'rgba(15, 23, 42, 0.4)');
  gradient.addColorStop(1, 'rgba(10, 15, 25, 0.85)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 3. Tactical Reticle Corner Brackets
  const bracketSize = 36;
  const margin = 24;
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 3;

  // Top-Left
  ctx.beginPath();
  ctx.moveTo(margin, margin + bracketSize);
  ctx.lineTo(margin, margin);
  ctx.lineTo(margin + bracketSize, margin);
  ctx.stroke();

  // Top-Right
  ctx.beginPath();
  ctx.moveTo(width - margin - bracketSize, margin);
  ctx.lineTo(width - margin, margin);
  ctx.lineTo(width - margin, margin + bracketSize);
  ctx.stroke();

  // Bottom-Left
  ctx.beginPath();
  ctx.moveTo(margin, height - margin - bracketSize);
  ctx.lineTo(margin, height - margin);
  ctx.lineTo(margin + bracketSize, height - margin);
  ctx.stroke();

  // Bottom-Right
  ctx.beginPath();
  ctx.moveTo(width - margin - bracketSize, height - margin);
  ctx.lineTo(width - margin, height - margin);
  ctx.lineTo(width - margin, height - margin - bracketSize);
  ctx.stroke();

  // 4. Center Crosshairs with Azimuth Heading
  const cx = width / 2;
  const cy = height / 2;

  ctx.strokeStyle = 'rgba(34, 197, 94, 0.85)';
  ctx.lineWidth = 1.5;

  // Outer Reticle Circle
  ctx.beginPath();
  ctx.arc(cx, cy, 60, 0, Math.PI * 2);
  ctx.stroke();

  // Inner Reticle Circle
  ctx.beginPath();
  ctx.arc(cx, cy, 24, 0, Math.PI * 2);
  ctx.stroke();

  // Cross lines
  ctx.beginPath();
  ctx.moveTo(cx - 90, cy);
  ctx.lineTo(cx - 30, cy);
  ctx.moveTo(cx + 30, cy);
  ctx.lineTo(cx + 90, cy);
  ctx.moveTo(cx, cy - 90);
  ctx.lineTo(cx, cy - 30);
  ctx.moveTo(cx, cy + 30);
  ctx.lineTo(cx, cy + 90);
  ctx.stroke();

  // Small center dot
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, Math.PI * 2);
  ctx.fill();

  // 5. Simulated Human Survivor Detection Bounding Box
  const targetX = cx + 80;
  const targetY = cy - 60;
  const targetW = 90;
  const targetH = 80;

  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  ctx.strokeRect(targetX, targetY, targetW, targetH);

  // Target tag box
  ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
  ctx.fillRect(targetX, targetY - 22, 120, 20);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('HUMAN 98.4%', targetX + 6, targetY - 8);

  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(targetX, targetY + targetH + 2, 140, 32);
  ctx.fillStyle = '#fca5a5';
  ctx.font = '9px monospace';
  ctx.fillText('TEMP: 37.1°C [FLIR LOCK]', targetX + 6, targetY + targetH + 14);
  ctx.fillText('STATUS: SURVIVOR LOCATED', targetX + 6, targetY + targetH + 26);

  // 6. TOP HEADER: Military Reconnaissance Banner
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(margin + 4, margin + 4, width - (margin * 2) - 8, 64);
  ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(margin + 4, margin + 4, width - (margin * 2) - 8, 64);

  // Header Title
  ctx.fillStyle = '#4ade80';
  ctx.font = 'bold 16px "Chakra Petch", sans-serif';
  ctx.fillText('AEROSAR AERIAL RECONNAISSANCE INTEL // SATELLITE & DRONE OPTICS', margin + 20, margin + 28);

  // Area & Call Sign
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(`TARGET SECTOR: ${areaName.toUpperCase()}`, margin + 20, margin + 48);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px monospace';
  ctx.fillText(`DRONE: ${droneModel} | PILOT: ${callSign}`, margin + 20, margin + 62);

  // Top-Right Live Classification Badge
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(width - margin - 230, margin + 14, 210, 24);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('● LIVE AREA SCAN GEO-LOCKED', width - margin - 220, margin + 30);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '10px monospace';
  ctx.fillText(`ZOOM: ${zoom}x | RESOLUTION: 0.28m GSD`, width - margin - 220, margin + 52);

  // 7. BOTTOM FOOTER: Full GPS Coordinates & Environmental Telemetry
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(margin + 4, height - margin - 72, width - (margin * 2) - 8, 64);
  ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
  ctx.strokeRect(margin + 4, height - margin - 72, width - (margin * 2) - 8, 64);

  // Telemetry row 1
  ctx.fillStyle = '#4ade80';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(
    `GPS: ${lat >= 0 ? lat.toFixed(6) + '°N' : Math.abs(lat).toFixed(6) + '°S'}, ${
      lng >= 0 ? lng.toFixed(6) + '°E' : Math.abs(lng).toFixed(6) + '°W'
    } | ALT: ${altitude.toFixed(1)}m AGL | HEADING: ${heading}°`,
    margin + 20,
    height - margin - 48
  );

  // Telemetry row 2
  const now = new Date();
  const timestampStr = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px monospace';
  ctx.fillText(
    `TIMESTAMP: ${timestampStr} | DUAL-STREAM: 4K OPTICAL RGB + FLIR BOSON LWIR | AES-256`,
    margin + 20,
    height - margin - 28
  );

  // Scale bar in bottom right
  ctx.fillStyle = '#ffffff';
  ctx.font = '10px monospace';
  ctx.fillText('SCALE: 50 METERS', width - margin - 150, height - margin - 48);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width - margin - 150, height - margin - 36);
  ctx.lineTo(width - margin - 40, height - margin - 36);
  ctx.moveTo(width - margin - 150, height - margin - 42);
  ctx.lineTo(width - margin - 150, height - margin - 30);
  ctx.moveTo(width - margin - 40, height - margin - 42);
  ctx.lineTo(width - margin - 40, height - margin - 30);
  ctx.stroke();

  // 8. Generate Data URL
  const dataUrl = canvas.toDataURL('image/png');
  return {
    id: `AEROSAR-INTEL-${Date.now()}`,
    areaName,
    lat,
    lng,
    zoom,
    altitude,
    heading,
    timestamp: timestampStr,
    createdAt: new Date().toLocaleTimeString(),
    dataUrl,
    droneModel,
    callSign,
  };
}

// Fallback grid when satellite tiles are loading or offline
function drawSyntheticAerialGrid(ctx, width, height, areaName) {
  ctx.fillStyle = '#0a101d';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(34, 197, 94, 0.15)';
  ctx.lineWidth = 1;
  const step = 40;
  for (let x = 0; x < width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Large compass radar ring
  ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, 220, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = 'rgba(74, 222, 128, 0.8)';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`TACTICAL RADAR SCAN: ${areaName.toUpperCase()}`, width / 2, height / 2 - 10);
  ctx.font = '12px monospace';
  ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
  ctx.fillText('AERIAL SATELLITE RECON SYNCHRONIZED', width / 2, height / 2 + 15);
  ctx.textAlign = 'left';
}
