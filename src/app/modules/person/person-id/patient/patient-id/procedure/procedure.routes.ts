import { Routes } from '@angular/router';

import { ProcedurePage } from './procedure.page';

export const routes: Routes = [
  {
    path: '',
    component: ProcedurePage,
  },
  {
    path: ':procedureId',
    loadChildren: () =>
      import('./procedure-id/procedure-id.routes').then((m) => m.routes),
  },
];
