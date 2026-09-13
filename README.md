# RigOps — Intelligent Drilling Operations Platform

**Live demo:** https://rigops-gamma.vercel.app

Oilfield equipment doesn't fail gracefully. A drilling operation running on stale sensor data, or an AI system recommending an action without being able to say what evidence it's grounded in, isn't a UX complaint — it's a safety incident. SLB has bet its next decade of growth on AI that reasons over subsurface and operational data at scale. That bet only works if the systems underneath it can be trusted — if telemetry pipelines catch bad data before it reaches a model, and if services fail in ways operators can see and reason about, not silently.

RigOps is a working, fully deployed answer to that problem, scoped to what one engineer can build, test, and defend in a week. It ingests simulated drilling telemetry, runs anomaly detection on it, and manages the resulting alerts through their full lifecycle — across four independently deployed services, running on three different cloud platforms, talking to each other in production right now.

This was built specifically against a live SLB posting — Full Stack Software Engineer, Houston, Req 19996 — which names C#/.NET/ASP.NET Core, Angular, REST APIs, microservices, Docker, Azure, and automated testing as its required stack.

**This is not a clone of any real SLB product.** It uses no SLB branding, data, or proprietary software, and its anomaly detection is an explicitly simple heuristic, not a validated diagnostic tool.

## See it live, right now

Open **https://rigops-gamma.vercel.app** and:

- **Wells** — a real well with live telemetry, ingested by a deployed Node service into a real Postgres database (Neon), including a real injected pressure-anomaly window visible directly in the readings.
- **Well Detail** — click into the well, click "Run Anomaly Check" — this calls a live, deployed Python/FastAPI service that scores the most recent readings and returns a real result.
- **Alerts** — real alerts with a working lifecycle: click through New → Acknowledged → Investigating → Resolved, each transition hitting a deployed Node notification service and persisting to the database live.
- **System Health** — polls all four deployed services directly from your browser and reports their real, current status.

Every one of these is live production behavior, not a mock, not a screenshot, not a "designed but not built" placeholder.

## Architecture

```
              Angular (Vercel)
                    |
               REST (JSON), CORS
                    |
         ASP.NET Core Core API (Azure App Service)
          (wells, rigs, operations, alert lifecycle)
          /            |              \
         /             |               \
        v              v                v
  Telemetry       Anomaly          Notification
  Ingestion       Detection        / Alert-Relay
  (Node/Express,  (Python/FastAPI, (Node/Express,
   Render)         stateless,       Render)
                    Render)
        |
        v
   Postgres (Neon)
```

Full architecture rationale: see `docs/decisions/` (7 ADRs).

## Services

| Service | Tech | Deployed at | Purpose |
|---|---|---|---|
| Core API | ASP.NET Core 9, EF Core | Azure App Service | Wells, Rigs, Operations, Alerts; orchestrates the other three |
| Telemetry Ingestion | Node/Express, raw SQL | Render | Stores and serves drilling telemetry |
| Anomaly Detection | Python/FastAPI | Render | Stateless z-score anomaly scoring |
| Notification/Alert-Relay | Node/Express | Render | Simulated alert delivery + audit log |
| Frontend | Angular | Vercel | The UI described above |
| Database | Postgres | Neon | Shared by all backend services |

## Running locally

Requires: .NET 9 SDK, Node 20+, Python 3.12+, PostgreSQL (local or Docker), Angular CLI.

**Fastest path — Docker Compose (backend only):**

```powershell
docker compose up --build
```

Apply the schema once against the container:

```powershell
cd backend/RigOps.Api
dotnet ef database update --connection "Host=localhost;Port=5434;Database=rigops;Username=postgres;Password=postgres"
```

**Frontend (separately):**

```powershell
cd frontend
npm install
ng serve
```

Visit `http://localhost:4200`. Note: `environment.ts` points at localhost by default; `environment.prod.ts` (used automatically in production builds via `angular.json`'s `fileReplacements`) points at the real deployed services.

## Testing

```powershell
# Backend unit tests (xUnit + Moq)
cd backend/RigOps.Api.Tests
dotnet test

# One Playwright E2E happy-path test
cd frontend
npx playwright test
```

## CI/CD

GitHub Actions runs on every push to `main`: restore/build/test the .NET test project, then (only if tests pass) builds all four Docker images. See `.github/workflows/ci.yml` and ADR-006 for why GitHub Actions was used instead of the Azure DevOps named in the original job posting.

## Known gaps — stated directly, not smoothed over

- No authentication implemented.
- Automated test coverage is intentionally narrow (one xUnit/Moq suite covering the alert state machine, one Playwright E2E path); most other behavior was verified through repeated live testing against real running and deployed services, not mocks.
- Anomaly detection runs one z-score heuristic on one signal (pressure), never benchmarked against a second method.
- `telemetry_readings.well_id` has no foreign-key constraint back to Core API's `Wells` table — a deliberate cross-service data-ownership trade-off (ADR-002).
- Kubernetes was scoped out entirely — see ADR-007.
- The demo data (one well, a handful of alerts) was seeded manually for demonstration purposes; there is no automated seed script yet.

Every one of these is a scoping decision made under a real one-week constraint, discussed with its reasoning in `docs/decisions/`.

## Origin

RigOps is the second system built against SLB's actual hiring pipeline. A 58-section, open-ended technical brief was deliberately cut down, against a real one-week deadline, into the four-service architecture and non-goal list documented in `docs/decisions/`. Every service boundary, every cut, and every substitution (Azure DevOps to GitHub Actions, an originally-Azure-only deployment expanded to a real multi-cloud one) is recorded there with its reasoning, decided in writing rather than asserted after the fact.

## Disclaimer

Not affiliated with or endorsed by SLB. No proprietary SLB source code, data, or branding is used anywhere in this repository. Built independently as a demonstration of engineering capability against a real, public job requisition.