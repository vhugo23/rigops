import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { HealthService, ServiceHealth } from '../../services/health.service';

@Component({
  selector: 'app-system-health',
  imports: [CommonModule],
  templateUrl: './system-health.html',
  styleUrl: './system-health.css',
})
export class SystemHealth implements OnInit {
  services = signal<ServiceHealth[]>([]);
  loading = signal(true);

  constructor(private healthService: HealthService) {}

  ngOnInit(): void {
    this.check();
  }

  check(): void {
    this.loading.set(true);
    forkJoin(this.healthService.checkAll()).subscribe((results) => {
      this.services.set(results);
      this.loading.set(false);
    });
  }
}