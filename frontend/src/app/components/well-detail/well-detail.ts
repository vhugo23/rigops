import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { WellService, Well, TelemetryReading, AnomalyResult } from '../../services/well.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-well-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './well-detail.html',
  styleUrl: './well-detail.css',
})
export class WellDetail implements OnInit {
  well = signal<Well | null>(null);
  telemetry = signal<TelemetryReading[]>([]);
  detailLoading = signal(true);
  detailError = signal<string | null>(null);

  anomalyResult = signal<AnomalyResult | null>(null);
  anomalyLoading = signal(false);
  anomalyError = signal<string | null>(null);

  private wellId!: number;

  constructor(
    private route: ActivatedRoute,
    private wellService: WellService,
  ) {}

  ngOnInit(): void {
    this.wellId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadWellAndTelemetry();
  }

  loadWellAndTelemetry(): void {
    this.detailLoading.set(true);
    this.detailError.set(null);

    this.wellService.getById(this.wellId).subscribe({
      next: (well) => {
        this.well.set(well);
        this.wellService.getTelemetry(this.wellId, 20).subscribe({
          next: (readings) => {
            this.telemetry.set(readings);
            this.detailLoading.set(false);
          },
          error: () => {
            this.detailError.set('Telemetry data is temporarily unavailable.');
            this.detailLoading.set(false);
          },
        });
      },
      error: () => {
        this.detailError.set('Unable to load this well.');
        this.detailLoading.set(false);
      },
    });
  }

  runAnomalyCheck(): void {
    this.anomalyLoading.set(true);
    this.anomalyError.set(null);
    this.anomalyResult.set(null);

    this.wellService.checkAnomaly(this.wellId).subscribe({
      next: (result) => {
        this.anomalyResult.set(result);
        this.anomalyLoading.set(false);
      },
      error: () => {
        this.anomalyError.set('Anomaly detection is temporarily unavailable. Telemetry monitoring remains operational.');
        this.anomalyLoading.set(false);
      },
    });
  }
}