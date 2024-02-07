import { Injectable, Injector } from '@angular/core';
import { IProcedure } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IProcedure';
import { map, Observable, of, switchMap, takeUntil, tap } from 'rxjs';
import { objectHasKeys } from '../utils/object-functions';
import {
  initialResourceState,
  ResourceState,
  ResourceStateService,
} from './abstract-services/resource-state.service';
import { PatientStateService } from './patient-state.service';
import { PubSubService } from '@core/firebase/pub-sub.service';

interface ProcedureState extends ResourceState {
  procedureId: string;
  filter: {
    code: string;
  };
}

const initialProcedureState = (patientId: string = ''): ProcedureState => ({
  ...initialResourceState,
  procedureId: '',
  filter: {
    code: '',
  },
  settings: {
    resourceType: 'Procedure',
    params: {
      subject: `Patient/${patientId}`,
      _count: 1000,
      _sort: '-date,code',
    },
  },
});

@Injectable({
  providedIn: 'root',
})
export class PatientProcedureStateService extends ResourceStateService<ProcedureState> {
  public readonly procedureList$ = this.select(
    (state) => state.entry?.map((e) => e?.resource as IProcedure) || [],
  );

  public readonly historicalProcedures$ = this.procedureList$.pipe(
    map(
      (procedureList) =>
        procedureList?.filter(
          (procedure) => !objectHasKeys(procedure?.encounter, ['reference']),
        ),
    ),
  );

  public readonly encounterProcedures = this.procedureList$.pipe(
    map(
      (procedureList) =>
        procedureList?.filter((procedure) =>
          objectHasKeys(procedure?.encounter, ['reference']),
        ),
    ),
  );

  public readonly procedure$ = this.select(
    (state) =>
      state?.entry?.find((entry) => entry?.resource?.id === state.procedureId)
        ?.resource as IProcedure,
  );

  constructor(
    protected override injector: Injector,
    private patientState: PatientStateService,
    private pubSub: PubSubService,
  ) {
    super(initialProcedureState(), injector);
    this.observePatientId()
      .pipe(
        takeUntil(this.destroy$),
        tap((patientId) => {
          this.setState({
            ...initialProcedureState(patientId),
            procedureId: this.state.procedureId,
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
        resourceType: 'Procedure',
        patient: this.patientState.patient$,
      })
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.getList()),
      )
      .subscribe();
  }

  // Public methods
  public setProcedureId(procedureId: string): void {
    if (this.state.procedureId !== procedureId) {
      this.setState({ procedureId });
    }
  }

  // Private methods
  // - Observers of backend input
  private observePatientId(): Observable<string> {
    return this.patientState.patientId$;
  }
}
