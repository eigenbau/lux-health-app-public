import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  ActionSheetController,
  AlertController,
  IonRefresher,
  IonicModule,
} from '@ionic/angular';
import {
  combineLatest,
  map,
  Observable,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { PatientCarePlanStateService } from '@core/state/patient-care-plan-state.service';
import { PatientConditionStateService } from '@core/state/patient-condition-state.service';
import { PatientDocumentReferenceStateService } from '@core/state/patient-document-reference-state.service';
import { PatientEncounterStateService } from '@core/state/patient-encounter-state.service';
import { PatientGoalStateService } from '@core/state/patient-goal-state.service';
import { PatientObservationStateService } from '@core/state/patient-observation-state.service';
import { PatientProcedureStateService } from '@core/state/patient-procedure-state.service';
import { trackByIdGeneric } from '@core/utils/angular-functions';
import { hasCurrentGoals } from '@core/utils/fhir/condition-functions';
import { ObservationBundle } from '@models/observation.model';
import { ObservationItemComponent } from '@components/resource-list-items/observation-item/observation-item.component';
import { DocumentReferenceItemComponent } from '@components/resource-list-items/document-reference-item/document-reference-item.component';
import { ProcedureItemComponent } from '@components/resource-list-items/procedure-item/procedure-item.component';
import { EncounterItemComponent } from '@components/resource-list-items/encounter-item/encounter-item.component';
import { CarePlanItemComponent } from '@components/resource-list-items/care-plan-item/care-plan-item.component';
import { GoalItemComponent } from '@components/resource-list-items/goal-item/goal-item.component';
import { RouterLink } from '@angular/router';
import { ConditionItemComponent } from '@components/resource-list-items/condition-item/condition-item.component';
import { PatientObservationListInputDirective } from '@directives/modal-handlers/patient-observation-list-input/patient-observation-list-input.directive';
import { PatientDocumentReferenceInputDirective } from '@directives/modal-handlers/patient-document-reference-input/patient-document-reference-input.directive';
import { PatientProcedureInputDirective } from '@directives/modal-handlers/patient-procedure-input/patient-procedure-input.directive';
import { PatientEncounterInputDirective } from '@directives/modal-handlers/patient-encounter-input/patient-encounter-input.directive';
import { PatientCarePlanInputDirective } from '@directives/modal-handlers/patient-care-plan-input/patient-care-plan-input.directive';
import { PatientGoalInputDirective } from '@directives/modal-handlers/patient-goal-input/patient-goal-input.directive';
import { PatientConditionInputDirective } from '@directives/modal-handlers/patient-condition-input/patient-condition-input.directive';
import { ScrollToTopComponent } from '@components/scroll-to-top/scroll-to-top.component';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { ChartMenuButtonComponent } from '@components/chart-menu-button/chart-menu-button.component';
import { PersonButtonComponent } from '@components/person-button/person-button.component';
import { ICarePlan } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/ICarePlan';
import { ICondition } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/ICondition';
import { IDocumentReference } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IDocumentReference';
import { IEncounter } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IEncounter';
import { IGoal } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IGoal';
import { IProcedure } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IProcedure';
import { PatientStateService } from '@core/state/patient-state.service';
import { NotificationsService } from '@core/notifications/notifications.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { deidentifyBundle } from '@core/utils/fhir/bundle-functions';
import { RoutingService } from '@core/routing/routing.service';
import { PersonStateService } from '@core/state/person-state.service';

@Component({
  selector: 'app-patient-id',
  templateUrl: './patient-id.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonicModule,
    PersonButtonComponent,
    ChartMenuButtonComponent,
    NgIf,
    ScrollToTopComponent,
    PatientConditionInputDirective,
    PatientGoalInputDirective,
    PatientCarePlanInputDirective,
    PatientEncounterInputDirective,
    PatientProcedureInputDirective,
    PatientDocumentReferenceInputDirective,
    PatientObservationListInputDirective,
    NgFor,
    ConditionItemComponent,
    RouterLink,
    GoalItemComponent,
    CarePlanItemComponent,
    EncounterItemComponent,
    ProcedureItemComponent,
    DocumentReferenceItemComponent,
    ObservationItemComponent,
    AsyncPipe,
  ],
})
export class PatientIdPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(IonRefresher) refresher?: IonRefresher;

  public trackById = trackByIdGeneric;
  public rows = 4;

  // Conditions
  public conditionsRecent$: Observable<ICondition[]>;
  public conditionsWithCurrentGoals$: Observable<ICondition[]>;
  public conditionsWithoutCurrentGoals$: Observable<ICondition[]>;
  public conditionsLoading$: Observable<boolean>;
  public conditionsTotal$: Observable<number>;

  // Goals
  public goalsRecent$: Observable<IGoal[]>;
  public goalsLoading$: Observable<boolean>;
  public goalsTotal$: Observable<number>;

  // CarePlans
  public carePlansRecent$: Observable<ICarePlan[]>;
  public carePlansLoading$: Observable<boolean>;
  public carePlansTotal$: Observable<number>;

  // Encounters
  public encountersRecent$: Observable<IEncounter[]>;
  public encountersLoading$: Observable<boolean>;
  public encountersTotal$: Observable<number>;

  // Procedures
  public encounterProcedures$: Observable<IProcedure[]>;
  public historicalProcedures$: Observable<IProcedure[]>;
  public proceduresLoading$: Observable<boolean>;
  public proceduresTotal$: Observable<number>;

  // Documents
  public documentsRecent$: Observable<IDocumentReference[]>;
  public documentsLoading$: Observable<boolean>;
  public documentsTotal$: Observable<number>;

  // Observations
  public observationsRecent$: Observable<ObservationBundle[]>;
  public observationsLoading$: Observable<boolean>;
  public observationsTotal$: Observable<number>;

  public noChartEntries$: Observable<boolean>;

  public readonly loading$: Observable<boolean>;

  protected readonly destroy$ = new Subject<null>();

  constructor(
    private patientEncounterState: PatientEncounterStateService,
    private patientCarePlanState: PatientCarePlanStateService,
    private patientGoalState: PatientGoalStateService,
    private patientConditionState: PatientConditionStateService,
    private patientProcedureState: PatientProcedureStateService,
    private patientDocumentReferenceState: PatientDocumentReferenceStateService,
    private patientObservationState: PatientObservationStateService,
    private patientState: PatientStateService,
    private personState: PersonStateService,
    private notifications: NotificationsService,
    private alertController: AlertController,
    private clipboard: Clipboard,
    private routing: RoutingService,
  ) {
    // Go back if patient is deleted
    this.routing
      .goBack({
        resource: this.personState.patient$,
        loading: this.personState.loading$,
        route: ['app', 'main', 'person', 'directory', 'patient'],
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe();

    // Conditions
    this.conditionsRecent$ = this.patientConditionState.conditionList$.pipe(
      map((conditions) => conditions?.slice(0, this.rows)),
    );
    this.conditionsWithCurrentGoals$ = combineLatest([
      this.patientConditionState.conditionList$,
      this.patientGoalState.goalList$,
    ]).pipe(
      map(
        ([conditions, goals]) =>
          conditions?.filter((condition) => hasCurrentGoals(condition, goals)),
      ),
    );
    this.conditionsWithoutCurrentGoals$ = combineLatest([
      this.patientConditionState.conditionList$,
      this.patientGoalState.goalList$,
    ]).pipe(
      map(
        ([conditions, goals]) =>
          conditions?.filter((condition) => !hasCurrentGoals(condition, goals)),
      ),
    );
    this.conditionsLoading$ = this.patientConditionState.loading$;
    this.conditionsTotal$ = this.patientConditionState.conditionList$.pipe(
      map((list) => list?.length),
    );

    // Goals
    this.goalsRecent$ = this.patientGoalState.goalList$.pipe(
      map((goal) => goal?.slice(0, this.rows)),
    );
    this.goalsLoading$ = this.patientGoalState.loading$;
    this.goalsTotal$ = this.patientGoalState.goalList$.pipe(
      map((list) => list?.length),
    );

    // CarePlans
    this.carePlansRecent$ = this.patientCarePlanState.carePlanList$.pipe(
      map((carePlan) => carePlan?.slice(0, this.rows)),
    );
    this.carePlansLoading$ = this.patientCarePlanState.loading$;
    this.carePlansTotal$ = this.patientCarePlanState.carePlanList$.pipe(
      map((list) => list?.length),
    );

    // Encounters
    this.encountersRecent$ = this.patientEncounterState.encounterList$.pipe(
      map((encounters) => encounters?.slice(0, this.rows)),
    );
    this.encountersLoading$ = this.patientEncounterState.loading$;
    this.encountersTotal$ = this.patientEncounterState.encounterList$.pipe(
      map((list) => list?.length),
    );

    // Procedures
    this.encounterProcedures$ =
      this.patientProcedureState.encounterProcedures.pipe(
        map((procedures) => procedures?.slice(0, this.rows)),
      );
    this.historicalProcedures$ =
      this.patientProcedureState.historicalProcedures$;
    this.proceduresLoading$ = this.patientProcedureState.loading$;
    this.proceduresTotal$ = this.patientProcedureState.procedureList$.pipe(
      map((list) => list?.length),
    );

    // Documents
    this.documentsRecent$ =
      this.patientDocumentReferenceState.documentReferenceList$.pipe(
        map((documentRefefences) => documentRefefences?.slice(0, this.rows)),
      );
    this.documentsLoading$ = this.patientDocumentReferenceState.loading$;
    this.documentsTotal$ =
      this.patientDocumentReferenceState.documentReferenceList$.pipe(
        map((list) => list?.length),
      );

    // Observations
    this.observationsRecent$ =
      this.patientObservationState.observationBundleList$.pipe(
        map((observations) => observations?.slice(0, this.rows)),
      );
    this.observationsLoading$ = this.patientObservationState.loading$;
    this.observationsTotal$ =
      this.patientObservationState.observationBundleList$.pipe(
        map((list) => list?.length),
      );

    this.noChartEntries$ = combineLatest([
      this.encountersRecent$,
      this.goalsRecent$,
      this.conditionsRecent$,
      this.carePlansRecent$,
      this.encounterProcedures$,
      this.documentsRecent$,
      this.observationsRecent$,
    ]).pipe(map((l) => !l.some((x) => x?.length > 0)));

    this.loading$ = combineLatest([
      this.encountersLoading$,
      this.goalsLoading$,
      this.conditionsLoading$,
      this.carePlansLoading$,
      this.proceduresLoading$,
      this.documentsLoading$,
      this.observationsLoading$,
    ]).pipe(map((l) => l.some((x) => x)));
  }

  ngOnInit(): void {
    // Reset infiniteScroll and refresher when state loading completed
    combineLatest([
      this.encountersLoading$,
      this.goalsLoading$,
      this.conditionsLoading$,
      this.carePlansLoading$,
      this.proceduresLoading$,
      this.documentsLoading$,
      this.observationsLoading$,
    ])
      .pipe(
        takeUntil(this.destroy$),
        tap((loadingArray) => {
          if (!loadingArray.every(Boolean) && this.refresher) {
            this.refresher.complete();
          }
        }),
      )
      .subscribe();
  }

  ngAfterViewInit(): void {
    if (this.refresher) {
      this.refresher.pullMin = 100;
      this.refresher.ionRefresh
        .pipe(
          takeUntil(this.destroy$),
          switchMap(() => this.refresh()),
        )
        .subscribe();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  public trackByCode(index: number, entry: ObservationBundle): unknown {
    return entry.code?.coding && entry.code?.coding[0].code
      ? entry.code?.coding[0].code
      : undefined;
  }

  public async onPatientEverythingCopy(): Promise<void> {
    // set loading status
    this.notifications.presentLoader();
    try {
      // call API
      // FIXME: The API call currently fetches individual resources via _revinclude; This should be updated to a propper Patient/$everything call
      const bundle = await this.patientState.getPatientEverything([
        'CarePlan:patient',
        'Condition:patient',
        'DocumentReference:patient',
        'Encounter:patient',
        'Goal:patient',
        'Observation:patient',
        'Procedure:patient',
      ]);
      // set loading status
      this.notifications.dismissLoader();
      // de-identify bundle
      const deidentifiedBundle = deidentifyBundle(bundle);
      // copy bundle to clipboard
      const jsonStringDeIdentified = JSON.stringify(
        deidentifiedBundle,
        null,
        2,
      );
      const jsonStringOriginal = JSON.stringify(bundle, null, 2);

      // open alert
      const alert = await this.alertController.create({
        header: 'Chart export',
        message: 'Choose which chart version to copy to the clipboard.',
        buttons: [
          {
            text: 'Original',
            role: 'confirm',
            handler: () => {
              const successful = this.clipboard.copy(jsonStringOriginal);

              if (successful) {
                this.notifications.showSuccess(
                  'Original chart copied to clipboard!',
                );
              } else {
                this.notifications.showError('Failed to copy to clipboard!');
              }
            },
          },
          {
            text: 'De-identified',
            role: 'confirm',
            handler: () => {
              const successful = this.clipboard.copy(jsonStringDeIdentified);

              if (successful) {
                this.notifications.showSuccess(
                  'De-identified chart copied to clipboard!',
                );
              } else {
                this.notifications.showError('Failed to copy to clipboard!');
              }
            },
          },
        ],
      });

      await alert.present();
    } catch (err) {
      this.notifications.showError('Failed to load chart bundle!');
    }
  }

  // Private methods
  private refresh(): Observable<boolean> {
    return combineLatest([
      this.patientConditionState.getList(),
      this.patientGoalState.getList(),
      this.patientCarePlanState.getList(),
      this.patientEncounterState.getList(),
      this.patientProcedureState.getList(),
      this.patientDocumentReferenceState.getList(),
      this.patientObservationState.getList(),
    ]).pipe(
      map((loadingArray) => (loadingArray.every(Boolean) ? true : false)),
    );
  }
}
