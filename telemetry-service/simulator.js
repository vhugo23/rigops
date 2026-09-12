require('dotenv').config();

const TARGET_URL = process.env.SIMULATOR_TARGET_URL || 'http://localhost:3001/telemetry';
const INTERVAL_MS = 2000;
const WELL_ID = 1;
const ANOMALY_PROBABILITY = 0.15; // 15% chance per tick

let currentDepth = 9000;
let inAnomaly = false;
let anomalyTicksRemaining = 0;

function generateNormalReading() {
  currentDepth += Math.random() * 2;

  return {
    well_id: WELL_ID,
    depth: parseFloat(currentDepth.toFixed(2)),
    rate_of_penetration: 40 + Math.random() * 10,
    weight_on_bit: 20 + Math.random() * 5,
    torque: 20 + Math.random() * 3,
    rpm: 115 + Math.random() * 10,
    pressure: 4800 + Math.random() * 200,
    temperature: 175 + Math.random() * 10,
    mud_flow: 440 + Math.random() * 20,
    vibration: 2 + Math.random() * 1.5,
  };
}

function applyAnomaly(reading) {
  // Simulated pressure kick: pressure and torque rise, ROP drops.
  // This mirrors the pattern described in the RigOps spec (§8) -
  // pressure up, ROP down, torque up, vibration up - while being
  // explicit that this is a simplified, illustrative pattern, not
  // a validated diagnostic signature.
  reading.pressure *= 1.2;
  reading.torque *= 1.15;
  reading.rate_of_penetration *= 0.75;
  reading.vibration *= 1.3;
  return reading;
}

function generateReading() {
  const reading = generateNormalReading();

  if (!inAnomaly && Math.random() < ANOMALY_PROBABILITY) {
    inAnomaly = true;
    anomalyTicksRemaining = 3 + Math.floor(Math.random() * 4); // lasts 3-6 ticks
    console.log('--- anomaly starting ---');
  }

  if (inAnomaly) {
    applyAnomaly(reading);
    anomalyTicksRemaining -= 1;
    if (anomalyTicksRemaining <= 0) {
      inAnomaly = false;
      console.log('--- anomaly ended ---');
    }
  }

  return reading;
}

async function sendReading(reading) {
  try {
    const response = await fetch(TARGET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reading),
    });

    if (!response.ok) {
      console.error(`Ingestion rejected reading: ${response.status}`);
      return;
    }

    const result = await response.json();
    console.log(`Sent reading -> id ${result.id}, depth ${reading.depth}, pressure ${reading.pressure.toFixed(0)}`);
  } catch (err) {
    console.error('Failed to reach telemetry service:', err.message);
  }
}

console.log(`Starting simulator for well ${WELL_ID}, sending every ${INTERVAL_MS}ms...`);
setInterval(() => {
  const reading = generateReading();
  sendReading(reading);
}, INTERVAL_MS);