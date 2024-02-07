import { Routes } from '@angular/router';
import { PersonIdGuard } from '@core/guards/person-id.guard';

import { PersonIdPage } from './person-id.page';

export const routes: Routes = [
  {
    path: '',
    component: PersonIdPage,
    canActivate: [PersonIdGuard],
  },
  {
    path: 'patient',
    loadChildren: () =>
      import('./patient/patient.routes').then((m) => m.routes),
    canActivate: [PersonIdGuard],
  },
];
