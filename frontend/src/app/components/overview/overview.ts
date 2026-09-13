import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WellService, Well } from '../../services/well.service';
import { AlertService, Alert } from '../../services/alert.service';

@Component({
  selector: 'app-overview',
  imports: [CommonModule, RouterLink],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})
export class Overview implements OnInit {
  wells = signal<Well[]>([]);
  alerts = signal<Alert[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  activeWellsCount = computed(() => this.wells().filter((w) => w.status !== 3).length);
  criticalWellsCount = computed(() => this.wells().filter((w) => w.status === 2).length);
  activeAlertsCount = computed(() => this.alerts().filter((a) => a.status !== 3).length);
  activeAlerts = computed(() => this.alerts().filter((a) => a.status !== 3));

  constructor(
    private wellService: WellService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.wellService.getAll().subscribe({
      next: (wells) => {
        this.wells.set(wells);
        this.alertService.getAll().subscribe({
          next: (alerts) => {
            this.alerts.set(alerts);
            this.loading.set(false);
          },
          error: () => {
            this.error.set('Unable to load alerts.');
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.error.set('Unable to load wells.');
        this.loading.set(false);
      },
    });
  }

  statusLabel(status: number): string {
    const labels: Record<number, string> = { 0: 'Normal', 1: 'Warning', 2: 'Critical', 3: 'Offline' };
    return labels[status] ?? 'Unknown';
  }

  severityLabel(severity: number): string {
    const labels: Record<number, string> = { 0: 'Low', 1: 'Medium', 2: 'High', 3: 'Critical' };
    return labels[severity] ?? 'Unknown';
  }

  alertStatusLabel(status: number): string {
    const labels: Record<number, string> = { 0: 'New', 1: 'Acknowledged', 2: 'Investigating', 3: 'Resolved' };
    return labels[status] ?? 'Unknown';
  }
}