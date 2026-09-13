import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WellService, Well } from '../../services/well.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-wells-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './wells-list.html',
  styleUrl: './wells-list.css',
})
export class WellsList implements OnInit {
  wells = signal<Well[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  totalCount = computed(() => this.wells().length);
  normalCount = computed(() => this.wells().filter((w) => w.status === 0).length);
  warningCount = computed(() => this.wells().filter((w) => w.status === 1).length);
  criticalCount = computed(() => this.wells().filter((w) => w.status === 2).length);

  constructor(private wellService: WellService) {}

  statusLabel(status: number): string {
    const labels: Record<number, string> = {
      0: 'Normal',
      1: 'Warning',
      2: 'Critical',
      3: 'Offline',
    };
    return labels[status] ?? 'Unknown';
  }

  ngOnInit(): void {
    this.wellService.getAll().subscribe({
      next: (wells) => {
        this.wells.set(wells);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Unable to load wells. Is the backend running?');
        this.loading.set(false);
        console.error(err);
      },
    });
  }
}