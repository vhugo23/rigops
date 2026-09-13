import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unreachable';
}

@Injectable({
  providedIn: 'root',
})
export class HealthService {
  constructor(private http: HttpClient) {}

  private checkOne(name: string, url: string): Observable<ServiceHealth> {
    return this.http.get(`${url}/health`).pipe(
      map(() => ({ name, status: 'healthy' as const })),
      catchError(() => of({ name, status: 'unreachable' as const })),
    );
  }

  checkAll(): Observable<ServiceHealth>[] {
    return [
      this.checkOne('Core API', environment.services.coreApi),
      this.checkOne('Telemetry Ingestion', environment.services.telemetry),
      this.checkOne('Anomaly Detection', environment.services.anomaly),
      this.checkOne('Notification Relay', environment.services.notification),
    ];
  }
}