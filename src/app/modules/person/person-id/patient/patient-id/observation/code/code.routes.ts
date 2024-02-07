import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/app/main/person/directory/patient',
    pathMatch: 'full',
  },
  {
    path: ':observationCode',
    loadChildren: () =>
      import('./observation-code/observation-code.routes').then(
        (m) => m.routes
      ),
  },
];
