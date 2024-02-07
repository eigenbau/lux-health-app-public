import { Routes } from '@angular/router';

import { SplitPanePage } from './split-pane.page';

export const routes: Routes = [
  {
    path: '',
    component: SplitPanePage,
    children: [
      {
        path: '',
        redirectTo: 'main',
        pathMatch: 'full',
      },

      {
        path: 'main',
        loadChildren: () => import('../tabs/tabs.routes').then((m) => m.routes),
      },
    ],
  },
];
