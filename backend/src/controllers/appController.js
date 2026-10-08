const db = require('../db/database');
const seedDatabase = require('../db/seed');
const { analyzeImpact } = require('../engine/impactEngine');
const { calculateDeliveryRisks } = require('../engine/riskEngine');
const { generateRecoveryOptions } = require('../engine/recoveryEngine');
const { scoreRecoveryOptions } = require('../engine/scoringEngine');

// 1. Auth Login
function login(req, res) {
  try {
    const { role, username } = req.body;
    let user;

    if (role === 'DRIVER') {
      user = db.prepare("SELECT * FROM users WHERE role = 'DRIVER' LIMIT 1").get();
    } else {
      user = db.prepare("SELECT * FROM users WHERE role = 'OWNER' LIMIT 1").get();
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let driver = null;
    let vehicle = null;
    let route = null;

    if (user.role === 'DRIVER' && user.driver_id) {
      driver = db.prepare('SELECT * FROM drivers WHERE id = ?').get(user.driver_id);
      if (driver && driver.current_vehicle_id) {
        vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(driver.current_vehicle_id);
      }
      if (driver && driver.current_route_id) {
        route = db.prepare('SELECT * FROM routes WHERE id = ?').get(driver.current_route_id);
      }
    }

    res.json({
      success: true,
      user,
      driver,
      vehicle,
      route
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 2. Driver Info & Active Dashboard State
function getDriver(req, res) {
  try {
    const driverId = req.params.id || 'DRV04';
    const driver = db.prepare('SELECT * FROM drivers WHERE id = ?').get(driverId);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(driver.current_vehicle_id);
    const route = db.prepare('SELECT * FROM routes WHERE id = ?').get(driver.current_route_id);

    const deliveries = db.prepare(`
      SELECT * FROM deliveries 
      WHERE vehicle_id = ? OR route_id = ?
    `).all(driver.current_vehicle_id, driver.current_route_id);

    // Check for active disturbance reported by this driver
    const disturbance = db.prepare(`
      SELECT * FROM disturbances 
      WHERE driver_id = ? 
      ORDER BY timestamp DESC LIMIT 1
    `).get(driverId);

    // Check for active recovery plan sent to driver
    let recoveryPlan = null;
    let planActions = [];
    if (disturbance) {
      recoveryPlan = db.prepare(`
        SELECT * FROM recovery_plans 
        WHERE disturbance_id = ? AND status IN ('SENT', 'APPROVED', 'DRIVER_ACKNOWLEDGED', 'IN_PROGRESS', 'COMPLETED')
        ORDER BY created_at DESC LIMIT 1
      `).get(disturbance.id);

      if (recoveryPlan) {
        planActions = db.prepare('SELECT * FROM plan_actions WHERE plan_id = ?').all(recoveryPlan.id);
      }
    }

    res.json({
      driver,
      vehicle,
      route,
      deliveries,
      activeDisturbance: disturbance,
      activeRecoveryPlan: recoveryPlan,
      planActions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 3. Owner Alerts
function getOwnerAlerts(req, res) {
  try {
    const activeDisturbances = db.prepare(`
      SELECT * FROM disturbances 
      ORDER BY timestamp DESC
    `).all();

    const alerts = activeDisturbances.map(dist => {
      const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(dist.vehicle_id);
      const route = db.prepare('SELECT * FROM routes WHERE id = ?').get(dist.route_id);
      const plan = db.prepare('SELECT * FROM recovery_plans WHERE disturbance_id = ? LIMIT 1').get(dist.id);

      return {
        ...dist,
        vehicle_code: vehicle ? vehicle.vehicle_code : dist.vehicle_id,
        route_code: route ? route.route_code : dist.route_id,
        has_plan: !!plan,
        plan_status: plan ? plan.status : 'NO_PLAN'
      };
    });

    const totalVehicles = db.prepare('SELECT COUNT(*) as count FROM vehicles').get().count;
    const activeRoutes = db.prepare("SELECT COUNT(*) as count FROM routes WHERE status = 'NORMAL'").get().count;

    res.json({
      alerts,
      activeDisturbancesCount: activeDisturbances.length,
      fleetSummary: {
        totalVehicles,
        activeRoutes
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 4. Report Disturbance (Driver API)
function createDisturbance(req, res) {
  try {
    const {
      driver_id = 'DRV04',
      vehicle_id = 'V04',
      route_id = 'R03',
      input_method = 'TAP',
      category = 'VEHICLE',
      type = 'ENGINE_ISSUE',
      description = 'Engine stopped near route R03',
      latitude = 12.9716,
      longitude = 77.5946,
      severity = 'CRITICAL',
      language = 'ta-IN',
      original_transcript = null,
      normalized_transcript = null,
      confidence = null
    } = req.body;

    const driver = db.prepare('SELECT * FROM drivers WHERE id = ?').get(driver_id);
    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(vehicle_id);
    const route = db.prepare('SELECT * FROM routes WHERE id = ?').get(route_id);

    const disturbanceId = 'DIST_' + Date.now();
    const disturbanceCode = 'DST-' + String(Math.floor(Math.random() * 900) + 100);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const insert = db.prepare(`
      INSERT INTO disturbances (
        id, disturbance_code, driver_id, driver_name, vehicle_id, vehicle_number,
        route_id, route_name, input_method, category, type, description,
        latitude, longitude, timestamp, severity, status,
        language, original_transcript, normalized_transcript, confidence
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      disturbanceId,
      disturbanceCode,
      driver_id,
      driver ? driver.name : 'Alex Driver',
      vehicle_id,
      vehicle ? vehicle.vehicle_code : 'V04',
      route_id,
      route ? route.name : 'R03',
      input_method,
      category,
      type,
      description,
      latitude,
      longitude,
      timestamp,
      severity,
      'Reported',
      language,
      original_transcript || description,
      normalized_transcript || description,
      confidence ? parseFloat(confidence) : null
    );

    // Update vehicle and route status to reflect disruption
    db.prepare("UPDATE vehicles SET status = 'DISRUPTED' WHERE id = ?").run(vehicle_id);
    db.prepare("UPDATE routes SET status = 'DISRUPTED' WHERE id = ?").run(route_id);
    db.prepare("UPDATE drivers SET status = 'DISRUPTED' WHERE id = ?").run(driver_id);

    const created = db.prepare('SELECT * FROM disturbances WHERE id = ?').get(disturbanceId);

    res.status(201).json({
      success: true,
      message: 'Disturbance reported successfully.',
      disturbance: created
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 5. Get Disturbance Details
function getDisturbance(req, res) {
  try {
    const { id } = req.params;
    const disturbance = db.prepare('SELECT * FROM disturbances WHERE id = ?').get(id);
    if (!disturbance) {
      return res.status(404).json({ error: 'Disturbance not found' });
    }

    const driver = db.prepare('SELECT * FROM drivers WHERE id = ?').get(disturbance.driver_id);
    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(disturbance.vehicle_id);
    const route = db.prepare('SELECT * FROM routes WHERE id = ?').get(disturbance.route_id);

    res.json({
      disturbance,
      driver,
      vehicle,
      route
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 6. Get All Disturbances
function getAllDisturbances(req, res) {
  try {
    const list = db.prepare('SELECT * FROM disturbances ORDER BY timestamp DESC').all();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 7. Analyze Impact
function getImpactAnalysis(req, res) {
  try {
    const disturbanceId = req.params.disturbanceId || req.body.disturbanceId;
    const customDelay = req.query.delay ? parseInt(req.query.delay) : null;

    const impactData = analyzeImpact(disturbanceId, customDelay);
    const riskAnalysis = calculateDeliveryRisks(impactData.deliveries, impactData.baseDelayMin);

    res.json({
      disturbance: impactData.disturbance,
      route: impactData.route,
      vehicle: impactData.vehicle,
      impactSummary: impactData.summary,
      baseDelayMin: impactData.baseDelayMin,
      analyzedDeliveries: riskAnalysis.analyzedDeliveries,
      riskSummary: riskAnalysis.summary,
      cascade: {
        routeCode: impactData.route ? impactData.route.route_code : 'R03',
        vehicleCode: impactData.vehicle ? impactData.vehicle.vehicle_code : 'V04',
        deliveries: riskAnalysis.analyzedDeliveries.map(d => ({
          code: d.delivery_code,
          customer: d.customer_name,
          risk: d.risk_level,
          isCritical: d.is_deadline_at_risk
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 8. Generate Recovery Options & Recommendation
function generateRecovery(req, res) {
  try {
    const disturbanceId = req.body.disturbanceId || req.params.disturbanceId;
    const impactData = analyzeImpact(disturbanceId);

    const options = generateRecoveryOptions(impactData);
    const scoringResult = scoreRecoveryOptions(options, impactData);

    // Save or update Recovery Plan in DB
    let plan = db.prepare('SELECT * FROM recovery_plans WHERE disturbance_id = ?').get(disturbanceId);
    const planId = plan ? plan.id : 'PLAN_' + Date.now();
    const createdAt = new Date().toISOString();

    if (plan) {
      db.prepare(`
        UPDATE recovery_plans 
        SET recommended_action_type = ?, score = ?, explanation = ?, before_metrics = ?, after_metrics = ?
        WHERE id = ?
      `).run(
        scoringResult.recommendedOption.action_type,
        scoringResult.recommendedOption.score,
        scoringResult.explanation,
        JSON.stringify(scoringResult.beforeMetrics),
        JSON.stringify(scoringResult.afterMetrics),
        planId
      );
    } else {
      db.prepare(`
        INSERT INTO recovery_plans (
          id, disturbance_id, recommended_action_type, score, explanation, status, before_metrics, after_metrics, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        planId,
        disturbanceId,
        scoringResult.recommendedOption.action_type,
        scoringResult.recommendedOption.score,
        scoringResult.explanation,
        'DRAFT',
        JSON.stringify(scoringResult.beforeMetrics),
        JSON.stringify(scoringResult.afterMetrics),
        createdAt
      );
    }

    // Insert or update plan actions
    db.prepare('DELETE FROM plan_actions WHERE plan_id = ?').run(planId);
    const insertAction = db.prepare(`
      INSERT INTO plan_actions (
        id, plan_id, delivery_id, action_type, original_vehicle_id, new_vehicle_id, expected_delay_min, score, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    scoringResult.scoredOptions.forEach((opt, idx) => {
      insertAction.run(
        'ACT_' + planId + '_' + idx,
        planId,
        opt.target_delivery_id || 'D101',
        opt.action_type,
        opt.original_vehicle_id,
        opt.new_vehicle_id,
        opt.estimated_delay_min,
        opt.score,
        opt.id === scoringResult.recommendedOption.id ? 'RECOMMENDED' : 'PROPOSED'
      );
    });

    const savedPlan = db.prepare('SELECT * FROM recovery_plans WHERE id = ?').get(planId);

    res.json({
      plan: savedPlan,
      recommendedOption: scoringResult.recommendedOption,
      explanation: scoringResult.explanation,
      options: scoringResult.scoredOptions,
      beforeMetrics: scoringResult.beforeMetrics,
      afterMetrics: scoringResult.afterMetrics
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 9. Owner Decision (ACCEPT / REJECT / MODIFY)
function handleDecision(req, res) {
  try {
    const { id } = req.params; // planId or disturbanceId
    const { decision, selectedOptionId } = req.body; // 'ACCEPT' | 'REJECT' | 'MODIFY'

    const validDecisions = ['ACCEPT', 'REJECT', 'MODIFY'];
    if (!decision || typeof decision !== 'string' || !validDecisions.includes(decision.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid decision. Allowed values: ACCEPT, REJECT, MODIFY'
      });
    }

    let plan = db.prepare('SELECT * FROM recovery_plans WHERE id = ? OR disturbance_id = ?').get(id, id);
    if (!plan) {
      return res.status(404).json({ error: 'Recovery plan not found' });
    }

    const upperDecision = decision.toUpperCase();
    let status = 'APPROVED';
    if (upperDecision === 'REJECT') status = 'REJECTED';
    if (upperDecision === 'MODIFY') status = 'MODIFIED';

    db.prepare('UPDATE recovery_plans SET status = ? WHERE id = ?').run(status, plan.id);
    db.prepare('UPDATE disturbances SET status = ? WHERE id = ?').run('PLAN_' + status, plan.disturbance_id);

    const updatedPlan = db.prepare('SELECT * FROM recovery_plans WHERE id = ?').get(plan.id);

    res.json({
      success: true,
      message: `Recovery plan ${status.toLowerCase()} by Owner.`,
      plan: updatedPlan
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 10. Send Plan to Driver
function sendPlanToDriver(req, res) {
  try {
    const { id } = req.params;
    let plan = db.prepare('SELECT * FROM recovery_plans WHERE id = ? OR disturbance_id = ?').get(id, id);
    if (!plan) {
      return res.status(404).json({ error: 'Recovery plan not found' });
    }

    db.prepare("UPDATE recovery_plans SET status = 'SENT' WHERE id = ?").run(plan.id);
    db.prepare("UPDATE disturbances SET status = 'PLAN_SENT' WHERE id = ?").run(plan.disturbance_id);

    res.json({
      success: true,
      message: 'New recovery plan sent to driver dashboard.',
      planStatus: 'SENT'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 11. Driver Acknowledge Plan
function acknowledgePlan(req, res) {
  try {
    const { id } = req.params;
    let plan = db.prepare('SELECT * FROM recovery_plans WHERE id = ? OR disturbance_id = ?').get(id, id);
    if (!plan) {
      return res.status(404).json({ error: 'Recovery plan not found' });
    }

    db.prepare("UPDATE recovery_plans SET status = 'DRIVER_ACKNOWLEDGED' WHERE id = ?").run(plan.id);
    db.prepare("UPDATE disturbances SET status = 'DRIVER_ACKNOWLEDGED' WHERE id = ?").run(plan.disturbance_id);

    // Reassign target delivery D101 to V05 in DB
    db.prepare("UPDATE deliveries SET vehicle_id = 'V05', status = 'REASSIGNED' WHERE id = 'D101'").run();

    res.json({
      success: true,
      message: 'Driver acknowledged new plan. Recovery in progress.',
      planStatus: 'DRIVER_ACKNOWLEDGED'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 12. Complete Delivery
function completeDelivery(req, res) {
  try {
    const { id } = req.params; // deliveryId or disturbanceId
    db.prepare("UPDATE deliveries SET status = 'DELIVERED' WHERE id = ? OR vehicle_id = 'V04'").run(id);
    db.prepare("UPDATE disturbances SET status = 'COMPLETED' WHERE status != 'COMPLETED'").run();
    db.prepare("UPDATE recovery_plans SET status = 'COMPLETED' WHERE status != 'COMPLETED'").run();
    db.prepare("UPDATE vehicles SET status = 'ACTIVE' WHERE id IN ('V04', 'V05')").run();

    res.json({
      success: true,
      message: 'Delivery completed successfully.',
      status: 'DELIVERY_COMPLETED'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 13. What-If Simulation API
function runSimulation(req, res) {
  try {
    const { duration_hours = 4 } = req.body;
    const delayMinutes = duration_hours * 15; // 2h -> 30m, 4h -> 60m, 6h -> 90m, 8h -> 120m

    // Get current active disturbance or mock default
    const disturbance = db.prepare('SELECT * FROM disturbances ORDER BY timestamp DESC LIMIT 1').get();
    const disturbanceId = disturbance ? disturbance.id : 'MOCK';

    let impactData;
    if (disturbance) {
      impactData = analyzeImpact(disturbanceId, delayMinutes);
    } else {
      impactData = {
        disturbance: { route_name: 'R03', vehicle_number: 'V04' },
        route: { route_code: 'R03' },
        vehicle: { vehicle_code: 'V04' },
        deliveries: db.prepare("SELECT * FROM deliveries WHERE route_id = 'R03'").all(),
        baseDelayMin: delayMinutes
      };
    }

    const riskAnalysis = calculateDeliveryRisks(impactData.deliveries, delayMinutes);
    const options = generateRecoveryOptions(impactData);
    const scoringResult = scoreRecoveryOptions(options, impactData);

    res.json({
      durationHours: duration_hours,
      simulatedDelayMin: delayMinutes,
      riskSummary: riskAnalysis.summary,
      analyzedDeliveries: riskAnalysis.analyzedDeliveries,
      recommendedOption: scoringResult.recommendedOption,
      explanation: scoringResult.explanation,
      scores: scoringResult.scoredOptions.map(o => ({ title: o.title, score: o.score, delay: o.estimated_delay_min }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 14. Demo Controls: Seed & Load Scenario
function resetDemo(req, res) {
  try {
    seedDatabase();
    res.json({ success: true, message: 'Database reset to initial demo state.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function loadDemoScenario(req, res) {
  try {
    seedDatabase();

    // Auto-create Engine Issue disturbance on R03 for V04 by DRV04
    const disturbanceId = 'DIST_DEMO_R03';
    const insert = db.prepare(`
      INSERT INTO disturbances (
        id, disturbance_code, driver_id, driver_name, vehicle_id, vehicle_number,
        route_id, route_name, input_method, category, type, description,
        latitude, longitude, timestamp, severity, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      disturbanceId,
      'DST-101',
      'DRV04',
      'Alex Driver',
      'V04',
      'V04',
      'R03',
      'Industrial Corridor South',
      'TAP',
      'VEHICLE',
      'ENGINE_ISSUE',
      'Engine stopped near route R03 (Mile 18)',
      12.9716,
      77.5946,
      '10:42 AM',
      'CRITICAL',
      'Reported'
    );

    db.prepare("UPDATE vehicles SET status = 'DISRUPTED' WHERE id = 'V04'").run();
    db.prepare("UPDATE routes SET status = 'DISRUPTED' WHERE id = 'R03'").run();
    db.prepare("UPDATE drivers SET status = 'DISRUPTED' WHERE id = 'DRV04'").run();

    const disturbance = db.prepare('SELECT * FROM disturbances WHERE id = ?').get(disturbanceId);

    res.json({
      success: true,
      message: 'Demo scenario loaded: Critical Engine Issue on R03 (Vehicle V04).',
      disturbance
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  login,
  getDriver,
  getOwnerAlerts,
  createDisturbance,
  getDisturbance,
  getAllDisturbances,
  getImpactAnalysis,
  generateRecovery,
  handleDecision,
  sendPlanToDriver,
  acknowledgePlan,
  completeDelivery,
  runSimulation,
  resetDemo,
  loadDemoScenario
};
