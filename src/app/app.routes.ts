import { Routes } from '@angular/router';
import { PermissionsGuard } from '@core/guards/permissions.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./core/auth/auth.page').then((m) => m.AuthPage),
  },
  {
    path: 'app',
    loadChildren: () =>
      import('./core/navigation/split-pane/split-pane.routes').then(
        (m) => m.routes
      ),
    canActivate: [PermissionsGuard],
  },
  { path: '**', redirectTo: 'app' },
];
