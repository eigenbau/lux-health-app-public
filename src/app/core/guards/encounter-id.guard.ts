import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { PatientEncounterStateService } from '../state/patient-encounter-state.service';

@Injectable({
  providedIn: 'root',
})
export class EncounterIdGuard {
  constructor(private encounterState: PatientEncounterStateService) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    this.encounterState.setEncounterId(route.params['encounterId']);
    return true;
  }
}
