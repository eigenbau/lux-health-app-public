import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { PatientDocumentReferenceStateService } from '../state/patient-document-reference-state.service';

@Injectable({
  providedIn: 'root',
})
export class DocumentReferenceIdGuard {
  constructor(
    private documentReferenceState: PatientDocumentReferenceStateService,
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    this.documentReferenceState.setDocumentReferenceId(
      route.params['documentReferenceId'],
    );
    return true;
  }
}
