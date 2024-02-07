import { Routes } from '@angular/router';
import { DirectoryPage } from './directory.page';
import { DirectoryGuard } from '@core/guards/directory.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'patient',
    pathMatch: 'full',
  },
  {
    path: ':resourceType',
    component: DirectoryPage,
    canActivate: [DirectoryGuard],
  },
];
