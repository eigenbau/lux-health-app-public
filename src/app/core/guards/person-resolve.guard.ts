import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { FhirApiService } from '../fhir-api/fhir-api.service';
import { convertFhirBundleToPersonBundle } from '../utils/fhir/bundle-functions';
import { log } from '../utils/rxjs-log';
import { toPascalCase } from '../utils/string-functions';

@Injectable({
  providedIn: 'root',
})
export class PersonResolveGuard {
  constructor(
    private fhirApi: FhirApiService,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const resourceType = toPascalCase(route.params['resourceType']);
    console.log(route.params);
    return this.fhirApi
      .getResourceBundle({
        resourceType,
        params: {
          _id: route.params['id'],
          _revinclude: ['Person:link'],
        },
      })
      .pipe(
        map((bundle) => convertFhirBundleToPersonBundle(bundle)),
        map((personBundle) => personBundle.person.id),
        log('getResourceBundle', this.constructor.name),
        tap((id) => this.router.navigate(['app/main/person', id])),
        map(() => true),
      );
  }
}
