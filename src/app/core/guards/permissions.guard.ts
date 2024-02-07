import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { from, map, Observable, of, switchMap, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';
import { NotificationsService } from '../notifications/notifications.service';

const production = environment.production;
@Injectable({
  providedIn: 'root',
})
export class PermissionsGuard {
  constructor(
    private router: Router,
    private auth: AuthService,
    private notifications: NotificationsService,
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.auth.user$.pipe(
      take(1),
      switchMap((user) => {
        if (user) {
          return from(user.getIdTokenResult());
        }
        return of(null);
      }),
      map((idTokenResult) => {
        if (!idTokenResult) {
          return false;
        }
        return production
          ? !!idTokenResult.claims['admin']
          : !!idTokenResult.claims['devAdmin'];
      }),
      tap((hasAdminPermissions) => {
        if (!hasAdminPermissions) {
          this.notifications.showError(
            `You don't have sufficient permissions. Contact pascalbolla@gmail.com to request access.`,
          );
          this.auth.onSignOut();
          this.router.navigate(['/auth']);
        }
      }),
    );
  }
}
