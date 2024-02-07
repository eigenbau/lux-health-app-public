import { Routes } from '@angular/router';
import { ConditionIdGuard } from '@core/guards/condition-id.guard';

import { ConditionIdPage } from './condition-id.page';

export const routes: Routes = [
  {
    path: '',
    component: ConditionIdPage,
    canActivate: [ConditionIdGuard],
  },
];
