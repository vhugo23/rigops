import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService, Alert } from '../../services/alert.service';

@Component({
  selector: 'app-alerts-list',
  imports: [CommonModule],
  templateUrl: './alerts-list.html',
  styleUrl: './alerts-list.css',
})
export class AlertsList implements OnInit {
  alerts = signal<Alert[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  transitioning = signal<number | null>(null);

  activeAlerts = computed(() => this.alerts().filter((a) => a.status !== 3));
  resolvedAlerts = computed(() => this.alerts().filter((a) => a.status === 3));

  constructor(private alertService: AlertService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.alertService.getAll().subscribe({
      next: (alerts) => {
        this.alerts.set(alerts);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Unable to load alerts. Is the backend running?');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  advance(alert: Alert): void {
    const nextStatus = alert.status + 1;
    if (nextStatus > 3) {
      return;
    }

    this.transitioning.set(alert.id);
    this.alertService.transition(alert.id, nextStatus).subscribe({
      next: () => {
        this.transitioning.set(null);
        this.load();
      },
      error: (err) => {
        this.transitioning.set(null);
        console.error('Transition failed:', err);
      },
    });
  }

  severityLabel(severity: number): string {
    const labels: Record<number, string> = { 0: 'Low', 1: 'Medium', 2: 'High', 3: 'Critical' };
    return labels[severity] ?? 'Unknown';
  }

  statusLabel(status: number): string {
    const labels: Record<number, string> = { 0: 'New', 1: 'Acknowledged', 2: 'Investigating', 3: 'Resolved' };
    return labels[status] ?? 'Unknown';
  }

  nextActionLabel(status: number): string {
    const labels: Record<number, string> = { 0: 'Acknowledge', 1: 'Investigate', 2: 'Resolve' };
    return labels[status] ?? '';
  }
}