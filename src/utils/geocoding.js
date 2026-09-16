// High-Precision SAR Geocoding Engine with Coordinate Parser & Global City Index
import { DISASTER_SEARCH_PRESETS } from './areaCapture';

// Comprehensive dictionary of major Indian and global SAR-relevant locations
const GLOBAL_LOCATIONS_DATABASE = [
  // Indian Metros & Disaster / SAR Hotspots
  { name: 'New Delhi', region: 'Delhi, India', lat: 28.6139, lng: 77.2090, zoom: 13, bbox: [28.40, 28.88, 76.84, 77.35] },
  { name: 'Delhi', region: 'National Capital Territory, India', lat: 28.6517, lng: 77.2219, zoom: 12, bbox: [28.40, 28.88, 76.84, 77.35] },
  { name: 'Mumbai', region: 'Maharashtra, India', lat: 19.0760, lng: 72.8777, zoom: 12, bbox: [18.89, 19.27, 72.77, 73.00] },
  { name: 'Bengaluru', region: 'Karnataka, India', lat: 12.9716, lng: 77.5946, zoom: 12, bbox: [12.83, 13.14, 77.46, 77.78] },
  { name: 'Bangalore', region: 'Karnataka, India', lat: 12.9716, lng: 77.5946, zoom: 12, bbox: [12.83, 13.14, 77.46, 77.78] },
  { name: 'Kolkata', region: 'West Bengal, India', lat: 22.5726, lng: 88.3639, zoom: 12, bbox: [22.45, 22.65, 88.25, 88.48] },
  { name: 'Chennai', region: 'Tamil Nadu, India', lat: 13.0827, lng: 80.2707, zoom: 12, bbox: [12.90, 13.25, 80.15, 80.35] },
  { name: 'Hyderabad', region: 'Telangana, India', lat: 17.3850, lng: 78.4867, zoom: 12, bbox: [17.25, 17.55, 78.30, 78.60] },
  { name: 'Ahmedabad', region: 'Gujarat, India', lat: 23.0225, lng: 72.5714, zoom: 12, bbox: [22.90, 23.15, 72.45, 72.70] },
  { name: 'Jaipur', region: 'Rajasthan, India', lat: 26.9124, lng: 75.7873, zoom: 13, bbox: [26.75, 27.05, 75.65, 75.95] },
  { name: 'Pune', region: 'Maharashtra, India', lat: 18.5204, lng: 73.8567, zoom: 13, bbox: [18.40, 18.65, 73.70, 74.00] },
  { name: 'Surat', region: 'Gujarat, India', lat: 21.1702, lng: 72.8311, zoom: 13, bbox: [21.05, 21.30, 72.70, 72.95] },
  { name: 'Lucknow', region: 'Uttar Pradesh, India', lat: 26.8467, lng: 80.9462, zoom: 13, bbox: [26.70, 27.00, 80.80, 81.10] },
  { name: 'Chandigarh', region: 'Punjab/Haryana, India', lat: 30.7333, lng: 76.7794, zoom: 13, bbox: [30.65, 30.82, 76.70, 76.85] },
  { name: 'Kochi', region: 'Kerala, India', lat: 9.9312, lng: 76.2673, zoom: 13, bbox: [9.85, 10.05, 76.15, 76.38] },
  { name: 'Wayanad', region: 'Kerala, India', lat: 11.6854, lng: 76.1320, zoom: 12, bbox: [11.50, 11.85, 75.90, 76.35] },
  { name: 'Kedarnath', region: 'Uttarakhand, India', lat: 30.7352, lng: 79.0669, zoom: 14, bbox: [30.70, 30.77, 79.03, 79.10] },
  { name: 'Rishikesh', region: 'Uttarakhand, India', lat: 30.0869, lng: 78.2676, zoom: 14, bbox: [30.04, 30.14, 78.22, 78.32] },
  { name: 'Dehradun', region: 'Uttarakhand, India', lat: 30.3165, lng: 78.0322, zoom: 13, bbox: [30.22, 30.42, 77.93, 78.13] },
  { name: 'Shimla', region: 'Himachal Pradesh, India', lat: 31.1048, lng: 77.1734, zoom: 14, bbox: [31.06, 31.15, 77.12, 77.22] },
  { name: 'Manali', region: 'Himachal Pradesh, India', lat: 32.2432, lng: 77.1892, zoom: 14, bbox: [32.20, 32.28, 77.15, 77.23] },
  { name: 'Leh', region: 'Ladakh, India', lat: 34.1526, lng: 77.5771, zoom: 13, bbox: [34.10, 34.20, 77.52, 77.64] },
  { name: 'Ladakh', region: 'UT of Ladakh, India', lat: 34.1526, lng: 77.5771, zoom: 10, bbox: [32.00, 36.00, 75.00, 80.00] },
  { name: 'Varanasi', region: 'Uttar Pradesh, India', lat: 25.3176, lng: 82.9739, zoom: 13, bbox: [25.22, 25.40, 82.88, 83.08] },
  { name: 'Patna', region: 'Bihar, India', lat: 25.5941, lng: 85.1376, zoom: 13, bbox: [25.50, 25.68, 85.02, 85.25] },
  { name: 'Bhopal', region: 'Madhya Pradesh, India', lat: 23.2599, lng: 77.4126, zoom: 13, bbox: [23.15, 23.35, 77.30, 77.55] },
  { name: 'Indore', region: 'Madhya Pradesh, India', lat: 22.7196, lng: 75.8577, zoom: 13, bbox: [22.62, 22.80, 75.75, 75.95] },
  { name: 'Goa', region: 'Goa, India', lat: 15.2993, lng: 74.1240, zoom: 11, bbox: [14.90, 15.80, 73.65, 74.35] },
  { name: 'Guwahati', region: 'Assam, India', lat: 26.1445, lng: 91.7362, zoom: 13, bbox: [26.05, 26.24, 91.60, 91.85] },
  { name: 'Bhubaneswar', region: 'Odisha, India', lat: 20.2961, lng: 85.8245, zoom: 13, bbox: [20.18, 20.40, 85.72, 85.92] },
  { name: 'Amritsar', region: 'Punjab, India', lat: 31.6340, lng: 74.8723, zoom: 13, bbox: [31.55, 31.72, 74.78, 74.96] },
  { name: 'Noida', region: 'Uttar Pradesh, India', lat: 28.5355, lng: 77.3910, zoom: 13, bbox: [28.45, 28.62, 77.28, 77.48] },
  { name: 'Gurugram', region: 'Haryana, India', lat: 28.4595, lng: 77.0266, zoom: 13, bbox: [28.36, 28.55, 76.90, 77.12] },
  { name: 'Gurgaon', region: 'Haryana, India', lat: 28.4595, lng: 77.0266, zoom: 13, bbox: [28.36, 28.55, 76.90, 77.12] },
  { name: 'Chamoli', region: 'Uttarakhand, India', lat: 30.4225, lng: 79.3248, zoom: 12, bbox: [30.20, 30.65, 79.10, 79.60] },

  // World Metros & Strategic SAR Areas
  { name: 'New York', region: 'New York, USA', lat: 40.7128, lng: -74.0060, zoom: 12, bbox: [40.50, 40.92, -74.26, -73.70] },
  { name: 'Los Angeles', region: 'California, USA', lat: 34.0522, lng: -118.2437, zoom: 12, bbox: [33.70, 34.33, -118.67, -118.15] },
  { name: 'San Francisco', region: 'California, USA', lat: 37.7749, lng: -122.4194, zoom: 13, bbox: [37.70, 37.83, -122.52, -122.35] },
  { name: 'Chicago', region: 'Illinois, USA', lat: 41.8781, lng: -87.6298, zoom: 12, bbox: [41.64, 42.02, -87.94, -87.52] },
  { name: 'Houston', region: 'Texas, USA', lat: 29.7604, lng: -95.3698, zoom: 12, bbox: [29.50, 30.10, -95.70, -95.10] },
  { name: 'Miami', region: 'Florida, USA', lat: 25.7617, lng: -80.1918, zoom: 13, bbox: [25.70, 25.85, -80.30, -80.12] },
  { name: 'Seattle', region: 'Washington, USA', lat: 47.6062, lng: -122.3321, zoom: 12, bbox: [47.49, 47.73, -122.44, -122.24] },
  { name: 'London', region: 'England, United Kingdom', lat: 51.5074, lng: -0.1278, zoom: 12, bbox: [51.30, 51.70, -0.50, 0.30] },
  { name: 'Paris', region: 'Île-de-France, France', lat: 48.8566, lng: 2.3522, zoom: 13, bbox: [48.81, 48.90, 2.22, 2.47] },
  { name: 'Tokyo', region: 'Kanto, Japan', lat: 35.6762, lng: 139.6503, zoom: 12, bbox: [35.50, 35.85, 139.40, 139.90] },
  { name: 'Dubai', region: 'United Arab Emirates', lat: 25.2048, lng: 55.2708, zoom: 12, bbox: [25.00, 25.35, 55.10, 55.45] },
  { name: 'Singapore', region: 'Republic of Singapore', lat: 1.3521, lng: 103.8198, zoom: 12, bbox: [1.20, 1.48, 103.60, 104.05] },
  { name: 'Sydney', region: 'New South Wales, Australia', lat: -33.8688, lng: 151.2093, zoom: 12, bbox: [-34.10, -33.60, 150.90, 151.35] },
  { name: 'Toronto', region: 'Ontario, Canada', lat: 43.6532, lng: -79.3832, zoom: 12, bbox: [43.58, 43.85, -79.64, -79.12] },
  { name: 'Berlin', region: 'Berlin, Germany', lat: 52.5200, lng: 13.4050, zoom: 12, bbox: [52.35, 52.65, 13.10, 13.75] }
];

