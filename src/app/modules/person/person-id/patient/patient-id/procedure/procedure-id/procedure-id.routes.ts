import { Routes } from '@angular/router';
import { ProcedureIdGuard } from '@core/guards/procedure-id.guard';

import { ProcedureIdPage } from './procedure-id.page';

export const routes: Routes = [
  {
    path: '',
    component: ProcedureIdPage,
    canActivate: [ProcedureIdGuard],
  },
];
