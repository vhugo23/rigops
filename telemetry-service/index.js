require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.post('/telemetry', async (req, res) => {
  const {
    well_id,
    depth,
    rate_of_penetration,
    weight_on_bit,
    torque,
    rpm,
    pressure,
    temperature,
    mud_flow,
    vibration,
  } = req.body;

  if (!well_id) {
    return res.status(400).json({ error: 'well_id is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO telemetry_readings
        (well_id, depth, rate_of_penetration, weight_on_bit, torque, rpm, pressure, temperature, mud_flow, vibration)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, timestamp`,
      [well_id, depth, rate_of_penetration, weight_on_bit, torque, rpm, pressure, temperature, mud_flow, vibration]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Failed to insert telemetry reading:', err.message);
    res.status(500).json({ error: 'Failed to store telemetry reading' });
  }
});
app.get('/telemetry/:wellId', async (req, res) => {
  const { wellId } = req.params;
  const limit = parseInt(req.query.limit) || 50;

  try {
    const result = await pool.query(
      `SELECT * FROM telemetry_readings
       WHERE well_id = $1
       ORDER BY timestamp DESC
       LIMIT $2`,
      [wellId, limit]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch telemetry readings:', err.message);
    res.status(500).json({ error: 'Failed to fetch telemetry readings' });
  }
});
app.listen(PORT, () => {
  console.log(`Telemetry Ingestion service listening on port ${PORT}`);
});