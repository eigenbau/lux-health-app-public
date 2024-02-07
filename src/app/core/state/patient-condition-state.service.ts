import { Injectable, Injector } from '@angular/core';
import { BundleEntry } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/bundleEntry';
import { ICondition } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/ICondition';
import {
  catchError,
  map,
  Observable,
  of,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { log } from '../utils/rxjs-log';
import {
  initialResourceState,
  ResourceState,
  ResourceStateService,
} from './abstract-services/resource-state.service';
import { PatientStateService } from './patient-state.service';
import { Resource } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/resource';
import { PubSubService } from '@core/firebase/pub-sub.service';

interface ConditionState extends ResourceState {
  conditionId: string;
  history: BundleEntry[];
}

const initialConditionState = (patientId: string = ''): ConditionState => ({
  ...initialResourceState,
  history: [],
  conditionId: '',
  settings: {
    resourceType: 'Condition',
    params: {
      subject: `Patient/${patientId}`,
      _count: 1000,
      _sort: 'clinical-status,code,-date',
    },
  },
});
@Injectable({
  providedIn: 'root',
})
export class PatientConditionStateService extends ResourceStateService<ConditionState> {
  public readonly conditionList$ = this.select(
    (state) => state.entry?.map((e) => e?.resource as ICondition) || [],
  );

  public readonly condition$ = this.select(
    (state) =>
      state?.entry?.find((entry) => entry?.resource?.id === state.conditionId)
        ?.resource as ICondition | undefined,
  );

  public readonly history$ = this.select(
    (state) =>
      (state.history
        ?.map((bundleEntry) => bundleEntry.resource)
        .filter((r): r is Resource => r !== undefined) as ICondition[]) || [],
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
            conditionId: this.state.conditionId,
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
        resourceType: 'Condition',
        patient: this.patientState.patient$,
      })
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.getList()),
      )
      .subscribe();
  }

  // Public methods
  public setConditionId(conditionId: string): void {
    if (this.state.conditionId !== conditionId) {
      this.setState({ conditionId });
      this.setState({ history: undefined });
      this.getConditionHistory().subscribe();
    }
  }

  public postCondition(condition: ICondition): Observable<boolean> {
    return this.postResources(condition).pipe(
      switchMap(() => this.getConditionHistory()),
    );
  }

  // Private methods
  // - Observers of backend input
  private observePatientId(): Observable<string> {
    return this.patientState.patientId$;
  }

  private getConditionHistory(): Observable<boolean> {
    if (!this.state.conditionId) {
      return of(false);
    }

    this.loading();
    return this.fhirApi
      .getResourceHistory({
        resourceType: this.state.settings.resourceType,
        resourceId: this.state.conditionId,
      })
      .pipe(
        log('getConditionHistory', this.constructor.name),
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
