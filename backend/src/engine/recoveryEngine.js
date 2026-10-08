const db = require('../db/database');
const { calculateDeliveryRisks } = require('./riskEngine');

/**
 * Recovery Engine: Generates possible alternative recovery actions for a given disruption & impact.
 */
function generateRecoveryOptions(impactData) {
  const { deliveries, baseDelayMin, vehicle, route } = impactData;

  // Find spare/available replacement vehicle
  const spareVehicle = db.prepare(`
    SELECT * FROM vehicles 
    WHERE status = 'AVAILABLE' AND id != ? 
    LIMIT 1
  `).get(vehicle.id) || { id: 'V05', vehicle_code: 'V05', plate_number: 'KA-05-EE-5005', type: 'Spare Express Van' };

  const options = [];

  // OPTION 1: CHANGE VEHICLE (Reassign critical delivery D101 to V05)
  // Reassigning critical package D101 to V05 takes ~10 min transfer time. V05 drives direct route.
  const changeVehicleDelay = 10;
  const changeVehicleRisks = calculateDeliveryRisks(deliveries, changeVehicleDelay);

  options.push({
    id: 'opt_change_vehicle',
    action_type: 'CHANGE_VEHICLE',
    title: 'Change Vehicle (Reassign D101 to V05)',
    description: `Reassign critical delivery D101 from ${vehicle.vehicle_code} to standby replacement vehicle ${spareVehicle.vehicle_code} (${spareVehicle.plate_number}).`,
    target_delivery_id: 'D101',
    target_delivery_code: 'D101',
    original_vehicle_id: vehicle.id,
    new_vehicle_id: spareVehicle.id,
    new_vehicle_code: spareVehicle.vehicle_code,
    estimated_delay_min: changeVehicleDelay,
    affected_deliveries_count: 1,
    critical_risks_remaining: 0,
    risk_level: 'LOW',
    deliveries_impact: changeVehicleRisks.analyzedDeliveries,
    feasibility: 'HIGH',
    resource_notes: `Spare vehicle ${spareVehicle.vehicle_code} is stationed at Hub North and ready for immediate deployment.`
  });

  // OPTION 2: NEW ROUTE (Reroute V04 around obstacle)
  const rerouteDelay = Math.max(25, Math.round(baseDelayMin * 0.7)); // e.g., 35 min
  const rerouteRisks = calculateDeliveryRisks(deliveries, rerouteDelay);

  options.push({
    id: 'opt_new_route',
    action_type: 'NEW_ROUTE',
    title: 'Reroute Vehicle (Bypass R03 via East Highway)',
    description: `Reroute ${vehicle.vehicle_code} around the disruption corridor using East Highway detour.`,
    target_delivery_id: null,
    target_delivery_code: 'ALL',
    original_vehicle_id: vehicle.id,
    new_vehicle_id: vehicle.id,
    estimated_delay_min: rerouteDelay,
    affected_deliveries_count: deliveries.length,
    critical_risks_remaining: rerouteRisks.summary.critical_risks,
    risk_level: rerouteRisks.summary.critical_risks > 0 ? 'HIGH' : 'MEDIUM',
    deliveries_impact: rerouteRisks.analyzedDeliveries,
    feasibility: 'MEDIUM',
    resource_notes: 'Requires 14 km additional travel distance via East Highway.'
  });

  // OPTION 3: USE DRONE (Dispatch emergency cargo drone for D101)
  const droneDelay = 15;
  const droneRisks = calculateDeliveryRisks(deliveries, droneDelay);

  options.push({
    id: 'opt_use_drone',
    action_type: 'USE_DRONE',
    title: 'Dispatch Emergency Drone (D101 Delivery)',
    description: `Deploy high-speed cargo drone (Payload capacity 15kg) directly from Hub South to Apex Tech Solutions for D101.`,
    target_delivery_id: 'D101',
    target_delivery_code: 'D101',
    original_vehicle_id: vehicle.id,
    new_vehicle_id: 'DRONE_01',
    estimated_delay_min: droneDelay,
    affected_deliveries_count: 1,
    critical_risks_remaining: 0,
    risk_level: 'LOW',
    deliveries_impact: droneRisks.analyzedDeliveries,
    feasibility: 'HIGH',
    resource_notes: 'Drone DRONE-01 is charged and available at Hub South launchpad.'
  });

  // OPTION 4: RESCHEDULE (Reschedule D103 to later slot)
  const rescheduleDelay = 50;
  options.push({
    id: 'opt_reschedule',
    action_type: 'RESCHEDULE',
    title: 'Reschedule Non-Critical Delivery (D103)',
    description: 'Postpone standard priority delivery D103 to tomorrow morning slot to allow driver to complete D101 and D102.',
    target_delivery_id: 'D103',
    target_delivery_code: 'D103',
    original_vehicle_id: vehicle.id,
    new_vehicle_id: vehicle.id,
    estimated_delay_min: rescheduleDelay,
    affected_deliveries_count: 1,
    critical_risks_remaining: 1,
    risk_level: 'MEDIUM',
    deliveries_impact: calculateDeliveryRisks(deliveries.filter(d => d.id !== 'D103'), baseDelayMin).analyzedDeliveries,
    feasibility: 'MEDIUM',
    resource_notes: 'Requires customer notification for Omni Retailers reschedule.'
  });

  // OPTION 5: CANCEL DELIVERY (Cancel D101)
  options.push({
    id: 'opt_cancel',
    action_type: 'CANCEL_DELIVERY',
    title: 'Cancel Critical Delivery D101',
    description: 'Cancel shipment D101 to relieve vehicle payload and attempt immediate recovery for remaining deliveries.',
    target_delivery_id: 'D101',
    target_delivery_code: 'D101',
    original_vehicle_id: vehicle.id,
    new_vehicle_id: null,
    estimated_delay_min: 0,
    affected_deliveries_count: 1,
    critical_risks_remaining: 0,
    risk_level: 'CRITICAL',
    deliveries_impact: [],
    feasibility: 'LOW',
    resource_notes: 'Triggers severe SLA penalty and customer dissatisfaction.'
  });

  return options;
}

module.exports = {
  generateRecoveryOptions
};
