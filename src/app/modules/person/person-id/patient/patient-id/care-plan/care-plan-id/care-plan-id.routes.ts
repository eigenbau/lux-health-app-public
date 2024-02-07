import { Routes } from '@angular/router';
import { CarePlanIdGuard } from '@core/guards/care-plan-id.guard';

import { CarePlanIdPage } from './care-plan-id.page';

export const routes: Routes = [
  {
    path: '',
    component: CarePlanIdPage,
    canActivate: [CarePlanIdGuard],
  },
];
