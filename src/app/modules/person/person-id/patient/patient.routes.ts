import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/app/main/person/directory/patient',
    pathMatch: 'full',
  },
  {
    path: ':patientId',
    loadChildren: () =>
      import('./patient-id/patient-id.routes').then((m) => m.routes),
  },
  // {
  //   path: 'patient-id',
  //   loadChildren: () =>
  //     import('./patient-id/patient-id.routes').then((m) => m.routes),
  // },
];
