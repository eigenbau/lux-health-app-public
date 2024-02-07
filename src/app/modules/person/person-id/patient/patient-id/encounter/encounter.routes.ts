import { Routes } from '@angular/router';

import { EncounterPage } from './encounter.page';

export const routes: Routes = [
  {
    path: '',
    component: EncounterPage,
  },
  {
    path: ':encounterId',
    loadChildren: () =>
      import('./encounter-id/encounter-id.routes').then((m) => m.routes),
  },
];
