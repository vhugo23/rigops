/**
 * RigOps demo seed script
 * ------------------------
 * Populates realistic, varied demo data by calling the REAL APIs
 * (not raw SQL) — so seeded data goes through actual validation
 * and business logic, same as a real client would produce.
 *
 * CONFIRMED against live Swagger (localhost:5275/swagger) 2026-09-14:
 *   - POST /api/v1/Wells   (route confirmed, body shape still assumed
 *     from the Well model — Status/CurrentDepth casing not yet
 *     verified against a real 200 response)
 *   - POST /api/v1/Rigs    (route confirmed, same caveat)
 *   - GET  /api/v1/Wells/{id}/anomaly-check  <-- GET, not POST. This
 *     was wrong in the first draft and is fixed below.
 *   - There is NO POST /api/v1/Alerts (create) endpoint — only
 *     POST /api/v1/Alerts/{id}/transition exists, which requires an
 *     alert to already exist. This means alerts are most likely
 *     created as a server-side side effect of a successful (200)
 *     anomaly-check call, when the anomaly score crosses some
 *     threshold. NOT YET CONFIRMED — we only saw a 503 in manual
 *     testing (well 1 had no/insufficient telemetry, so the anomaly
 *     service errored). This script seeds telemetry BEFORE calling
 *     anomaly-check specifically to get past that and see a real 200
 *     response, which will confirm or deny this.
 *
 * Run locally first against your local stack (all 4 backend services
 * + local Postgres running), confirm it worked by checking the pages,
 * THEN optionally re-point at the deployed URLs via env vars below
 * if you want to seed production directly.
 *
 * Requires Node 18+ (uses built-in fetch). Run with:
 *   node seed-demo-data.js
 */

const CORE_API_BASE = process.env.CORE_API_BASE || 'http://localhost:5275/api/v1';
const TELEMETRY_BASE = process.env.TELEMETRY_BASE || 'http://localhost:3001';

// Confirmed via Swagger: GET, not POST.
const ANOMALY_CHECK_PATH = (wellId) => `${CORE_API_BASE}/Wells/${wellId}/anomaly-check`;

// CONFIRMED via Swagger schema example (2026-09-14): request/response
// JSON is camelCase, and `status` is a numeric enum, not a string.
// Enum ordering ASSUMED from the documented model comment
// "Status[enum: Normal/Warning/Critical/Offline]" — C# enums default
// to declaration order, so Normal=0, Warning=1, Critical=2, Offline=3.
// NOT independently confirmed — if seeded wells show the wrong status
// label on the Wells page, the ordering is different from this guess;
// paste back what you see and I'll correct it.
const WELL_STATUS = { Normal: 0, Warning: 1, Critical: 2, Offline: 3 };

const RIGS = [
  { name: 'Rig Alpha', location: 'Houston, TX' },
  { name: 'Rig Bravo', location: 'Corpus Christi, TX' },
];

const WELLS_TEMPLATE = [
  { name: 'Well 01', status: WELL_STATUS.Normal, currentDepth: 5000 },
  { name: 'Well 02', status: WELL_STATUS.Warning, currentDepth: 7200 },
  { name: 'Well 03', status: WELL_STATUS.Critical, currentDepth: 3100 },
  { name: 'Well 04', status: WELL_STATUS.Normal, currentDepth: 6400 },
];

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`POST ${url} failed: ${res.status} ${res.statusText} ${text}`);
  }
  return res.json().catch(() => ({}));
}

