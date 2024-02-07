import { Routes } from '@angular/router';
import { PatientIdPage } from './patient-id.page';

export const routes: Routes = [
  {
    path: '',
    component: PatientIdPage,
  },
  {
    path: 'encounter',
    loadChildren: () =>
      import('./encounter/encounter.routes').then((m) => m.routes),
  },
  {
    path: 'observation',
    loadChildren: () =>
      import('./observation/observation.routes').then((m) => m.routes),
  },
  {
    path: 'procedure',
    loadChildren: () =>
      import('./procedure/procedure.routes').then((m) => m.routes),
  },
  {
    path: 'condition',
    loadChildren: () =>
      import('./condition/condition.routes').then((m) => m.routes),
  },
  {
    path: 'care-plan',
    loadChildren: () =>
      import('./care-plan/care-plan.routes').then((m) => m.routes),
  },
  {
    path: 'goal',
    loadChildren: () => import('./goal/goal.routes').then((m) => m.routes),
  },
  {
    path: 'document-reference',
    loadChildren: () =>
      import('./document-reference/document-reference.routes').then(
        (m) => m.routes
      ),
  },
];
