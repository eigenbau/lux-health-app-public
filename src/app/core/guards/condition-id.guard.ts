import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { PatientConditionStateService } from '../state/patient-condition-state.service';

@Injectable({
  providedIn: 'root',
})
export class ConditionIdGuard {
  constructor(private conditionState: PatientConditionStateService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    this.conditionState.setConditionId(route.params['conditionId']);
    return true;
  }
}
