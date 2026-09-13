import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Alert {
  id: number;
  severity: number;
  signal: string;
  anomalyScore: number;
  status: number;
  detectedAt: string;
  wellId: number;
}

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private readonly baseUrl = `${environment.apiBaseUrl}/alerts`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Alert[]> {
    return this.http.get<Alert[]>(this.baseUrl);
  }

  transition(id: number, newStatus: number): Observable<Alert> {
    return this.http.post<Alert>(`${this.baseUrl}/${id}/transition`, { newStatus });
  }
}