// Combine presets into location registry
DISASTER_SEARCH_PRESETS.forEach(preset => {
  GLOBAL_LOCATIONS_DATABASE.push({
    name: preset.name,
    region: preset.region,
    lat: preset.lat,
    lng: preset.lng,
    zoom: preset.zoom || 15,
    category: preset.category,
    isPreset: true,
    presetData: preset
  });
});

/**
 * Parses raw GPS coordinate strings such as:
 * "28.6139, 77.2090"
 * "34.0522 -118.2437"
 * "28.6139N, 77.2090E"
 * "40.7128° N, 74.0060° W"
 */
export function parseGpsCoordinates(query) {
  if (!query || typeof query !== 'string') return null;
  const clean = query.trim().replace(/[°]/g, '');

  // Pattern: [lat] [N/S]?[, ] [lng] [E/W]?
  const coordRegex = /^(-?\d+(?:\.\d+)?)\s*([NSEWnsew])?[\s,]+\s*(-?\d+(?:\.\d+)?)\s*([NSEWnsew])?$/;
  const match = clean.match(coordRegex);

  if (match) {
    let lat = parseFloat(match[1]);
    const latDir = (match[2] || '').toUpperCase();
    let lng = parseFloat(match[3]);
    const lngDir = (match[4] || '').toUpperCase();

    if (latDir === 'S') lat = -Math.abs(lat);
    if (latDir === 'W' && !lngDir) {
      lng = -Math.abs(lat);
    }
    if (lngDir === 'W') lng = -Math.abs(lng);
    if (lngDir === 'S') lat = -Math.abs(lat);

    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      const latStr = `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'}`;
      const lngStr = `${Math.abs(lng).toFixed(4)}°${lng >= 0 ? 'E' : 'W'}`;
      return {
        name: `GPS (${latStr}, ${lngStr})`,
        display_name: `Tactical GPS Target (${latStr}, ${lngStr})`,
        lat,
        lng,
        lon: lng,
        zoom: 16,
        type: 'COORDINATES',
        bbox: [lat - 0.005, lat + 0.005, lng - 0.006, lng + 0.006]
      };
    }
  }

  return null;
}

