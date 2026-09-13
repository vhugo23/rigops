import { Routes } from '@angular/router';
import { Overview } from './components/overview/overview';
import { WellsList } from './components/wells-list/wells-list';
import { AlertsList } from './components/alerts-list/alerts-list';
import { WellDetail } from './components/well-detail/well-detail';
import { SystemHealth } from './components/system-health/system-health';

export const routes: Routes = [
  { path: 'overview', component: Overview },
  { path: 'wells', component: WellsList },
  { path: 'wells/:id', component: WellDetail },
  { path: 'alerts', component: AlertsList },
  { path: 'system-health', component: SystemHealth },
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
];