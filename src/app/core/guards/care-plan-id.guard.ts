import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { PatientCarePlanStateService } from '../state/patient-care-plan-state.service';

@Injectable({
  providedIn: 'root',
})
export class CarePlanIdGuard {
  constructor(private carePlanState: PatientCarePlanStateService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    this.carePlanState.setCarePlanId(route.params['carePlanId']);
    return true;
  }
}
