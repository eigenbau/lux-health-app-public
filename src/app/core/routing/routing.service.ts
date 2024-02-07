import { Injectable } from '@angular/core';
import { Reference } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/reference';
import {
  EMPTY,
  filter,
  map,
  Observable,
  of,
  pairwise,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';
import { FhirApiService } from '../fhir-api/fhir-api.service';
import { convertFhirBundleToPersonBundle } from '../utils/fhir/bundle-functions';
import {
  convertResourceTypeToPatch,
  getIdFromReference,
} from '../utils/fhir/resource-functions';
import { log } from '../utils/rxjs-log';
import { NavController } from '@ionic/angular';
import { NotificationsService } from '@core/notifications/notifications.service';
import { arrayHasValue } from '@core/utils/object-functions';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RoutingService {
  constructor(
    private fhirApi: FhirApiService,
    private navController: NavController,
    private notifications: NotificationsService,
  ) {}

  public getPatientRoute(
    patientReference: Reference['reference'],
    resourceType = '',
    resourceId = '',
  ): Observable<string[]> {
    const patientId = getIdFromReference(patientReference);
    const resourcePath = convertResourceTypeToPatch(resourceType);
    return this.fhirApi
      .getResourceBundle({
        resourceType: 'Patient',
        params: {
          _id: patientId,
          _revinclude: ['Person:link'],
        },
      })
      .pipe(
        map((bundle) => convertFhirBundleToPersonBundle(bundle)),
        log('getPatientRoute', this.constructor.name),
        map(
          (bundle) =>
            [
              'app/main/person',
              bundle.person.id,
              'patient',
              bundle?.patient?.id,
              resourcePath,
              resourceId,
            ].filter(String) as string[], // All undefined will be filtered
        ),
      );
  }

  public goBack(config: {
    resource: Observable<unknown>;
    loading: Observable<boolean>;
    route?: (string | number)[];
    relativeTo?: ActivatedRoute;
  }): Observable<void> {
    const { resource, loading = of(false), route = [], relativeTo } = config;

    // This takes the loading$ observable and filters it to only emit when the loading state changes from true to false,
    const initComplete$ = loading.pipe(
      pairwise(),
      filter(([prev, curr]) => prev === true && curr === false),
      map(([prev, curr]) => curr),
    );

    return initComplete$.pipe(
      withLatestFrom(resource),
      tap(([l, r]) => {
        if ((!r || (Array.isArray(r) && !arrayHasValue(r))) && !l) {
          this.notifications.showSuccess(
            `Resource not available. I'm taking you back.`,
          );
          Array.isArray(route) && arrayHasValue(route)
            ? this.navController.navigateBack(route, { relativeTo })
            : this.navController.pop();
        }
      }),
      switchMap(() => EMPTY),
    );
  }
}
