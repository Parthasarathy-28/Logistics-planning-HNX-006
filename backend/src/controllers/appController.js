const db = require('../db/database');
const seedDatabase = require('../db/seed');
const { analyzeImpact } = require('../engine/impactEngine');
const { calculateDeliveryRisks } = require('../engine/riskEngine');
const { generateRecoveryOptions } = require('../engine/recoveryEngine');
const { scoreRecoveryOptions } = require('../engine/scoringEngine');

const bcrypt = require('bcryptjs');

// 1. Auth Login
function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    const trimmedUser = username.trim();

    // Query user by username
    const user = db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)').get(trimmedUser);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      });
    }

    // Check account status
    if (user.status === 'INACTIVE') {
      return res.status(403).json({
        success: false,
        error: 'Account is inactive'
      });
    }

    // Verify bcrypt password hash
    let passwordValid = false;
    if (user.password_hash) {
      passwordValid = bcrypt.compareSync(password, user.password_hash);
    }

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      });
    }

    let driver = null;
    let vehicle = null;
    let route = null;

    if (user.role === 'DRIVER') {
      if (user.driver_id) {
        driver = db.prepare('SELECT * FROM drivers WHERE id = ?').get(user.driver_id);
      }
      if (!driver) {
        driver = db.prepare('SELECT * FROM drivers WHERE user_id = ?').get(user.id);
      }
      if (driver && driver.current_vehicle_id) {
        vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(driver.current_vehicle_id);
      }
      if (driver && driver.current_route_id) {
        route = db.prepare('SELECT * FROM routes WHERE id = ?').get(driver.current_route_id);
      }
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      driverId: driver ? driver.id : (user.driver_id || 'DRV04'),
      vehicleId: vehicle ? vehicle.id : (driver ? driver.current_vehicle_id : 'V04'),
      routeId: route ? route.id : (driver ? driver.current_route_id : 'R03')
    };

    res.json({
      success: true,
      user: safeUser,
      driver,
      vehicle,
      route
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// 1b. Auth Register
function register(req, res) {
  try {
    const { name, username, password, confirmPassword, role, vehicleId, routeId } = req.body;

    if (!name || !username || !password || !confirmPassword || !role) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required.'
      });
    }

    const trimmedName = name.trim();
    const trimmedUser = username.trim();

    if (trimmedUser.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Username must be at least 3 characters.'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Passwords do not match.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters.'
      });
    }

    const upperRole = role.toUpperCase();
    if (upperRole !== 'OWNER' && upperRole !== 'DRIVER') {
      return res.status(400).json({
        success: false,
        error: 'Role must be OWNER or DRIVER.'
      });
    }

    // Check duplicate username (case-insensitive)
    const existing = db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)').get(trimmedUser);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Username already exists. Please choose another username.'
      });
    }

    const userId = 'USR_' + Date.now();
    const passwordHash = bcrypt.hashSync(password, 10);
    const createdAt = new Date().toISOString();

    let driverId = null;

    if (upperRole === 'DRIVER') {
      const targetVehicleId = vehicleId || 'V04';
      const targetRouteId = routeId || 'R03';

      driverId = 'DRV_' + Date.now();

      // Insert driver profile record
      const insertDriver = db.prepare(`
        INSERT INTO drivers (id, user_id, driver_code, name, status, current_vehicle_id, current_route_id, latitude, longitude)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertDriver.run(driverId, userId, driverId, trimmedName, 'ON_DELIVERY', targetVehicleId, targetRouteId, 12.9716, 77.5946);

      // Assign driver name & active status to selected vehicle
      db.prepare("UPDATE vehicles SET driver_name = ?, status = 'ACTIVE' WHERE id = ?").run(trimmedName, targetVehicleId);
    }

    const insertUser = db.prepare(`
      INSERT INTO users (id, name, username, password_hash, role, status, driver_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertUser.run(userId, trimmedName, trimmedUser, passwordHash, upperRole, 'ACTIVE', driverId, createdAt);

    const safeUser = {
      id: userId,
      name: trimmedName,
      username: trimmedUser,
      role: upperRole,
      ...(driverId ? { driverId, vehicleId: vehicleId || 'V04', routeId: routeId || 'R03' } : {})
    };

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please log in.',
      user: safeUser
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

function getVehicles(req, res) {
  try {
    const vehicles = db.prepare('SELECT * FROM vehicles').all();
    res.json({ success: true, vehicles });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

function getRoutes(req, res) {
  try {
    const routes = db.prepare('SELECT * FROM routes').all();
    res.json({ success: true, routes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
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

// 15. GPS Update API (Driver Browser Location Stream)
function updateLocation(req, res) {
  try {
    const {
      vehicleId = 'V04',
      driverId = 'DRV04',
      latitude,
      longitude,
      accuracy = null,
      speed = null,
      heading = null,
      source = 'LIVE_GPS'
    } = req.body;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lng) || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        error: 'Invalid latitude or longitude coordinates.'
      });
    }

    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, error: `Vehicle ${vehicleId} not found.` });
    }

    const locId = 'LOC_' + vehicleId;
    const timestamp = new Date().toISOString();

    // Upsert into vehicle_locations
    const existing = db.prepare('SELECT * FROM vehicle_locations WHERE vehicle_id = ?').get(vehicleId);
    if (existing) {
      db.prepare(`
        UPDATE vehicle_locations 
        SET driver_id = ?, latitude = ?, longitude = ?, accuracy = ?, speed = ?, heading = ?, source = ?, timestamp = ?
        WHERE vehicle_id = ?
      `).run(driverId, lat, lng, accuracy, speed, heading, source, timestamp, vehicleId);
    } else {
      db.prepare(`
        INSERT INTO vehicle_locations (id, vehicle_id, driver_id, latitude, longitude, accuracy, speed, heading, source, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(locId, vehicleId, driverId, lat, lng, accuracy, speed, heading, source, timestamp);
    }

    // Update drivers & vehicles tables
    db.prepare('UPDATE drivers SET latitude = ?, longitude = ? WHERE id = ? OR current_vehicle_id = ?').run(lat, lng, driverId, vehicleId);
    db.prepare('UPDATE vehicles SET current_location = ? WHERE id = ?').run(`${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`, vehicleId);

    res.json({
      success: true,
      vehicleId,
      driverId,
      latitude: lat,
      longitude: lng,
      accuracy,
      speed,
      heading,
      source,
      timestamp
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// 16. Fleet Location API for Owner Dashboard Map
function getFleetLocations(req, res) {
  try {
    const vehicles = db.prepare('SELECT * FROM vehicles').all();
    const drivers = db.prepare('SELECT * FROM drivers').all();
    const locations = db.prepare('SELECT * FROM vehicle_locations').all();
    const activeDisruptions = db.prepare("SELECT * FROM disturbances WHERE status != 'COMPLETED'").all();
    const activeDeliveries = db.prepare("SELECT * FROM deliveries WHERE status IN ('IN_TRANSIT', 'PENDING', 'REASSIGNED')").all();

    const fleetVehicles = vehicles.map(veh => {
      const driver = drivers.find(d => d.current_vehicle_id === veh.id) || { id: null, name: veh.driver_name || 'Unassigned' };
      const loc = locations.find(l => l.vehicle_id === veh.id);

      // Default fallback coordinates if location record not present
      let lat = 12.9716;
      let lng = 77.5946;
      let source = 'SIMULATED_GPS';

      if (loc) {
        lat = loc.latitude;
        lng = loc.longitude;
        source = loc.source || 'LIVE_GPS';
      } else if (veh.id === 'V01') { lat = 13.0827; lng = 80.2707; }
      else if (veh.id === 'V02') { lat = 12.9250; lng = 77.5890; }
      else if (veh.id === 'V03') { lat = 12.9350; lng = 77.6200; }
      else if (veh.id === 'V04') { lat = 12.9716; lng = 77.5946; }
      else if (veh.id === 'V05') { lat = 13.0400; lng = 77.5900; }

      return {
        vehicleId: veh.id,
        vehicleNumber: veh.plate_number,
        vehicleCode: veh.vehicle_code,
        type: veh.type,
        driverId: driver.id || 'DRV04',
        driverName: driver.name || veh.driver_name || 'Driver',
        status: veh.status,
        routeId: driver.current_route_id || (veh.id === 'V04' ? 'R03' : 'R01'),
        latitude: lat,
        longitude: lng,
        accuracy: loc ? loc.accuracy : 10,
        speed: loc ? loc.speed : 0,
        heading: loc ? loc.heading : 0,
        source: source,
        timestamp: loc ? loc.timestamp : new Date().toISOString()
      };
    });

    res.json({
      success: true,
      vehicles: fleetVehicles,
      activeDisruptions,
      deliveries: activeDeliveries
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  login,
  register,
  getVehicles,
  getRoutes,
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
  loadDemoScenario,
  updateLocation,
  getFleetLocations
};
