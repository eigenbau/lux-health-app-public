import { Routes } from '@angular/router';

import { CarePlanPage } from './care-plan.page';

export const routes: Routes = [
  {
    path: '',
    component: CarePlanPage,
  },
  {
    path: ':carePlanId',
    loadChildren: () =>
      import('./care-plan-id/care-plan-id.routes').then((m) => m.routes),
  },
];
