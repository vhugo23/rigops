import { Routes } from '@angular/router';
import { WellsList } from './components/wells-list/wells-list';
import { AlertsList } from './components/alerts-list/alerts-list';
import { WellDetail } from './components/well-detail/well-detail';

export const routes: Routes = [
  { path: 'wells', component: WellsList },
  { path: 'wells/:id', component: WellDetail },
  { path: 'alerts', component: AlertsList },
  { path: '', redirectTo: 'wells', pathMatch: 'full' },
];