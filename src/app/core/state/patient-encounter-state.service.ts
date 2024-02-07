import { Injectable, Injector } from '@angular/core';
import { IEncounter } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IEncounter';
import { Observable, of, switchMap, takeUntil, tap } from 'rxjs';
import {
  initialResourceState,
  ResourceStateService,
  ResourceState,
} from './abstract-services/resource-state.service';
import { PatientStateService } from './patient-state.service';
import { PubSubService } from '@core/firebase/pub-sub.service';

interface EncounterState extends ResourceState {
  encounterId: string;
}

const initialEncounterState = (patientId: string = ''): EncounterState => ({
  ...initialResourceState,
  encounterId: '',
  settings: {
    resourceType: 'Encounter',
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
export class PatientEncounterStateService extends ResourceStateService<EncounterState> {
  public readonly encounterList$ = this.select(
    (state) => state.entry?.map((e) => e?.resource as IEncounter) || [],
  );

  public readonly encounter$ = this.select(
    (state) =>
      state?.entry?.find((entry) => entry?.resource?.id === state.encounterId)
        ?.resource as IEncounter,
  );

  constructor(
    protected override injector: Injector,
    private patientState: PatientStateService,
    private pubSub: PubSubService,
  ) {
    super(initialEncounterState(), injector);

    this.observePatientId()
      .pipe(
        takeUntil(this.destroy$),
        tap((patientId) => {
          this.setState({
            ...initialEncounterState(patientId),
            encounterId: this.state.encounterId,
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
        resourceType: 'Encounter',
        patient: this.patientState.patient$,
      })
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.getList()),
      )
      .subscribe();
  }

  // Public methods
  public setEncounterId(encounterId: string): void {
    if (this.state.encounterId !== encounterId) {
      this.setState({ encounterId });
    }
  }

  // public deleteResource(id: string): Observable<boolean> {
  //   const deleteRelated$ = of(null).pipe(
  //     withLatestFrom(
  //       this.observations$,
  //       this.procedures$,
  //       this.documentReferences$,
  //       this.conditions$
  //     ),
  //     concatMap(
  //       ([
  //         _,
  //         observations = [],
  //         procedures = [],
  //         documentReferences = [],
  //         conditions = [],
  //       ]) =>
  //         // delete related resources via related resourceState methods
  //         combineLatest([
  //           of(true), // returns observable, even if no related resources exists
  //           ...observations?.map((o) =>
  //             this.observationState.deleteResource(o.id)
  //           ),
  //           ...procedures?.map((p) => this.procedureState.deleteResource(p.id)),
  //           ...documentReferences?.map(
  //             (d) => this.documentReferenceState.deleteResource(d.id),
  //             ...conditions?.map((c) =>
  //               this.conditionState.deleteResource(c.id)
  //             )
  //           ),
  //         ])
  //     ),
  //     map((deleteSuccessArray) => deleteSuccessArray.every((x) => x))
  //   );

  //   return deleteRelated$.pipe(
  //     concatMap((allRelatedResourcesDeleted) =>
  //       // delete resource if all related sources are deleted
  //       allRelatedResourcesDeleted
  //         ? this.fhirApi.deleteFhirResource(
  //             this.state.settings.resourceType,
  //             id
  //           )
  //         : of(false)
  //     ),
  //     concatMap((success) => (success ? this.getList() : of(false)))
  //   );
  // }

  // Private methods
  // - Observers of backend input
  private observePatientId(): Observable<string> {
    return this.patientState.patientId$;
  }
}
