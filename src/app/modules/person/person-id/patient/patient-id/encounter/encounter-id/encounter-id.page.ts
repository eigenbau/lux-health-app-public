import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { Observable, filter, map, skip, takeUntil } from 'rxjs';
import { PatientEncounterStateService } from '@core/state/patient-encounter-state.service';
import { PatientStateService } from '@core/state/patient-state.service';
import { trackByIdGeneric } from '@core/utils/angular-functions';
import { periodDurationInMinutes } from '@core/utils/fhir/resource-functions';
import { AbstractResourcePageDirective } from 'src/app/shared/directives/pages/resource-page/abstract-resource-page.directive';
import { ReferencingResourcesPipe } from '@pipes/referencing-resources/referencing-resources.pipe';
import { PeriodPipe } from '@pipes/period/period.pipe';
import { DocumentReferenceItemComponent } from '@components/resource-list-items/document-reference-item/document-reference-item.component';
import { ProcedureItemComponent } from '@components/resource-list-items/procedure-item/procedure-item.component';
import { ObservationItemComponent } from '@components/resource-list-items/observation-item/observation-item.component';
import { PatientObservationInputDirective } from '@directives/modal-handlers/patient-observation-input/patient-observation-input.directive';
import { ObservationListComponent } from '@components/observation-list/observation-list.component';
import { ConditionItemComponent } from '@components/resource-list-items/condition-item/condition-item.component';
import { PatientObservationListInputDirective } from '@directives/modal-handlers/patient-observation-list-input/patient-observation-list-input.directive';
import { PatientDocumentReferenceInputDirective } from '@directives/modal-handlers/patient-document-reference-input/patient-document-reference-input.directive';
import { PatientProcedureInputDirective } from '@directives/modal-handlers/patient-procedure-input/patient-procedure-input.directive';
import { PatientCarePlanInputDirective } from '@directives/modal-handlers/patient-care-plan-input/patient-care-plan-input.directive';
import { PatientGoalInputDirective } from '@directives/modal-handlers/patient-goal-input/patient-goal-input.directive';
import { PatientConditionInputDirective } from '@directives/modal-handlers/patient-condition-input/patient-condition-input.directive';
import { ScrollToTopComponent } from '@components/scroll-to-top/scroll-to-top.component';
import { ShowOnScrollDirective } from '@directives/show-on-scroll/show-on-scroll.directive';
import { PatientEncounterInputDirective } from '@directives/modal-handlers/patient-encounter-input/patient-encounter-input.directive';
import { ChartMenuButtonComponent } from '@components/chart-menu-button/chart-menu-button.component';
import { PersonButtonComponent } from '@components/person-button/person-button.component';
import { IonicModule } from '@ionic/angular';
import { NgIf, NgFor, AsyncPipe, TitleCasePipe } from '@angular/common';
import { IPatient } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPatient';
import { IEncounter } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IEncounter';

@Component({
  selector: 'app-encounter-id',
  templateUrl: './encounter-id.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    IonicModule,
    PersonButtonComponent,
    ChartMenuButtonComponent,
    PatientEncounterInputDirective,
    ShowOnScrollDirective,
    ScrollToTopComponent,
    PatientConditionInputDirective,
    PatientGoalInputDirective,
    PatientCarePlanInputDirective,
    PatientProcedureInputDirective,
    PatientDocumentReferenceInputDirective,
    PatientObservationListInputDirective,
    NgFor,
    ConditionItemComponent,
    ObservationListComponent,
    PatientObservationInputDirective,
    ObservationItemComponent,
    ProcedureItemComponent,
    DocumentReferenceItemComponent,
    AsyncPipe,
    TitleCasePipe,
    PeriodPipe,
    ReferencingResourcesPipe,
  ],
})
export class EncounterIdPage extends AbstractResourcePageDirective<PatientEncounterStateService> {
  public trackById = trackByIdGeneric;

  public encounter$: Observable<IEncounter>;

  public periodDuration$: Observable<number>;

  constructor(
    private patientEncounterState: PatientEncounterStateService,
    protected override injector: Injector,
  ) {
    super(patientEncounterState, injector);

    this.encounter$ = this.patientEncounterState.encounter$;
    this.periodDuration$ = this.encounter$.pipe(
      map((encounter) => periodDurationInMinutes(encounter?.period)),
    );

    this.routing
      .goBack({
        resource: this.encounter$,
        loading: this.loading$,
        route: ['../../'],
        relativeTo: this.route,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }
}
