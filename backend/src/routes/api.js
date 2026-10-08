const express = require('express');
const router = express.Router();
const controller = require('../controllers/appController');
const { requireAuth, requireOwner, requireDriver } = require('../middleware/auth');

// Health Check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'RouteRescue Decision Engine', timestamp: new Date().toISOString() });
});

// Authentication
router.post('/auth/login', controller.login);
router.post('/auth/register', controller.register);

// Logistics Data Lookup APIs
router.get('/vehicles', controller.getVehicles);
router.get('/routes', controller.getRoutes);

// Driver APIs
router.get('/driver/:id', requireDriver, controller.getDriver);
router.post('/disturbances', controller.createDisturbance);
router.post('/recovery/:id/acknowledge', requireDriver, controller.acknowledgePlan);
router.post('/deliveries/:id/complete', requireDriver, controller.completeDelivery);

// Owner APIs
router.get('/owner/alerts', requireOwner, controller.getOwnerAlerts);
router.get('/disturbances', requireOwner, controller.getAllDisturbances);
router.get('/disturbances/:id', requireOwner, controller.getDisturbance);

// Intelligence Engine APIs
router.post('/impact/analyze', controller.getImpactAnalysis);
router.get('/impact/:disturbanceId', controller.getImpactAnalysis);

router.post('/recovery/generate', controller.generateRecovery);
router.get('/recovery/:disturbanceId', controller.generateRecovery);

router.post('/recovery/:id/decision', controller.handleDecision);
router.post('/recovery/:id/send', controller.sendPlanToDriver);

// What-If Simulation API
router.post('/simulation', controller.runSimulation);

// GPS Location & Fleet Mapping APIs
router.post('/locations/update', controller.updateLocation);
router.get('/locations', controller.getFleetLocations);

// Demo Mode Controls
router.post('/demo/seed', controller.resetDemo);
router.post('/demo/load-scenario', controller.loadDemoScenario);

module.exports = router;
