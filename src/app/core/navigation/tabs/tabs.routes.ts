import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: '',
        redirectTo: 'person',
        pathMatch: 'full',
      },
      {
        path: 'person',
        loadChildren: () =>
          import('../../../modules/person/person.routes').then((m) => m.routes),
      },
      {
        path: 'schedule',
        loadChildren: () =>
          import('../../../modules/schedule/schedule.routes').then(
            (m) => m.routes
          ),
      },
      {
        path: 'template',
        loadChildren: () =>
          import('../../../modules/template/template.routes').then(
            (m) => m.routes
          ),
      },
    ],
  },
];
