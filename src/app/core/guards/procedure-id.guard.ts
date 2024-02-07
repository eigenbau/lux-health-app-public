import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { PatientProcedureStateService } from '../state/patient-procedure-state.service';

@Injectable({
  providedIn: 'root',
})
export class ProcedureIdGuard {
  constructor(private procedureState: PatientProcedureStateService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    this.procedureState.setProcedureId(route.params['procedureId']);
    return true;
  }
}
