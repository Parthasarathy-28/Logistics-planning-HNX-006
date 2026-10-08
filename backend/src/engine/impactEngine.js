const db = require('../db/database');

/**
 * Impact Engine: Traces DISTURBANCE -> ROUTE -> VEHICLE -> DELIVERIES -> DEADLINES
 */
function analyzeImpact(disturbanceId, customDelayMinutes = null) {
  const disturbance = db.prepare('SELECT * FROM disturbances WHERE id = ?').get(disturbanceId);
  if (!disturbance) {
    throw new Error(`Disturbance with ID ${disturbanceId} not found.`);
  }

  const route = db.prepare('SELECT * FROM routes WHERE id = ?').get(disturbance.route_id);
  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(disturbance.vehicle_id);
  
  // Get all active deliveries assigned to this vehicle & route
  const deliveries = db.prepare(`
    SELECT * FROM deliveries 
    WHERE vehicle_id = ? AND route_id = ? AND status IN ('IN_TRANSIT', 'PENDING')
  `).all(disturbance.vehicle_id, disturbance.route_id);

  // Default disruption delay based on severity or custom override
  let baseDelayMin = customDelayMinutes;
  if (!baseDelayMin) {
    switch (disturbance.severity) {
      case 'CRITICAL': baseDelayMin = 48; break;
      case 'HIGH': baseDelayMin = 35; break;
      case 'MEDIUM': baseDelayMin = 20; break;
      default: baseDelayMin = 15; break;
    }
  }

  return {
    disturbance,
    route,
    vehicle,
    deliveries,
    baseDelayMin,
    summary: {
      affected_routes_count: route ? 1 : 0,
      affected_vehicles_count: vehicle ? 1 : 0,
      affected_deliveries_count: deliveries.length
    }
  };
}

module.exports = {
  analyzeImpact
};