/**
 * Fast local dictionary lookup for instant responsiveness
 */
export function searchLocalLocations(query) {
  if (!query || typeof query !== 'string') return [];
  const q = query.toLowerCase().trim();
  if (q.length === 0) return [];

  return GLOBAL_LOCATIONS_DATABASE.filter(item => {
    const nameMatch = item.name.toLowerCase().includes(q);
    const regionMatch = item.region?.toLowerCase().includes(q);
    return nameMatch || regionMatch;
  }).map(item => ({
    display_name: `${item.name}, ${item.region || 'SAR Grid'}`,
    name: item.name,
    lat: item.lat,
    lng: item.lng,
    lon: item.lng,
    zoom: item.zoom || 14,
    bbox: item.bbox || [item.lat - 0.02, item.lat + 0.02, item.lng - 0.025, item.lng + 0.025],
    isPreset: !!item.isPreset,
    presetData: item.presetData,
    source: 'LOCAL_INDEX'
  }));
}

/**
 * Universal Area Search:
 * 1. Checks Coordinates
 * 2. Checks Instant Local Index
 * 3. Fetches OpenStreetMap Nominatim with AbortController timeout
 */
export async function resolveSearchArea(query) {
  if (!query || typeof query !== 'string') return [];
  const trimmed = query.trim();
  if (!trimmed) return [];

  // 1. Check coordinates
  const gpsResult = parseGpsCoordinates(trimmed);
  if (gpsResult) {
    return [gpsResult];
  }

  // 2. Check local instant matches
  const localMatches = searchLocalLocations(trimmed);
  const exactLocal = localMatches.find(m => m.name.toLowerCase() === trimmed.toLowerCase());

  // 3. Online Geocoding via Nominatim
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      trimmed
    )}&limit=5&addressdetails=1`;

    const res = await fetch(nominatimUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en'
      }
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const remoteResults = data.map(item => {
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          const shortName = item.name || item.display_name.split(',')[0];
          
          let zoom = 14;
          if (item.type === 'city' || item.addresstype === 'city') zoom = 13;
          else if (item.type === 'administrative' || item.addresstype === 'state') zoom = 10;
          else if (item.type === 'country') zoom = 6;
          else if (item.type === 'building' || item.type === 'amenity') zoom = 17;
          else zoom = 15;

          // Nominatim boundingbox: [south, north, west, east]
          const bbox = item.boundingbox 
            ? [parseFloat(item.boundingbox[0]), parseFloat(item.boundingbox[1]), parseFloat(item.boundingbox[2]), parseFloat(item.boundingbox[3])]
            : [lat - 0.015, lat + 0.015, lng - 0.02, lng + 0.02];

          return {
            name: shortName,
            display_name: item.display_name,
            lat,
            lng,
            lon: lng,
            zoom,
            bbox,
            type: item.type || 'LOCATION',
            source: 'NOMINATIM'
          };
        });

        // If we had an exact local match, prepend it
        if (exactLocal) {
          const filtered = remoteResults.filter(r => r.name.toLowerCase() !== exactLocal.name.toLowerCase());
          return [exactLocal, ...filtered];
        }

        return remoteResults;
      }
    }
  } catch (err) {
    console.warn('Nominatim lookup issue, using local index:', err);
  } finally {
    clearTimeout(timeoutId);
  }

  // Return local matches if remote failed
  return localMatches;
}

/**
 * Format coordinates for crisp, accurate tactical HUD display
 */
export function formatTacticalCoordinates(lat, lng) {
  if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) return '0.0000°N, 0.0000°E';
  const latStr = `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'}`;
  const lngStr = `${Math.abs(lng).toFixed(4)}°${lng >= 0 ? 'E' : 'W'}`;
  return `${latStr}, ${lngStr}`;
}
