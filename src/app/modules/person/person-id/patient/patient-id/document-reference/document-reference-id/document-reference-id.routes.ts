import { Routes } from '@angular/router';
import { DocumentReferenceIdGuard } from '@core/guards/document-reference-id.guard';

import { DocumentReferenceIdPage } from './document-reference-id.page';

export const routes: Routes = [
  {
    path: '',
    component: DocumentReferenceIdPage,
    canActivate: [DocumentReferenceIdGuard],
  },
];
