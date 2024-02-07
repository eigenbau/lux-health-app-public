import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'observation',
    pathMatch: 'full',
  },
  {
    path: 'observation',
    loadChildren: () =>
      import('./observation/observation.routes').then((m) => m.routes),
  },
  {
    path: 'chart',
    loadChildren: () => import('./chart/chart.routes').then((m) => m.routes),
  },
];
