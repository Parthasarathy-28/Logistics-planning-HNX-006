const API_BASE = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'API Request failed');
    }
    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  login: (username, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  getVehicles: () => request('/vehicles'),
  getRoutes: () => request('/routes'),
  
  // Driver APIs
  getDriver: (id) => request(`/driver/${id}`),
  createDisturbance: (payload) => request('/disturbances', { method: 'POST', body: JSON.stringify(payload) }),
  acknowledgePlan: (planId) => request(`/recovery/${planId}/acknowledge`, { method: 'POST' }),
  completeDelivery: (deliveryId) => request(`/deliveries/${deliveryId}/complete`, { method: 'POST' }),

  // Owner APIs
  getOwnerAlerts: () => request('/owner/alerts'),
  getDisturbances: () => request('/disturbances'),
  getDisturbance: (id) => request(`/disturbances/${id}`),

  // Intelligence Engine APIs
  analyzeImpact: (disturbanceId, delay = null) => 
    request(delay ? `/impact/${disturbanceId}?delay=${delay}` : `/impact/${disturbanceId}`),
  
  generateRecovery: (disturbanceId) => 
    request('/recovery/generate', { method: 'POST', body: JSON.stringify({ disturbanceId }) }),
  
  handleDecision: (planId, decision, selectedOptionId = null) => 
    request(`/recovery/${planId}/decision`, { method: 'POST', body: JSON.stringify({ decision, selectedOptionId }) }),
  
  sendPlanToDriver: (planId) => 
    request(`/recovery/${planId}/send`, { method: 'POST' }),

  // What-If Simulation
  runSimulation: (duration_hours) => 
    request('/simulation', { method: 'POST', body: JSON.stringify({ duration_hours }) }),

  // GPS Location & Map APIs
  updateLocation: (payload) => 
    request('/locations/update', { method: 'POST', body: JSON.stringify(payload) }),
  
  getFleetLocations: () => 
    request('/locations'),

  // Demo Controls
  resetDemo: () => request('/demo/seed', { method: 'POST' }),
  loadDemoScenario: () => request('/demo/load-scenario', { method: 'POST' })
};
