import { Routes } from '@angular/router';
import { ObservationCodeGuard } from '@core/guards/observation-code.guard';

import { ObservationCodePage } from './observation-code.page';

export const routes: Routes = [
  {
    path: '',
    component: ObservationCodePage,
    canActivate: [ObservationCodeGuard],
  },
];
