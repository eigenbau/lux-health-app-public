// NOTE:
// This guard attempts to load the person state for sub-routes of person-id
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { PersonStateService } from '../state/person-state.service';

@Injectable({
  providedIn: 'root',
})
export class PersonIdGuard {
  constructor(private personState: PersonStateService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    this.personState.setPersonId(route.params['personId']);
    return true;
  }
}
