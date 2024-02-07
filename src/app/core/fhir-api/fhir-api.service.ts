import { Injectable } from '@angular/core';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { IBundle } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IBundle';

import { environment } from '../../../environments/environment';
import { BundleResponse } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/bundleResponse';
import { Params } from '@angular/router';
import { Functions, httpsCallableData } from '@angular/fire/functions';
import { PersonBundleChildResource } from '@models/person-bundle.model';

//const apiUrl = `${environment.gcpHealthcare.fhirStoreUrl()}/fhir/`;
// Flag for calling Production OR Dev cloud functions, wich in turn call separate Fhir servers
const devFlag = environment.production ? '' : 'Dev';

@Injectable({
  providedIn: 'root',
})
export class FhirApiService {
  constructor(private functions: Functions) {}

  // Public methods
  // - Create / Update
  public postFhirBundle(fhirBundle: IBundle): Observable<BundleResponse> {
    const callablePostBundle = httpsCallableData<IBundle, BundleResponse>(
      this.functions,
      `postFhirBundle${devFlag}`,
    );
    return callablePostBundle(fhirBundle).pipe(
      catchError((e) => {
        throw new Error(e);
      }),
    );
  }

  // - Read
  public getResourceBundle(
    config: {
      resourceType?: string;
      params?: Params;
    } = {},
  ): Observable<IBundle> {
    const { resourceType = null, params: paramsObj = null } = config;
    if (resourceType === null) {
      throw new Error('No resourceType supplied.');
    }

    const callableGetResourceBundle = httpsCallableData<
      { [key: string]: string },
      any
    >(this.functions, `getFhirBundle${devFlag}`);

    return callableGetResourceBundle({ resourceType, ...paramsObj }).pipe(
      tap((res) => console.log(res)),
      map((res) => res.data),
      catchError((e) => {
        throw new Error(e);
      }),
    );
  }

  public getResourceHistory(
    config: {
      resourceType?: string;
      resourceId?: string;
    } = {},
  ): Observable<IBundle> {
    const { resourceType, resourceId } = config;
    if (!resourceType || !resourceId) {
      throw new Error('No resourceType or ID supplied.');
    }

    const callableGetResourceBundle = httpsCallableData<
      { resourceType: string; resourceId: string },
      any
    >(this.functions, `getFhirResourceHistory${devFlag}`);

    return callableGetResourceBundle({ resourceType, resourceId }).pipe(
      map((res) => res.data),
      catchError((e) => {
        throw new Error(e);
      }),
    );
  }

  // - Update

  // - Delete & Purge history
  public deleteFhirResource(
    resourceType: string = '',
    id: string = '',
  ): Observable<boolean> {
    if (!resourceType || !id) {
      return of(false);
    }

    const callableDeleteFhirResource = httpsCallableData<{
      resourceType: string;
      id: string;
    }>(this.functions, `deleteFhirResource${devFlag}`);
    const deleteFhirResource$ = callableDeleteFhirResource({
      resourceType,
      id,
    });

    return deleteFhirResource$.pipe(
      map(() => true),
      catchError((e) => {
        console.error(e);
        return of(false);
      }),
    );
  }

  public deleteFhirPersonBundleChildResource(
    data: PersonBundleChildResource,
  ): Observable<boolean> {
    const callableDeleteFhirPersonBundleChildResource =
      httpsCallableData<PersonBundleChildResource>(
        this.functions,
        `deleteFhirPersonBundleChildResource${devFlag}`,
      );
    const deleteFhirPersonBundleChildResource$ =
      callableDeleteFhirPersonBundleChildResource(data);

    return deleteFhirPersonBundleChildResource$.pipe(
      map(() => true),
      catchError((e) => {
        console.error(e);
        return of(false);
      }),
    );
  }

  public deleteFhirPersonBundle(id: string = ''): Observable<boolean> {
    if (!id) {
      return of(false);
    }

    const callableDeleteFhirPersonBundle = httpsCallableData<string>(
      this.functions,
      `deleteFhirPersonBundle${devFlag}`,
    );
    const deleteFhirPersonBundle$ = callableDeleteFhirPersonBundle(id);

    return deleteFhirPersonBundle$.pipe(
      map(() => true),
      catchError((e) => {
        console.error(e);
        return of(false);
      }),
    );
  }
}
