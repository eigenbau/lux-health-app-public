import { Injectable, Injector } from '@angular/core';
import { IObservation } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IObservation';
import {
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { ObservationBundle } from '@models/observation.model';
import {
  buildObservationBundle,
  orderObservationComponent,
  reduceToUniqueObservations,
} from '../utils/fhir/observation-functions';
import { arrayHasValue } from '../utils/object-functions';
import {
  initialResourceState,
  ResourceStateService,
  ResourceState,
} from './abstract-services/resource-state.service';
import { PatientStateService } from './patient-state.service';
import { PubSubService } from '@core/firebase/pub-sub.service';

interface ObservationState extends ResourceState {
  observationId: string;
  filter: {
    code: string;
  };
}

const initialObservationState = (patientId: string = ''): ObservationState => ({
  ...initialResourceState,
  observationId: '',
  filter: {
    code: '',
  },
  settings: {
    resourceType: 'Observation',
    params: {
      subject: `Patient/${patientId}`,
      _count: 1000,
      _sort: '-date,category,code',
    },
  },
});

@Injectable({
  providedIn: 'root',
})
export class PatientObservationStateService extends ResourceStateService<ObservationState> {
  public readonly observationList$ = this.select(
    // orderObservationComponent() can be applied to sort all observation components in the same order.
    // This improves data homogeneity and decreases chances of errors when e.g. rendering charts
    // from observation arrays with multiple components.
    // e.g. if two observations have a component for diastolic and systolic BP, but in different orders
    // i.e. one observation has diastolic BP at component[0] and the other observation has
    // systolic BP at component[0], the rendered data would be false
    (state) =>
      state.entry?.map((e) =>
        orderObservationComponent(e.resource as IObservation),
      ) || [],
    // (state) => state.entry?.map((e) => e.resource as IObservation)
  );
  public readonly observation$ = this.select(
    (state) =>
      state?.entry?.find((entry) => entry?.resource?.id === state.observationId)
        ?.resource as IObservation,
  );

  public readonly observationListOfLatestPerCode$: Observable<IObservation[]> =
    this.observationList$.pipe(map((o) => reduceToUniqueObservations(o)));

  public readonly observationFilteredByCode$: Observable<IObservation[]> =
    combineLatest([
      this.observationList$,
      this.select((s) => s.filter.code),
    ]).pipe(
      map(([observations, code]) =>
        !arrayHasValue(observations)
          ? []
          : observations.filter(
              (o) => o?.code?.coding && o.code.coding[0].code === code,
            ),
      ),
    );

  public readonly observationBundleList$: Observable<ObservationBundle[]> =
    combineLatest([
      this.observationList$,
      this.observationListOfLatestPerCode$,
    ]).pipe(
      map(([observationList, latestPerCode]) => {
        if (!latestPerCode) {
          return [];
        }
        const codes = latestPerCode.map((l) =>
          l?.code?.coding ? l.code.coding[0].code : '',
        );
        return codes
          .filter((c): c is string => c !== undefined && c !== '')
          .map((c) => buildObservationBundle(observationList, c));
      }),
    );

  constructor(
    protected override injector: Injector,
    private patientState: PatientStateService,
    private pubSub: PubSubService,
  ) {
    super(initialObservationState(), injector);

    this.observePatientId()
      .pipe(
        takeUntil(this.destroy$),
        tap((patientId) => {
          this.setState({
            ...initialObservationState(patientId),
            observationId: this.state.observationId,
            filter: { ...this.state.filter },
          });
        }),
        switchMap((patientId) => {
          if (patientId) {
            return this.getList();
          }
          return of(false);
        }),
      )
      .subscribe();

    this.pubSub
      .observeFhirUpdates({
        resourceType: 'Observation',
        patient: this.patientState.patient$,
      })
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.getList()),
      )
      .subscribe();
  }

  // Public methods
  setObservationId(observationId: string): void {
    if (this.state.observationId !== observationId) {
      this.setState({ observationId });
    }
  }

  setCode(code: string): void {
    this.setState({
      filter: {
        ...this.state.filter,
        code,
      },
    });
  }

  // Private methods
  // - Observers of backend input
  private observePatientId(): Observable<string> {
    return this.patientState.patientId$;
  }
}
