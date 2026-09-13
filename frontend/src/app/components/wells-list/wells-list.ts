import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WellService, Well } from '../../services/well.service';

@Component({
  selector: 'app-wells-list',
  imports: [CommonModule],
  templateUrl: './wells-list.html',
  styleUrl: './wells-list.css',
})
export class WellsList implements OnInit {
  wells = signal<Well[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

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