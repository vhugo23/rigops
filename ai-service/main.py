from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime, timezone
import statistics

app = FastAPI(title="RigOps Anomaly Detection Service")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_methods=["*"],
    allow_headers=["*"],
)
class TelemetryReading(BaseModel):
    depth: float
    rate_of_penetration: float
    weight_on_bit: float
    torque: float
    rpm: float
    pressure: float
    temperature: float
    mud_flow: float
    vibration: float


class AnalyzeRequest(BaseModel):
    well_id: str
    readings: list[TelemetryReading]


@app.get("/health")
def health():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.post("/api/v1/anomalies/analyze")
def analyze(request: AnalyzeRequest):
    if len(request.readings) < 5:
        return {
            "wellId": request.well_id,
            "anomalyScore": 0.0,
            "severity": "LOW",
            "signals": [],
            "recommendation": "Insufficient data for analysis.",
        }

    pressures = [r.pressure for r in request.readings]
    latest_pressure = pressures[-1]
    baseline = pressures[:-1]

    mean = statistics.mean(baseline)
    stdev = statistics.stdev(baseline) if len(baseline) > 1 else 0

    z_score = (latest_pressure - mean) / stdev if stdev > 0 else 0
    anomaly_score = min(abs(z_score) / 4, 1.0)

    signals = []
    if z_score > 2:
        signals.append("pressure_increase")

    severity = "LOW"
    if anomaly_score > 0.8:
        severity = "CRITICAL"
    elif anomaly_score > 0.5:
        severity = "HIGH"
    elif anomaly_score > 0.3:
        severity = "MEDIUM"

    return {
        "wellId": request.well_id,
        "anomalyScore": round(anomaly_score, 2),
        "severity": severity,
        "signals": signals,
        "recommendation": "Review recent drilling parameter changes." if signals else "No significant anomalies detected.",
    }