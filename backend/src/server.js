const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const seedDatabase = require('./db/seed');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api', apiRoutes);

// Seed DB on start to guarantee clean demo environment
try {
  seedDatabase();
} catch (e) {
  console.error('Initial DB seeding error:', e.message);
}

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` ROUTERESCUE BACKEND DECISION ENGINE RUNNING     `);
  console.log(` Server URL: http://localhost:${PORT}             `);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(`==================================================`);
});
