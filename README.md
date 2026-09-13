# AEROSAR: Autonomous Drone Search & Rescue (SAR) Command Platform
### Smart India Hackathon (SIH) — Disaster Management & Rapid Aerial Triage

AEROSAR is a military-grade, autonomous airborne Search and Rescue (SAR) command and ground control station (GCS) engineered for locating stranded survivors in floods, wildfire entrapments, and alpine disaster zones using synchronized Optical (4K Ultra-HD) and Radiometric Thermal (FLIR LWIR) drone payloads.

---

## ⚡ Quick Start

### 1. Requirements
- Node.js (v18+ or v20+)
- npm (v9+)

### 2. Run Development Server (Frontend + Integrated Backend)
```bash
# Navigate to the project directory
cd "C:\Users\lokes\Downloads\SIH"

# Launch Vite development server with integrated Node.js backend
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your web browser.

### 3. Other Available Commands
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Run standalone backend API server on port 3001
npm run server
```

---

## 🛰️ System Architecture & Subsystems

### 1. Tactical Command Post & Operator Authentication
- **Tactical Khaki Theme**: Designed to MIL-STD specifications (`#E8E6DA`, `#5F7521`, `#277273`).
- **Complete Persistent Backend**:
  - `POST /api/auth/register`: Real-time operator commissioning with call sign, squadron, clearance, and password.
  - `POST /api/auth/login`: Authenticates credentials against atomic disk storage (`server/data/users.json`).
  - `GET /api/system/health`: Live telemetry link and subsystem health check.
- **Create Account Flow**: Full registration modal with immediate onboarding into the flight command console.

### 2. Dual-Spectral Vision Subsystem (4K RGB + FLIR Thermal)
- **Optical Channel (4K 60FPS)**: Wide-angle daylight and spotlight surveillance.
- **Thermal Channel (FLIR Boson 640 Radiometric)**: Long-wave infrared (LWIR) capable of piercing wildfire smoke, dense tree canopies, and midnight floodwaters.
- **Dynamic Thermal Palettes**: `Ironbow`, `White Hot`, `Black Hot`, `Rainbow`, and `Arctic`.
- **Radiometric Isotherm Analysis**: Isolates 35.5°C–37.5°C human heat signatures from 400°C forest fires and cold river water.
- **AI Target Detection (YOLO-SAR v4)**: Real-time bounding boxes with confidence percentage, GPS coordinates, distance, and hypothermia status.

### 3. Tactical Map & Global Search Relocation
- **Interactive Leaflet Radar**: Real-time GPS tracking, search grid patterns, flight heading vectors, and landing zones.
- **Global Sector Search**: Search any city, coordinate, or landmark worldwide with automatic drone deployment (`map.flyTo`).
- **Hotspot Presets**:
  - 🌊 *Brazos Valley Flood Inundation Zone*
  - 🔥 *Sierra Ridge Wildfire Smoke Sector*
  - 🏔️ *Mount Shasta Alpine LZ*
  - 🌊 *Kochi Coastal Monsoon Basin*
  - 🏙️ *Downtown Metro Sector Bravo*
  - 🏔️ *Rishikesh Valley SAR Base*

### 4. Live Aerial Reconnaissance Vault
- **Live Recon Snapshot Capture**: Stitches live satellite imagery with flight telemetry, HUD crosshairs, detected targets, and environmental data into high-resolution 1280×800 reconnaissance intel photos.
- **Recon Intel Vault**: Review, filter, and download PNG aerial photographs directly to local storage.
- **Backend Disk Persistence**: All captured intel is saved to `server/data/recon.json`.

### 5. Multi-Agency Emergency SOS Dispatch
- **Automated Rescue Alert**: Dispatches ground paramedics, hospital ICU trauma units, blood bank universal donor couriers, and LifeFlight medical helicopters with one click.
- **Payload Release**: Autonomous deployment of Buoyancy Life-Rafts and First-Aid / Blood Supply Trauma Pods.

---

## 📁 Project Directory Structure

```text
SIH/
├── server/                      # Persistent Node.js Backend
│   ├── data/
│   │   ├── users.json           # Atomic user accounts & credentials
│   │   ├── missions.json        # Persistent SAR missions
│   │   └── recon.json           # Archived aerial reconnaissance captures
│   ├── apiRouter.js             # Express API router mounted in Vite
│   └── server.js                # Standalone Express server (Port 3001)
├── src/
│   ├── components/
│   │   ├── auth/                # Login, Create Account Modal, HUD Radar
│   │   └── dashboard/           # Dual Camera View, Tactical Map, Telemetry Bar,
│   │                            # SOS Modal, Recon Vault, Payload Controls
│   ├── context/
│   │   └── DroneContext.jsx     # Central telemetry & mission state manager
│   ├── utils/
│   │   ├── api.js               # Frontend API client with offline fallback
│   │   ├── areaCapture.js       # Live satellite reconnaissance snapshot generator
│   │   └── audioAlerts.js       # Web Audio API tactical sound synthesis
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
│   └── assets/                  # Disaster photography & drone media assets
├── index.html
├── vite.config.js               # Vite config with backend middleware plugin
├── tailwind.config.js
└── package.json
```

---

## 🛡️ Default Pre-Configured Operator Accounts

| Call Sign | Email | Default Key | Clearance | Role |
| :--- | :--- | :--- | :--- | :--- |
| `COMMANDER-VANCE` | `vance.sar@response.team` | `SAR-ALPHA-PASS` | Level-3 High-Command | Mission Flight Commander |
| `CHEN-THERMAL-SPEC` | `chen.flir@response.team` | `SAR-BRAVO-PASS` | Level-2 SAR Pilot | Thermal Recon Specialist |
| `DR-MORALES-AIRLIFT` | `morales.medevac@response.team` | `SAR-MEDIC-PASS` | Level-3 High-Command | Flight Surgeon / Trauma Lead |
| `BASE-OPERATOR` | `operator@response.team` | `SAR-KEY-8924` | Level-3 High-Command | Chief SAR Dispatcher |

*Note: You can also use **"Create an account"** on the login page to register any custom operator with instant persistence.*
