const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../routerescue.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL,
      name TEXT NOT NULL,
      driver_id TEXT
    );

    CREATE TABLE IF NOT EXISTS drivers (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      driver_code TEXT NOT NULL,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      current_vehicle_id TEXT,
      current_route_id TEXT,
      latitude REAL,
      longitude REAL
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      vehicle_code TEXT UNIQUE NOT NULL,
      plate_number TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      driver_name TEXT,
      capacity INTEGER,
      current_location TEXT
    );

    CREATE TABLE IF NOT EXISTS routes (
      id TEXT PRIMARY KEY,
      route_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      distance_km REAL,
      estimated_time_min INTEGER,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS deliveries (
      id TEXT PRIMARY KEY,
      delivery_code TEXT UNIQUE NOT NULL,
      vehicle_id TEXT,
      route_id TEXT,
      customer_name TEXT NOT NULL,
      destination TEXT NOT NULL,
      deadline TEXT NOT NULL,
      current_eta TEXT NOT NULL,
      status TEXT NOT NULL,
      priority TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS disturbances (
      id TEXT PRIMARY KEY,
      disturbance_code TEXT UNIQUE NOT NULL,
      driver_id TEXT NOT NULL,
      driver_name TEXT NOT NULL,
      vehicle_id TEXT NOT NULL,
      vehicle_number TEXT NOT NULL,
      route_id TEXT NOT NULL,
      route_name TEXT NOT NULL,
      input_method TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      latitude REAL,
      longitude REAL,
      timestamp TEXT NOT NULL,
      severity TEXT NOT NULL,
      status TEXT NOT NULL,
      language TEXT,
      original_transcript TEXT,
      normalized_transcript TEXT,
      confidence REAL
    );

    CREATE TABLE IF NOT EXISTS recovery_plans (
      id TEXT PRIMARY KEY,
      disturbance_id TEXT NOT NULL,
      recommended_action_type TEXT NOT NULL,
      score INTEGER NOT NULL,
      explanation TEXT NOT NULL,
      status TEXT NOT NULL,
      before_metrics TEXT,
      after_metrics TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (disturbance_id) REFERENCES disturbances(id)
    );

    CREATE TABLE IF NOT EXISTS plan_actions (
      id TEXT PRIMARY KEY,
      plan_id TEXT NOT NULL,
      delivery_id TEXT NOT NULL,
      action_type TEXT NOT NULL,
      original_vehicle_id TEXT,
      new_vehicle_id TEXT,
      expected_delay_min INTEGER NOT NULL,
      score INTEGER NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY (plan_id) REFERENCES recovery_plans(id),
      FOREIGN KEY (delivery_id) REFERENCES deliveries(id)
    );
  `);

  // Migration helper for existing databases
  try {
    const tableInfo = db.pragma('table_info(disturbances)');
    const columnNames = tableInfo.map(col => col.name);

    if (!columnNames.includes('language')) {
      db.exec('ALTER TABLE disturbances ADD COLUMN language TEXT');
    }
    if (!columnNames.includes('original_transcript')) {
      db.exec('ALTER TABLE disturbances ADD COLUMN original_transcript TEXT');
    }
    if (!columnNames.includes('normalized_transcript')) {
      db.exec('ALTER TABLE disturbances ADD COLUMN normalized_transcript TEXT');
    }
    if (!columnNames.includes('confidence')) {
      db.exec('ALTER TABLE disturbances ADD COLUMN confidence REAL');
    }
  } catch (err) {
    console.warn('Column migration note:', err.message);
  }

  console.log('SQLite database schema initialized.');
}

initSchema();

module.exports = db;