async function getJson(url) {
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  const text = await res.text().catch(() => '');
  if (!res.ok) {
    throw new Error(`GET ${url} failed: ${res.status} ${res.statusText} ${text}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// Generates a batch of telemetry readings for one well, spanning
// backward from "now" by intervalSeconds per tick, so the resulting
// chart shows real history instead of a single live tick.
function buildTelemetryBatch(wellId, count, intervalSeconds, anomalyWindow) {
  const now = Date.now();
  const readings = [];
  let depth = 3000 + Math.random() * 4000;

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now - i * intervalSeconds * 1000).toISOString();
    const inAnomaly = anomalyWindow && i >= anomalyWindow.start && i <= anomalyWindow.end;

    depth += Math.random() * 0.5;

    readings.push({
      well_id: wellId,
      timestamp,
      depth: Number(depth.toFixed(2)),
      rate_of_penetration: inAnomaly ? rand(5, 15) : rand(30, 60),
      weight_on_bit: rand(15000, 25000),
      torque: inAnomaly ? rand(400, 600) : rand(150, 250),
      rpm: rand(80, 140),
      pressure: inAnomaly ? rand(5600, 6000) : rand(4700, 4950),
      temperature: rand(180, 220),
      mud_flow: rand(500, 700),
      vibration: inAnomaly ? rand(3.5, 6) : rand(0.5, 1.5),
    });
  }
  return readings;
}

function rand(min, max) {
  return Number((min + Math.random() * (max - min)).toFixed(2));
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('--- RigOps demo seed script ---');
  console.log(`Core API:  ${CORE_API_BASE}`);
  console.log(`Telemetry: ${TELEMETRY_BASE}`);
  console.log('');

  // 1. Create rigs
  const createdRigs = [];
  for (const rig of RIGS) {
    console.log(`Creating rig: ${rig.name}...`);
    const created = await postJson(`${CORE_API_BASE}/Rigs`, rig);
    createdRigs.push(created);
    console.log(`  -> created with id ${created.id}`);
  }

  // 2. Create wells, spread across the created rigs
  const createdWells = [];
  for (let i = 0; i < WELLS_TEMPLATE.length; i++) {
    const rig = createdRigs[i % createdRigs.length];
    const wellPayload = { ...WELLS_TEMPLATE[i], rigId: rig.id };
    console.log(`Creating well: ${wellPayload.name} on rig ${rig.id}...`);
    const created = await postJson(`${CORE_API_BASE}/Wells`, wellPayload);
    createdWells.push(created);
    console.log(`  -> created with id ${created.id}`);
  }

  // 3. Seed telemetry history per well — 3 hours of data at 30s intervals,
  //    with one well getting an injected anomaly window near the end
  //    (so a subsequent anomaly check has something real to detect).
  const TICKS = 360; // 3 hours at 30s/tick
  const INTERVAL_SECONDS = 30;

  for (let i = 0; i < createdWells.length; i++) {
    const well = createdWells[i];
    const wellId = well.id;
    const anomalyWindow = i === 0 ? { start: 5, end: 20 } : null; // anomaly near the most recent ticks
    const batch = buildTelemetryBatch(wellId, TICKS, INTERVAL_SECONDS, anomalyWindow);

    console.log(`Seeding ${batch.length} telemetry readings for well ${wellId}...`);
    for (const reading of batch) {
      await postJson(`${TELEMETRY_BASE}/telemetry`, reading);
    }
    console.log(`  -> done`);
  }

  // 4. Trigger real anomaly checks (GET, confirmed via Swagger) so any
  //    resulting alerts come from the actual detection pipeline, not
  //    hand-inserted. We don't yet know for certain whether a 200
  //    response here creates an alert as a side effect — this loop
  //    prints the full response so you can check.
  const anomalyResults = [];
  for (const well of createdWells) {
    const wellId = well.id;
    console.log(`Running anomaly check on well ${wellId}...`);
    try {
      const result = await getJson(ANOMALY_CHECK_PATH(wellId));
      anomalyResults.push({ wellId, result });
      console.log(`  -> result:`, JSON.stringify(result));
    } catch (err) {
      console.warn(`  -> anomaly check failed on well ${wellId}: ${err.message}`);
    }
    await sleep(500); // small pause between checks, avoid hammering the AI service
  }

  // 5. Check whether any alerts now exist, to confirm whether
  //    anomaly-check actually creates them as a side effect.
  console.log('');
  console.log('Checking /api/v1/Alerts for anything created by the checks above...');
  try {
    const alerts = await getJson(`${CORE_API_BASE}/Alerts`);
    console.log(`  -> ${Array.isArray(alerts) ? alerts.length : '?'} alert(s) currently in the system:`);
    console.log(JSON.stringify(alerts, null, 2));
  } catch (err) {
    console.warn(`  -> could not fetch /api/v1/Alerts: ${err.message}`);
  }

  console.log('');
  console.log('--- Done. Refresh the frontend and check Overview / Wells / Alerts. ---');
}

main().catch((err) => {
  console.error('Seed script failed:', err);
  process.exit(1);
});