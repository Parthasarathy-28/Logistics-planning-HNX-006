const db = require('./database');

const bcrypt = require('bcryptjs');

function seedDatabase() {
  console.log('Seeding SQLite database with demo logistics data...');

  // Clear existing operational data, preserving custom registered users
  db.exec(`
    DELETE FROM vehicle_locations;
    DELETE FROM plan_actions;
    DELETE FROM recovery_plans;
    DELETE FROM disturbances;
    DELETE FROM deliveries;
    DELETE FROM routes;
    DELETE FROM vehicles;
  `);

  // 1. Fallback initial demo users (INSERT OR IGNORE to preserve registered users)
  const ownerHash = bcrypt.hashSync('owner123', 10);
  const driverHash = bcrypt.hashSync('driver123', 10);
  const now = new Date().toISOString();

  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, username, password_hash, role, name, status, driver_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertUser.run('USR_OWNER', 'owner', ownerHash, 'OWNER', 'Sarah Jenkins (Ops Director)', 'ACTIVE', null, now);
  insertUser.run('USR_DRV04', 'driver01', driverHash, 'DRIVER', 'Alex Driver', 'ACTIVE', 'DRV04', now);
  insertUser.run('USR_DRV04_COMPAT', 'driver', driverHash, 'DRIVER', 'Alex Driver', 'ACTIVE', 'DRV04', now);

  // 2. Vehicles
  const insertVehicle = db.prepare(`
    INSERT INTO vehicles (id, vehicle_code, plate_number, type, status, driver_name, capacity, current_location)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertVehicle.run('V01', 'V01', 'KA-01-EA-1001', 'Heavy Truck', 'ACTIVE', 'Sam Driver', 1200, 'Route R01 - Mile 12');
  insertVehicle.run('V02', 'V02', 'KA-02-EB-2002', 'Electric Van', 'ACTIVE', 'Maya Driver', 500, 'Route R02 - Junction 4');
  insertVehicle.run('V03', 'V03', 'KA-03-EC-3003', 'Refrigerated Truck', 'ACTIVE', 'David Driver', 800, 'Route R04 - Terminal 2');
  insertVehicle.run('V04', 'V04', 'KA-04-ED-4004', 'Delivery Truck', 'ACTIVE', 'Alex Driver', 950, 'Route R03 - Mile 18');
  insertVehicle.run('V05', 'V05', 'KA-05-EE-5005', 'Spare Express Van', 'AVAILABLE', 'Unassigned (Hub North)', 600, 'Hub North Depot');

  // 3. Routes
  const insertRoute = db.prepare(`
    INSERT INTO routes (id, route_code, name, origin, destination, distance_km, estimated_time_min, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertRoute.run('R01', 'R01', 'North Express Corridor', 'Hub North', 'Suburb A Logistics Park', 45, 60, 'NORMAL');
  insertRoute.run('R02', 'R02', 'West Highway Direct', 'Hub Central', 'Tech Park Zone 2', 32, 40, 'NORMAL');
  insertRoute.run('R03', 'R03', 'Industrial Corridor South', 'Hub South', 'Industrial Park B', 58, 75, 'NORMAL');
  insertRoute.run('R04', 'R04', 'Metro Connect Bypass', 'Hub Central', 'Metro Station 4 Depot', 28, 35, 'NORMAL');
  insertRoute.run('R05', 'R05', 'East Port Connector', 'Hub East', 'Freight Deep Port', 64, 85, 'NORMAL');

  // 4. Drivers
  const insertDriver = db.prepare(`
    INSERT OR IGNORE INTO drivers (id, user_id, driver_code, name, status, current_vehicle_id, current_route_id, latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertDriver.run('DRV04', 'USR_DRV04', 'DRV04', 'Alex Driver', 'ON_DELIVERY', 'V04', 'R03', 12.9716, 77.5946);
  insertDriver.run('DRV01', 'USR_DRV01', 'DRV01', 'Sam Driver', 'ON_DELIVERY', 'V01', 'R01', 13.0827, 80.2707);

  // 5. Initial Vehicle Locations (Baseline Simulated GPS)
  const insertLoc = db.prepare(`
    INSERT INTO vehicle_locations (id, vehicle_id, driver_id, latitude, longitude, accuracy, speed, heading, source, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertLoc.run('LOC_V01', 'V01', 'DRV01', 13.0827, 80.2707, 15, 45, 90, 'SIMULATED_GPS', now);
  insertLoc.run('LOC_V02', 'V02', 'DRV02', 12.9250, 77.5890, 10, 38, 180, 'SIMULATED_GPS', now);
  insertLoc.run('LOC_V03', 'V03', 'DRV03', 12.9350, 77.6200, 12, 50, 270, 'SIMULATED_GPS', now);
  insertLoc.run('LOC_V04', 'V04', 'DRV04', 12.9716, 77.5946, 10, 25, 90, 'SIMULATED_GPS', now);
  insertLoc.run('LOC_V05', 'V05', null, 13.0400, 77.5900, 5, 0, 0, 'SIMULATED_GPS', now);

  // 6. Deliveries with Geographic Demo Coordinates
  const insertDelivery = db.prepare(`
    INSERT INTO deliveries (id, delivery_code, vehicle_id, route_id, customer_name, destination, deadline, current_eta, status, priority, latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Target deliveries affected by R03 disruption
  insertDelivery.run('D101', 'D101', 'V04', 'R03', 'Apex Tech Solutions', 'Building B, Industrial Park B', '14:00', '13:20', 'IN_TRANSIT', 'CRITICAL', 12.9800, 77.6000);
  insertDelivery.run('D102', 'D102', 'V04', 'R03', 'Metro Logistics Hub', 'Gate 4, Hub South', '15:30', '13:45', 'IN_TRANSIT', 'HIGH', 12.9650, 77.5900);
  insertDelivery.run('D103', 'D103', 'V04', 'R03', 'Omni Retailers', 'Dock 12, Shopping Complex', '17:00', '14:10', 'IN_TRANSIT', 'STANDARD', 12.9550, 77.6100);

  // Background deliveries
  insertDelivery.run('D104', 'D104', 'V01', 'R01', 'Global Freight Co', 'Building 7, Suburb A', '16:00', '12:30', 'IN_TRANSIT', 'HIGH', 13.0900, 80.2800);
  insertDelivery.run('D105', 'D105', 'V01', 'R01', 'Nexus Supplies', 'Warehouse 3, Suburb A', '18:00', '13:00', 'IN_TRANSIT', 'STANDARD', 13.0750, 80.2650);
  insertDelivery.run('D106', 'D106', 'V02', 'R02', 'BioMed Labs', 'Suite 102, Tech Park', '14:30', '12:10', 'IN_TRANSIT', 'CRITICAL', 12.9280, 77.5920);
  insertDelivery.run('D107', 'D107', 'V02', 'R02', 'Quantum Components', 'Suite 405, Tech Park', '16:30', '13:15', 'IN_TRANSIT', 'STANDARD', 12.9220, 77.5850);
  insertDelivery.run('D108', 'D108', 'V03', 'R04', 'ColdChain Foods', 'Unit 1, Metro Station Depot', '15:00', '12:45', 'IN_TRANSIT', 'HIGH', 12.9380, 77.6250);
  insertDelivery.run('D109', 'D109', 'V05', 'R05', 'Regional Depot', 'East Port Storage', '17:30', '14:00', 'PENDING', 'STANDARD', 13.0450, 77.5950);
  insertDelivery.run('D110', 'D110', 'V03', 'R04', 'Urban Supermarket', 'Market Square', '18:30', '15:00', 'IN_TRANSIT', 'STANDARD', 12.9310, 77.6150);

  console.log('Database seeded successfully with 5 vehicle initial locations, 5 vehicles, 5 routes, 10 deliveries.');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
