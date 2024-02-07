import { Routes } from '@angular/router';

import { GoalPage } from './goal.page';

export const routes: Routes = [
  {
    path: '',
    component: GoalPage,
  },
  {
    path: ':goalId',
    loadChildren: () =>
      import('./goal-id/goal-id.routes').then((m) => m.routes),
  },
];
