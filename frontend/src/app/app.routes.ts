import { Routes } from '@angular/router';
import { WellsList } from './components/wells-list/wells-list';

export const routes: Routes = [
  { path: 'wells', component: WellsList },
  { path: '', redirectTo: 'wells', pathMatch: 'full' },
];
