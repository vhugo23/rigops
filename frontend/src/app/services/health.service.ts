import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ServiceHealth {
  name: string;
  description: string;
  status: 'healthy' | 'unreachable';
  latencyMs: number;
  checkedAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class HealthService {
  constructor(private http: HttpClient) {}

  private checkOne(name: string, description: string, url: string): Observable<ServiceHealth> {
    const startedAt = performance.now();

    return this.http.get(`${url}/health`).pipe(
      map(() => ({
        name,
        description,
        status: 'healthy' as const,
        latencyMs: Math.round(performance.now() - startedAt),
        checkedAt: new Date(),
      })),
      catchError(() =>
        of({
          name,
          description,
          status: 'unreachable' as const,
          latencyMs: Math.round(performance.now() - startedAt),
          checkedAt: new Date(),
        }),
      ),
    );
  }

  checkAll(): Observable<ServiceHealth>[] {
    return [
      this.checkOne('Core API', 'Client-facing orchestration', environment.services.coreApi),
      this.checkOne('Telemetry Ingestion', 'Telemetry storage and retrieval', environment.services.telemetry),
      this.checkOne('Anomaly Detection', 'Stateless anomaly scoring', environment.services.anomaly),
      this.checkOne('Notification Relay', 'Notification audit relay', environment.services.notification),
    ];
  }
}