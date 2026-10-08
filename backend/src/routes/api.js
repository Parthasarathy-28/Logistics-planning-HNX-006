const express = require('express');
const router = express.Router();
const controller = require('../controllers/appController');

// Health Check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'RouteRescue Decision Engine', timestamp: new Date().toISOString() });
});

// Authentication
router.post('/auth/login', controller.login);

// Driver APIs
router.get('/driver/:id', controller.getDriver);
router.post('/disturbances', controller.createDisturbance);
router.post('/recovery/:id/acknowledge', controller.acknowledgePlan);
router.post('/deliveries/:id/complete', controller.completeDelivery);

// Owner APIs
router.get('/owner/alerts', controller.getOwnerAlerts);
router.get('/disturbances', controller.getAllDisturbances);
router.get('/disturbances/:id', controller.getDisturbance);

// Intelligence Engine APIs
router.post('/impact/analyze', controller.getImpactAnalysis);
router.get('/impact/:disturbanceId', controller.getImpactAnalysis);

router.post('/recovery/generate', controller.generateRecovery);
router.get('/recovery/:disturbanceId', controller.generateRecovery);

router.post('/recovery/:id/decision', controller.handleDecision);
router.post('/recovery/:id/send', controller.sendPlanToDriver);

// What-If Simulation API
router.post('/simulation', controller.runSimulation);

// Demo Mode Controls
router.post('/demo/seed', controller.resetDemo);
router.post('/demo/load-scenario', controller.loadDemoScenario);

module.exports = router;
