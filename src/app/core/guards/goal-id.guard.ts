import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { PatientGoalStateService } from '../state/patient-goal-state.service';

@Injectable({
  providedIn: 'root',
})
export class GoalIdGuard {
  constructor(private goalState: PatientGoalStateService) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    this.goalState.setGoalId(route.params['goalId']);
    return true;
  }
}
