import { Injectable, Injector } from '@angular/core';
import { BundleEntry } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/bundleEntry';
import { IGoal } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IGoal';
import {
  takeUntil,
  tap,
  switchMap,
  of,
  Observable,
  map,
  catchError,
} from 'rxjs';
import { log } from '../utils/rxjs-log';
import {
  initialResourceState,
  ResourceState,
  ResourceStateService,
} from './abstract-services/resource-state.service';
import { PatientStateService } from './patient-state.service';
import { PubSubService } from '@core/firebase/pub-sub.service';

interface GoalState extends ResourceState {
  goalId: string;
  history: BundleEntry[];
}

const initialGoalState = (patientId: string = ''): GoalState => ({
  ...initialResourceState,
  history: [],
  goalId: '',
  settings: {
    resourceType: 'Goal',
    params: {
      subject: `Patient/${patientId}`,
      _count: 1000,
      _sort: '-date',
    },
  },
});
@Injectable({
  providedIn: 'root',
})
export class PatientGoalStateService extends ResourceStateService<GoalState> {
  public readonly goalList$ = this.select(
    (state) => state.entry?.map((e) => e?.resource as IGoal) || [],
  );

  public readonly goal$ = this.select(
    (state) =>
      state?.entry?.find((entry) => entry?.resource?.id === state.goalId)
        ?.resource as IGoal,
  );

  public readonly history$ = this.select(
    (state) =>
      state?.history?.map((bundleEntry) => bundleEntry.resource as IGoal),
  );

  constructor(
    protected override injector: Injector,
    private patientState: PatientStateService,
    private pubSub: PubSubService,
  ) {
    super(initialGoalState(), injector);
    this.observePatientId()
      .pipe(
        takeUntil(this.destroy$),
        tap((patientId) => {
          this.setState({
            ...initialGoalState(patientId),
            goalId: this.state.goalId,
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
        resourceType: 'Goal',
        patient: this.patientState.patient$,
      })
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.getList()),
      )
      .subscribe();
  }

  // Public methods
  public setGoalId(goalId: string): void {
    if (this.state.goalId !== goalId) {
      this.setState({ goalId });
      this.setState({ history: undefined });
      this.getGoalHistory().subscribe();
    }
  }

  public postGoal(goal: IGoal): Observable<boolean> {
    return this.postResources(goal).pipe(
      switchMap(() => this.getGoalHistory()),
    );
  }

  // Private methods
  // - Observers of backend input
  private observePatientId(): Observable<string> {
    return this.patientState.patientId$;
  }

  private getGoalHistory(): Observable<boolean> {
    if (!this.state.goalId) {
      return of(false);
    }

    this.loading();
    return this.fhirApi
      .getResourceHistory({
        resourceType: this.state.settings.resourceType,
        resourceId: this.state.goalId,
      })
      .pipe(
        log('getGoalHistory', this.constructor.name),
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
