import { Injectable, Injector } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  catchError,
  concatMap,
  map,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import {
  PersonBundle,
  PersonBundleChildResource,
} from '@models/person-bundle.model';
import { PersonList } from '@models/person-list.model';
import { FhirApiService } from '../fhir-api/fhir-api.service';
import {
  convertBundleEntryToPersonList,
  convertFhirBundleToPersonBundle,
  convertPersonBundleToFhirBundle,
} from '../utils/fhir/bundle-functions';
import { log } from '../utils/rxjs-log';
import { StateService } from './abstract-services/state.service';
import { PubSubService } from '@core/firebase/pub-sub.service';

interface State {
  personId: string;
  personBundle: PersonBundle | undefined;
  supporters: PersonList;
}

const initialState: State = {
  personId: '',
  personBundle: undefined,
  supporters: [],
};
@Injectable({
  providedIn: 'root',
})
export class PersonStateService extends StateService<State> {
  // State chunks
  public readonly personBundle$ = this.select((state) => state.personBundle);
  public readonly person$ = this.select((state) => state.personBundle?.person);
  public readonly patient$ = this.select(
    (state) => state.personBundle?.patient,
  );
  public readonly supporters$ = this.select((state) => state.supporters);

  protected pubSub: PubSubService;

  constructor(
    private fhirApi: FhirApiService,
    protected injector: Injector,
  ) {
    super(initialState);
    this.pubSub = injector.get(PubSubService);

    this.observePersonId()
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.getPerson()),
      )
      .subscribe();

    this.pubSub
      .observeFhirUpdates({
        resourceType: 'Person',
        person: this.person$,
        patient: this.patient$,
      })
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.getPerson()),
      )
      .subscribe();
  }

  // Public methods
  public setPersonId(personId: string): void {
    if (this.state.personId !== personId) {
      this.setState({ ...initialState, personId });
    }
  }

  // - Update
  public updatePerson(personBundle: PersonBundle): Observable<null> {
    this.loading();

    return this.fhirApi
      .postFhirBundle(convertPersonBundleToFhirBundle(personBundle))
      .pipe(
        log('updatePerson', this.constructor.name),
        tap(() => {
          this.setState({
            // FIXME: during this function, name, gender, address, and telecom are removed from
            // Patient, Practitioner, RelatedPerson.
            // The following FWD/BWD conversion adds these keys back to all resources.
            personBundle: convertFhirBundleToPersonBundle(
              convertPersonBundleToFhirBundle(personBundle),
            ),
          });
          this.loading(false);
        }),
        map(() => null),
        catchError(() => {
          this.loading(false);
          return of(null);
        }),
      );
  }

  // - Read
  public getPerson(): Observable<boolean> {
    if (!this.state.personId) {
      return of(false);
    }

    this.loading();
    this.setState({ personBundle: undefined, supporters: [] });
    return this.fhirApi
      .getResourceBundle({
        resourceType: 'Person',
        params: {
          _id: this.state.personId,
          _include: 'Person:link',
        },
      })
      .pipe(
        log('getPerson', this.constructor.name),
        map((bundle) => convertFhirBundleToPersonBundle(bundle)),
        concatMap((personBundle) => {
          if (!personBundle?.patient?.id) {
            return of({
              personBundle,
              supporters: [],
            });
          }
          // Get potential supporters if personBundle.patient exists
          return this.fhirApi
            .getResourceBundle({
              resourceType: 'RelatedPerson',
              params: {
                patient: personBundle.patient?.id,
                _revinclude: ['Person:link'],
                _sort: 'name',
              },
            })
            .pipe(
              map((bundle) => ({
                personBundle,
                supporters: convertBundleEntryToPersonList(bundle?.entry),
              })),
            );
        }),
        tap((state) => {
          this.setState({
            personBundle: state.personBundle,
            supporters: state.supporters,
          });
          this.loading(false);
        }),
        map((state) => !!state.personBundle),
        catchError(() => {
          this.loading(false);
          return of(false);
        }),
      );
  }

  // - Delete
  public deleteFhirPersonBundle(id: string): Observable<boolean> {
    return this.fhirApi.deleteFhirPersonBundle(id);
  }

  public deleteFhirPersonBundleChildResource(
    data: PersonBundleChildResource,
  ): Observable<boolean> {
    return this.fhirApi.deleteFhirPersonBundleChildResource(data);
  }

  // Private methods
  // - Observers of backend input
  private observePersonId(): Observable<string> {
    return this.select((state) => state.personId);
  }
}
