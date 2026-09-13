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
}