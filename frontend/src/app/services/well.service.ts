import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Well {
  id: number;
  name: string;
  status: number;
  currentDepth: number;
  createdAt: string;
  rigId: number;
  rigName: string | null;
}

export interface TelemetryReading {
  id: number;
  well_id: number;
  timestamp: string;
  depth: number;
  rate_of_penetration: number;
  weight_on_bit: number;
  torque: number;
  rpm: number;
  pressure: number;
  temperature: number;
  mud_flow: number;
  vibration: number;
}

export interface AnomalyResult {
  wellId: string;
  anomalyScore: number;
  severity: string;
  signals: string[];
  recommendation: string;
}

@Injectable({
  providedIn: 'root',
})
export class WellService {
  private readonly baseUrl = `${environment.apiBaseUrl}/wells`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Well[]> {
    return this.http.get<Well[]>(this.baseUrl);
  }

  getById(id: number): Observable<Well> {
    return this.http.get<Well>(`${this.baseUrl}/${id}`);
  }

  getTelemetry(id: number, limit = 50): Observable<TelemetryReading[]> {
    return this.http.get<TelemetryReading[]>(`${this.baseUrl}/${id}/telemetry?limit=${limit}`);
  }

  checkAnomaly(id: number): Observable<AnomalyResult> {
    return this.http.get<AnomalyResult>(`${this.baseUrl}/${id}/anomaly-check`);
  }
}