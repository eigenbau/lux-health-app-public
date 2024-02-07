import { Routes } from '@angular/router';
import { EncounterIdGuard } from '@core/guards/encounter-id.guard';

import { EncounterIdPage } from './encounter-id.page';

export const routes: Routes = [
  {
    path: '',
    component: EncounterIdPage,
    canActivate: [EncounterIdGuard],
  },
];
