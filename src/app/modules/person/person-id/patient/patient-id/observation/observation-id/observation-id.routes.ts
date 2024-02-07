import { Routes } from '@angular/router';
import { ObservationIdGuard } from '@core/guards/observation-id.guard';

import { ObservationIdPage } from './observation-id.page';

export const routes: Routes = [
  {
    path: '',
    component: ObservationIdPage,
    canActivate: [ObservationIdGuard],
  },
];
