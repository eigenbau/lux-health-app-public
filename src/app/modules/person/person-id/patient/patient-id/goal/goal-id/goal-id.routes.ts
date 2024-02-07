import { Routes } from '@angular/router';
import { GoalIdGuard } from '@core/guards/goal-id.guard';

import { GoalIdPage } from './goal-id.page';

export const routes: Routes = [
  {
    path: '',
    component: GoalIdPage,
    canActivate: [GoalIdGuard],
  },
];
