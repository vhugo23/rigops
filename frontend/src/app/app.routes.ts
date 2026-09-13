import { Routes } from '@angular/router';
import { WellsList } from './components/wells-list/wells-list';
import { AlertsList } from './components/alerts-list/alerts-list';

export const routes: Routes = [
  { path: 'wells', component: WellsList },
  { path: 'alerts', component: AlertsList },
  { path: '', redirectTo: 'wells', pathMatch: 'full' },
];