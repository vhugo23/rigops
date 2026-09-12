# RigOps — Intelligent Drilling Operations Platform (PRD)

**What this is:** a cloud-native, microservice-boundaried drilling operations
platform - simulated telemetry in, anomaly detection and alerting out -
built in one week specifically to demonstrate the stack named in SLB's
Full Stack Software Engineer posting (Req 19996, Houston): C#/.NET/ASP.NET
Core, Angular/TypeScript, REST APIs, microservices, Docker, Azure, xUnit/
Moq/Playwright, CI/CD, SOLID/design patterns.

**Explicitly not a clone.** RigOps does not use SLB branding, data, APIs,
or proprietary software. It is described everywhere - README, walkthrough,
UI copy - as "an educational, open-source-inspired simulation of a
cloud-native drilling operations platform." Never claim it reproduces
DrillOps, Delfi, Lumi, or Tela, or that its anomaly detection is a real
diagnostic tool.

**Status as of this doc:** nothing built yet. This is Day 0.

---

## 1. Time budget and the rule that governs every decision below

**One week, one person, three technologies new to the builder (C#/.NET,
Angular, Azure).** Every scope decision in this document exists to protect
that constraint. Where a real engineering practice (Kubernetes, full auth,
a complete Playwright suite) is cut, it's cut explicitly and documented as
"designed, not built" - never silently dropped, never quietly claimed as
done.

**The fallback, decided now, not mid-week:** if the ingestion/anomaly
service pair (Day 2-3) overruns, the first thing to fold back into the
Core API monolith is the Notification/Alert-Relay service. Merge it into
a method call, write the ADR as "designed as a separate service, merged
under time pressure, here's the extraction path." Do not cut Telemetry
Ingestion or Anomaly Detection - those two carry the strongest, most
defensible interview stories (write-pattern isolation, graceful
degradation) and are worth protecting at the cost of the weaker one.

## 2. Goals and non-goals

**Goals**
- Cover, at some honest depth, every explicit and preferred skill in Req
  19996 (see section 3 coverage matrix) - not all at full depth, but none
  skipped and unaddressed without a documented reason.
- Design and maintain a real multi-service boundary (four services, see
  section 5) with actual justification per boundary - write pattern,
  statelessness, blast radius - not services split just to count them.
- Produce a working, demoable system by end of Day 7: dashboard, telemetry,
  alerts, degraded-mode handling.
- Maintain an honest build log and ADR set so every decision can be
  defended in a 30-45 minute technical follow-up.

**Non-goals (cut now, not discovered mid-week)**
- Kubernetes/AKS deployment - manifests written for the largest service,
  never deployed. Wrong scale for a one-week solo build.
- Full Azure deployment of every service - one real deploy (Core API),
  documented choice, not a cost-blind attempt at all four.
- The optional LLM assistant - explicitly optional in its own source doc;
  not attempted this week.
- Full three-role auth system - a stub or single hardcoded role only.
- Real-time WebSocket/SignalR updates - polling only; documented future step.
- A complete Playwright suite - one happy-path E2E test, not full coverage.
- Kafka/Redis/service mesh/CQRS/GraphQL/Terraform - never introduced.

## 3. Coverage matrix - what "done" honestly means per skill

| JD item | Status | How |
|---|---|---|
| C#, .NET, ASP.NET Core | Real, core | Core API: entities, EF Core, DI, repository pattern |
| REST APIs | Real | Versioned /api/v1/... across all services |
| Microservices | Real, minimal | 4 services, each with a stated single reason to exist (section 5) |
| Angular, TypeScript | Real, core | Dashboard, Wells, Well Detail, Alerts, System Health |
| Azure | Real, minimal | Core API deployed to App Service (free/student tier); rest documented, not deployed |
| Git | Real | Feature branches, real commit history, no giant commits |
| Azure DevOps | Substituted, documented | GitHub Actions used instead; one ADR states the equivalence and the gap |
| CI/CD | Real, minimal | checkout -> build -> lint -> unit tests -> Docker build; no deploy-on-green |
| xUnit / NUnit | Real | Core API business logic, alert severity, validation |
| Moq | Real | Mocks the two outbound HTTP calls (Anomaly Detection, Notification) |
| Playwright | Real, minimal | One E2E: dashboard -> well -> telemetry -> alert |
| SOLID | Real, applied | DI + repository pattern; one ADR calls out which principle each serves |
| Design patterns | Real, minimal | Repository + Strategy (swappable anomaly-detection method) |
| Agile | Real, lightweight | Day-labeled backlog, used as actually written, not retrofitted |
| Docker | Real | docker-compose.yml for all four services + Postgres |
| Kubernetes/AKS | Documented only | Manifests written for Core API, not applied; ADR states why |
| Node.js | Real, minimal | Two of the four services (Telemetry Ingestion, Notification) |
| Logging | Real, minimal | Structured logs in every service |
| Monitoring/troubleshooting | Real, minimal | /health per service + System Health page reading them |
| Domain knowledge (drilling) | Real | ROP/WOB/torque modeled correctly, explained in docs/domain/ |

## 4. High-level architecture
                Angular + TypeScript
                        |
                   REST (JSON)
                        |
                ASP.NET Core Core API
                 (wells, rigs, ops,
                  alert lifecycle)
                /        |        \
               /         |         \
              v          v          v
      Telemetry    Anomaly      Notification
      Ingestion    Detection    / Alert-Relay
      (Node/       (Python/     (Node/Express)
       Express)     FastAPI)
          |             (stateless,
          v              no DB)
      Postgres <-----------------------------
    (wells, rigs, operations, alerts,
     telemetry_readings, notification_log)

