import { Routes } from '@angular/router';

import { ObservationPage } from './observation.page';

export const routes: Routes = [
  {
    path: '',
    component: ObservationPage,
  },
  {
    path: 'code',
    loadChildren: () => import('./code/code.routes').then((m) => m.routes),
  },
  {
    path: ':observationId',
    loadChildren: () =>
      import('./observation-id/observation-id.routes').then((m) => m.routes),
  },
];
