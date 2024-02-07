import { Routes } from '@angular/router';

import { ConditionPage } from './condition.page';

export const routes: Routes = [
  {
    path: '',
    component: ConditionPage,
  },
  {
    path: ':conditionId',
    loadChildren: () =>
      import('./condition-id/condition-id.routes').then((m) => m.routes),
  },
];
