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

app.post('/notify', async (req, res) => {
  const { alert_id, channel } = req.body;

  if (!alert_id || !channel) {
    return res.status(400).json({ error: 'alert_id and channel are required' });
  }

  // Simulated delivery - logs to console and records an audit trail,
  // rather than sending a real email/SMS. This is the honest scope for
  // a one-week build: the point is demonstrating the service boundary
  // and the alert-triggers-relay flow, not building real notification
  // infrastructure.
  console.log(`[NOTIFY] Alert ${alert_id} via ${channel} at ${new Date().toISOString()}`);

  try {
    const result = await pool.query(
      `INSERT INTO notification_log (alert_id, channel, status)
       VALUES ($1, $2, $3)
       RETURNING id, sent_at`,
      [alert_id, channel, 'sent']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Failed to record notification:', err.message);
    res.status(500).json({ error: 'Failed to record notification' });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Notification/Alert-Relay service listening on port ${PORT}`);
});