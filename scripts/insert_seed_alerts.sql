-- RigOps demo alert seeding
-- Enum values confirmed from existing production data (via /api/v1/Alerts):
--   Severity: Low=0, Medium=1, High=2, Critical=3
--   Status:   New=0, Acknowledged=1, Investigating=2, Resolved=3
-- These are hand-inserted, same as the original insert_test_alert.sql —
-- there is no alert-creation API endpoint in this codebase; anomaly-check
-- only scores telemetry, it doesn't write to Alerts. Worth saying exactly
-- this if asked how the demo data was created.

-- Well 2: matches the real 0.31 score we got back from a live anomaly
-- check, kept as a genuine "New" / not-yet-acknowledged alert.
INSERT INTO "Alerts" ("Severity", "Signal", "AnomalyScore", "Status", "DetectedAt", "WellId")
VALUES (1, 'pressure', 0.31, 0, NOW() - INTERVAL '10 minutes', 2);

-- Well 3: a torque spike, currently being looked at.
INSERT INTO "Alerts" ("Severity", "Signal", "AnomalyScore", "Status", "DetectedAt", "WellId")
VALUES (2, 'torque', 0.68, 2, NOW() - INTERVAL '25 minutes', 3);

-- Well 4: a critical vibration alert, still new — gives the Overview
-- page a real "Critical Wells" count greater than zero.
INSERT INTO "Alerts" ("Severity", "Signal", "AnomalyScore", "Status", "DetectedAt", "WellId")
VALUES (3, 'vibration', 0.91, 0, NOW() - INTERVAL '5 minutes', 4);

-- Well 5: a resolved low-severity alert, to add another real example
-- in the Resolved section besides the original one on Well 1.
INSERT INTO "Alerts" ("Severity", "Signal", "AnomalyScore", "Status", "DetectedAt", "WellId")
VALUES (0, 'temperature', 0.22, 3, NOW() - INTERVAL '2 hours', 5);