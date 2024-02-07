import { Routes } from '@angular/router';

import { ChartPage } from './chart.page';

export const routes: Routes = [
  {
    path: '',
    component: ChartPage,
  },
  {
    path: ':chartId',
    loadChildren: () =>
      import('./chart-id/chart-id.routes').then((m) => m.routes),
  },
];
