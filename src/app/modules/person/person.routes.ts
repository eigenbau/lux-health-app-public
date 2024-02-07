import { Routes } from '@angular/router';
import { PersonResolveGuard } from '@core/guards/person-resolve.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'directory',
    pathMatch: 'full',
  },
  {
    path: 'directory',
    loadChildren: () =>
      import('./directory/directory.routes').then((m) => m.routes),
  },
  {
    path: 'resolve/:resourceType/:id',
    canActivate: [PersonResolveGuard],
    loadComponent: () =>
      import('./resolve/resolve.page').then((m) => m.ResolvePage),
  },
  {
    path: ':personId',
    loadChildren: () =>
      import('./person-id/person-id.routes').then((m) => m.routes),
  },
];
