import { Routes } from '@angular/router';

import { DocumentReferencePage } from './document-reference.page';

export const routes: Routes = [
  {
    path: '',
    component: DocumentReferencePage,
  },
  {
    path: ':documentReferenceId',
    loadChildren: () =>
      import('./document-reference-id/document-reference-id.routes').then(
        (m) => m.routes
      ),
  },
];