Core API is the only service under real request load from the frontend and
the only orchestrator - this centralization is a deliberate Day-1 choice
(simpler failure reasoning for a one-week build), not an oversight.

## 5. Service boundaries - the real design-and-maintain surface

| Service | Owns | Reason to exist separately | Talks to | Scales independently? | If it dies |
|---|---|---|---|---|---|
| Core API (.NET) | wells, rigs, operations, alerts | Orchestration + only client-facing surface | Calls the other three over HTTP | Yes, under UI load | Whole app down - the honest single point of failure |
| Telemetry Ingestion (Node/Express) | telemetry_readings | Different write pattern: bursty, high-frequency, simulator-driven | Own table in shared Postgres; Core API reads from it | Yes - write-heavy and bursty | Telemetry goes stale; dashboard shows "stale data," not a crash |
| Anomaly Detection (Python/FastAPI) | Nothing persistent - pure function | Statelessness is the justification: no data ownership, no reason to share a runtime with stateful services | Called by Core API per telemetry window | Could scale horizontally, stateless | Core API catches the failure; alerts stop being AI-scored, telemetry keeps flowing |
| Notification/Alert-Relay (Node) | notification_log | Weakest justification of the four - honestly labeled as the first thing to fold back in if time runs short | Called by Core API on alert state transitions | No | Alerts still fire and show in-app; only the relay/audit trail is missing |

## 6. Data model (initial)

```sql
-- Core API's tables
wells(id, rig_id, name, status, current_depth, created_at)
rigs(id, name, location)
operations(id, well_id, operation_type, started_at, ended_at)
alerts(id, well_id, severity, signal, anomaly_score, status, detected_at)

-- Telemetry Ingestion's table (separate service, separate ownership)
telemetry_readings(id, well_id, timestamp, depth, rop, wob, torque, rpm,
                    pressure, temperature, mud_flow, vibration)

-- Notification/Alert-Relay's table
notification_log(id, alert_id, channel, sent_at, status)
```

No formal migration framework this week - EF Core migrations for Core API
is the one exception, since it's built in on Day 1 for near-zero extra
cost; the other services apply schema once, documented as a known gap.

## 7. Day-by-day plan

**Day 1 - Core API foundation.** ASP.NET Core, EF Core, Postgres,
Well/Rig/Operation entities, /api/v1/wells CRUD, /health,
repository pattern + DI wired from the start. First real commits.

**Day 2 - Telemetry Ingestion + simulator.** Node/Express service, its
own telemetry_readings table, deterministic simulator (configurable
wells/interval/anomaly-frequency/noise) writing into it. Core API reads
telemetry via this service, not directly. Highest overrun risk of the week.

**Day 3 - Anomaly Detection + the failure path built alongside the happy
path.** Python/FastAPI, one detection method chosen and justified in an
ADR (z-score or threshold, not both). Core API's timeout/500 handling for
this call is built the same day it's wired in, not retrofitted.

**Day 4 - Notification/Alert-Relay + alert lifecycle.** Alert state
machine in Core API (New -> Acknowledged -> Investigating -> Resolved)
triggers the relay service on transitions.

**Day 5-6 - Angular.** Dashboard, Wells list, Well Detail (telemetry
charts + active alerts), Alerts page, System Health page reporting all
four services' /health endpoints. Budget two full days.

**Day 7 - Tests, Docker, CI, one real deploy, docs, buffer.**
docker-compose.yml for all four services + Postgres. xUnit + Moq on
Core API (mock the two outbound HTTP calls). One Playwright happy path.
GitHub Actions: build -> lint -> test -> Docker build. Kubernetes manifests
written for Core API only, not applied. One real Azure deploy - Core API
to App Service, free/student tier; if this doesn't fit, cut it before
cutting documentation, and say so in the README. ADRs (see section 8).
README, walkthrough script. Assume part of this day gets eaten by an
unplanned debugging saga - budget accordingly rather than being surprised.

## 8. ADR list (write these, not more)

1. Why ASP.NET Core as the orchestrating service, not a thinner gateway
2. Why four service boundaries, and why these four specifically (ties to section 5)
3. Why Telemetry Ingestion is Node/Express, not another .NET service
4. Why Anomaly Detection is Python/FastAPI and stateless
5. Why Notification/Alert-Relay was the designated first cut if time ran short
6. Why GitHub Actions instead of Azure DevOps, and what's missing as a result
7. Why Kubernetes was designed (manifests exist) but not deployed

## 9. What a follow-up question should get, honestly

- "Is this production-ready?" -> No - no real auth, single Azure service
  deployed, Kubernetes never applied, one anomaly-detection method chosen
  without comparison. Name these directly.
- "Why four services and not one API?" -> Point to section 5's per-service
  justification table, not "microservices are best practice."
- "What breaks first under load?" -> Core API, since it's the single
  orchestrating point of failure by design - a real, stated trade-off.

## 10. Definition of done for the week

A slice counts as done only if it has: working code, at least one test
where testable, a /health contribution if it's a service, a commit with
a real message, and either a short doc note or an ADR if it involved a
real decision. A feature that "works" but has none of the above is not
done - it's a draft.
