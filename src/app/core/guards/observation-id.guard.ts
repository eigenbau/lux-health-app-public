import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { PatientObservationStateService } from '../state/patient-observation-state.service';

@Injectable({
  providedIn: 'root',
})
export class ObservationIdGuard {
  constructor(private observationState: PatientObservationStateService) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    this.observationState.setObservationId(route.params['observationId']);
    return true;
  }
}
