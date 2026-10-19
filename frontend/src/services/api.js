/**
 * LuminaAI — Frontend API Service Client
 * Connects React UI to Express.js Backend with Seamless Fallback
 * Authority: Smart Cities Mission & Directorate of Urban Local Bodies
 */

const rawApiUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL)
  ? String(import.meta.env.VITE_API_URL).trim()
  : '';

const API_BASE_URL = rawApiUrl
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api`)
  : '/api';

/**
 * Generic fetch wrapper with graceful error handling and timeout
 */
async function request(endpoint, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      signal: controller.signal,
      ...options,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }
    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  } catch (err) {
    clearTimeout(timeoutId);
    // Return null so the calling context can fall back to local state seamlessly
    return null;
  }
}

export const api = {
  // 1. Dashboard & KPIs
  getKpis: () => request('/dashboard/kpis'),
  getCorridors: () => request('/dashboard/corridors'),
  getEnergyChart: () => request('/dashboard/energy-chart'),

  // 2. Poles Asset Inventory
  getPoles: () => request('/poles'),
  getPole: (id) => request(`/poles/${id}`),
  setBrightness: (id, brightness) =>
    request(`/poles/${id}/brightness`, {
      method: 'PUT',
      body: JSON.stringify({ brightness }),
    }),
  triggerMotion: (id) =>
    request(`/poles/${id}/motion`, {
      method: 'POST',
    }),
  batchBrightness: (zone, brightness) =>
    request('/poles/batch-brightness', {
      method: 'POST',
      body: JSON.stringify({ zone, brightness }),
    }),
  batchMotion: (zone) =>
    request('/poles/batch-motion', {
      method: 'POST',
      body: JSON.stringify({ zone }),
    }),

  // 3. Maintenance Work Orders
  getMaintenanceOrders: () => request('/maintenance'),
  createWorkOrder: (orderData) =>
    request('/maintenance', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),
  updateWorkOrderStatus: (workOrderId, status, completionNotes) =>
    request(`/maintenance/${workOrderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, completionNotes }),
    }),

  // 4. System Audit Records
  getRecords: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/records${query ? `?${query}` : ''}`);
  },

  // 5. Incident Alerts
  getAlerts: () => request('/alerts'),
  resolveAlert: (id, notes) =>
    request(`/alerts/${id}/resolve`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
    }),

  // 6. Sustainability Analytics & SDGs
  getSdgMetrics: () => request('/analytics/sdgs'),

  // 7. AI Adaptive Engine
  getAiConfig: () => request('/ai/config'),
  updateAiConfig: (config) =>
    request('/ai/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    }),
  predictTraffic: (hour, dayOfWeek, tempC) =>
    request('/ai/predict-traffic', {
      method: 'POST',
      body: JSON.stringify({ hour, dayOfWeek, tempC }),
    }),

  // 8. Municipal User Authentication & RBAC
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  getMe: () => request('/auth/me'),
  logout: () =>
    request('/auth/logout', {
      method: 'POST',
    }),

  // 9. Simulation & Demo Lab
  seedDatabase: () =>
    request('/demo/seed', {
      method: 'POST',
    }),
  injectFault: (poleId, faultType) =>
    request('/demo/inject-fault', {
      method: 'POST',
      body: JSON.stringify({ poleId, faultType }),
    }),
  simulateTraffic: (zone, density) =>
    request('/demo/simulate-traffic', {
      method: 'POST',
      body: JSON.stringify({ zone, density }),
    }),
  ingestTelemetry: (packet) =>
    request('/telemetry/ingest', {
      method: 'POST',
      body: JSON.stringify(packet),
    }),
};

export default api;
