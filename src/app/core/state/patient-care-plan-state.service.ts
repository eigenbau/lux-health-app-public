import { Injectable, Injector } from '@angular/core';
import { BundleEntry } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/models-r4';
import { ICarePlan } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/ICarePlan';
import {
  takeUntil,
  tap,
  switchMap,
  of,
  Observable,
  map,
  catchError,
} from 'rxjs';
import { reduceToUniqueArray } from '../utils/object-functions';
import { log } from '../utils/rxjs-log';
import {
  ResourceState,
  initialResourceState,
  ResourceStateService,
} from './abstract-services/resource-state.service';
import { PatientStateService } from './patient-state.service';
import { PubSubService } from '@core/firebase/pub-sub.service';

interface CarePlanState extends ResourceState {
  carePlanId: string;
  history: BundleEntry[];
}

const initialConditionState = (patientId: string = ''): CarePlanState => ({
  ...initialResourceState,
  history: [],
  carePlanId: '',
  settings: {
    resourceType: 'CarePlan',
    params: {
      subject: `Patient/${patientId}`,
      _count: 1000,
      _sort: 'status,code,-date',
    },
  },
});
@Injectable({
  providedIn: 'root',
})
export class PatientCarePlanStateService extends ResourceStateService<CarePlanState> {
  public readonly carePlanList$ = this.select(
    (state) => state.entry?.map((e) => e?.resource as ICarePlan) || [],
  );

  public readonly carePlan$ = this.select(
    (state) =>
      state?.entry?.find((entry) => entry?.resource?.id === state.carePlanId)
        ?.resource as ICarePlan,
  );

  public readonly goalReferencesFromAllActivities$ = this.carePlan$.pipe(
    map((carePlan) => carePlan?.activity || []),
    map(
      (activities) =>
        activities?.map((activity) => activity?.detail?.goal || []),
    ),
    map((refs) => refs?.flat() || []),
    map((references) =>
      references ? reduceToUniqueArray(references, ['reference']) : [],
    ),
  );

  public readonly history$ = this.select(
    (state) =>
      state?.history?.map((bundleEntry) => bundleEntry.resource as ICarePlan),
  );

  constructor(
    protected override injector: Injector,
    private patientState: PatientStateService,
    private pubSub: PubSubService,
  ) {
    super(initialConditionState(), injector);
    this.observePatientId()
      .pipe(
        takeUntil(this.destroy$),
        tap((patientId) => {
          this.setState({
            ...initialConditionState(patientId),
            carePlanId: this.state.carePlanId,
            history: this.state.history,
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
        resourceType: 'CarePlan',
        patient: this.patientState.patient$,
      })
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.getList()),
      )
      .subscribe();
  }

  // Public methods
  public setCarePlanId(carePlanId: string): void {
    if (this.state.carePlanId !== carePlanId) {
      this.setState({ carePlanId });
      this.setState({ history: undefined });
      //this.getResourceHistory().subscribe();
    }
  }

  public postCarePlan(carePlan: ICarePlan): Observable<boolean> {
    return this.postResources(carePlan)
      .pipe
      //switchMap(() => this.getResourceHistory())
      ();
  }

  // Private methods
  // - Observers of backend input
  private observePatientId(): Observable<string> {
    return this.patientState.patientId$;
  }

  private getResourceHistory(): Observable<boolean> {
    if (!this.state.carePlanId) {
      return of(false);
    }

    this.loading();
    return this.fhirApi
      .getResourceHistory({
        resourceType: this.state.settings.resourceType,
        resourceId: this.state.carePlanId,
      })
      .pipe(
        log('getCarePlanHistory', this.constructor.name),
        tap(({ entry }) => {
          this.setState({ history: entry });
          this.loading(false);
        }),
        map((bundle) => !!bundle.entry),
        catchError(() => {
          this.loading(false);
          return of(false);
        }),
      );
  }
}
