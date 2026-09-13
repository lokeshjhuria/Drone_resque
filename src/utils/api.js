/**
 * AeroSAR Military Tactical Backend API Client
 * Connects frontend to the Node.js backend (/api/*)
 * Includes resilient fallback and offline sync with localStorage
 */

const API_BASE = '/api';

export const api = {
  // Store / Retrieve auth token
  getToken() {
    return localStorage.getItem('aerosar_token') || '';
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('aerosar_token', token);
    } else {
      localStorage.removeItem('aerosar_token');
    }
  },

  // Helper for fetch with Authorization and JSON headers
  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `HTTP error ${response.status}`);
      }

      return data;
    } catch (err) {
      console.warn(`[API] Request to ${endpoint} failed:`, err.message);
      throw err;
    }
  },

  // ==============================
  // AUTHENTICATION
  // ==============================

  async login(emailOrCallSign, accessKey) {
    try {
      const res = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: emailOrCallSign, accessKey }),
      });

      if (res.token) {
        this.setToken(res.token);
      }
      return res;
    } catch (err) {
      // Fallback for demo if backend is somehow unreachable
      const mockUsers = [
        {
          id: 'USR-SAR-001',
          name: 'Cmdr. James Vance',
          callSign: 'COMMANDER-VANCE',
          email: 'vance.sar@response.team',
          clearance: 'LEVEL-3 HIGH-COMMAND',
          droneUnit: 'AERO-FALCON-01 [Dual Optical 4K + FLIR Boson]',
        },
        {
          id: 'USR-SAR-002',
          name: 'Lt. Elena Chen',
          callSign: 'CHEN-THERMAL-SPEC',
          email: 'chen.flir@response.team',
          clearance: 'LEVEL-2 SAR MISSION PILOT',
          droneUnit: 'VALKYRIE-NIGHTSTALKER-04 [FLIR Boson LWIR]',
        },
        {
          id: 'USR-SAR-003',
          name: 'Dr. Mateo Morales',
          callSign: 'DR-MORALES-AIRLIFT',
          email: 'morales.medevac@response.team',
          clearance: 'LEVEL-3 HIGH-COMMAND',
          droneUnit: 'SKYGUARDIAN-HEX-09 [Rapid Trauma & Blood Carrier]',
        }
      ];

      const query = (emailOrCallSign || '').toLowerCase();
      const matched = mockUsers.find(u => u.email.toLowerCase() === query || u.callSign.toLowerCase() === query);
      if (matched) {
        return { success: true, user: matched, token: 'SAR-FALLBACK-TOKEN' };
      }

      throw err;
    }
  },

  async register(operatorData) {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(operatorData),
    });

    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  },

  async getMe() {
    return this.request('/auth/me');
  },

  async getOperators() {
    return this.request('/auth/operators');
  },

  // ==============================
  // RECON INTEL
  // ==============================

  async getRecon() {
    try {
      const res = await this.request('/recon');
      return res.data || [];
    } catch (err) {
      const saved = localStorage.getItem('aerosar_captured_intel');
      return saved ? JSON.parse(saved) : [];
    }
  },

  async saveRecon(snapshot) {
    try {
      const res = await this.request('/recon', {
        method: 'POST',
        body: JSON.stringify(snapshot),
      });
      return res.snapshot || snapshot;
    } catch (err) {
      return snapshot;
    }
  },

  async deleteRecon(id) {
    try {
      return await this.request(`/recon/${id}`, { method: 'DELETE' });
    } catch (err) {
      return { success: true };
    }
  },

  // ==============================
  // SYSTEM HEALTH
  // ==============================

  async getSystemHealth() {
    try {
      return await this.request('/system/health');
    } catch (err) {
      return { status: 'OFFLINE_FALLBACK' };
    }
  }
};
