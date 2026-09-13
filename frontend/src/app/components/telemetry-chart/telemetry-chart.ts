import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { TelemetryReading } from '../../services/well.service';

@Component({
  selector: 'app-telemetry-chart',
  imports: [],
  templateUrl: './telemetry-chart.html',
  styleUrl: './telemetry-chart.css',
})
export class TelemetryChart implements AfterViewInit, OnChanges {
  @Input() readings: TelemetryReading[] = [];
  @Input() mode: 'pressure' | 'correlated' = 'pressure';

  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.render();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['readings'] && this.canvasRef) {
      this.render();
    }
  }

  private render(): void {
    if (!this.canvasRef) {
      return;
    }

    // Reverse: readings arrive newest-first from the API, charts read left-to-right oldest-first
    const ordered = [...this.readings].reverse();
    const labels = ordered.map((r) =>
      new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    );

    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (!ctx) {
      return;
    }

    if (this.mode === 'pressure') {
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Pressure (psi)',
              data: ordered.map((r) => r.pressure),
              borderColor: '#4f8ef7',
              backgroundColor: 'rgba(79, 142, 247, 0.08)',
              fill: true,
              tension: 0.2,
              pointRadius: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { title: { display: true, text: 'psi' } } },
        },
      });
    } else {
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'ROP',
              data: ordered.map((r) => r.rate_of_penetration),
              borderColor: '#2e9e5b',
              tension: 0.2,
              pointRadius: 1,
            },
            {
              label: 'Torque',
              data: ordered.map((r) => r.torque),
              borderColor: '#8a5a00',
              tension: 0.2,
              pointRadius: 1,
            },
            {
              label: 'Vibration',
              data: ordered.map((r) => r.vibration),
              borderColor: '#b02a2a',
              tension: 0.2,
              pointRadius: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: true, position: 'bottom' } },
        },
      });
    }
  }
}