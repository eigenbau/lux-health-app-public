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
export class DirectoryGuard {
  constructor(private personState: PersonStateService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (state.url.includes('/directory/')) {
      this.personState.setPersonId('');
    }
    return true;
  }
}
