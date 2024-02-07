import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { PatientConditionStateService } from '@core/state/patient-condition-state.service';
import { PatientStateService } from '@core/state/patient-state.service';
import { trackByIdGeneric } from '@core/utils/angular-functions';
import { AbstractResourcePageDirective } from 'src/app/shared/directives/pages/resource-page/abstract-resource-page.directive';
import { ReferencingResourcesPipe } from '@pipes/referencing-resources/referencing-resources.pipe';
import { ReferencedResourcePipe } from '@pipes/referenced-resource/referenced-resource.pipe';
import { DistanceToNowPipe } from '@pipes/distance-to-now/distance-to-now.pipe';
import { EncounterItemComponent } from '@components/resource-list-items/encounter-item/encounter-item.component';
import { CarePlanItemComponent } from '@components/resource-list-items/care-plan-item/care-plan-item.component';
import { GoalItemComponent } from '@components/resource-list-items/goal-item/goal-item.component';
import { ExpandableDirective } from '@directives/expandable/expandable.directive';
import { PatientGoalInputDirective } from '@directives/modal-handlers/patient-goal-input/patient-goal-input.directive';
import { ScrollToTopComponent } from '@components/scroll-to-top/scroll-to-top.component';
import { PatientConditionInputDirective } from '@directives/modal-handlers/patient-condition-input/patient-condition-input.directive';
import { ChartMenuButtonComponent } from '@components/chart-menu-button/chart-menu-button.component';
import { PersonButtonComponent } from '@components/person-button/person-button.component';
import { IonicModule } from '@ionic/angular';
import {
  NgIf,
  NgFor,
  AsyncPipe,
  TitleCasePipe,
  DatePipe,
} from '@angular/common';
import { Observable, pipe, skip, takeUntil, tap } from 'rxjs';
import { ICondition } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/ICondition';
import { IPatient } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPatient';

@Component({
  selector: 'app-condition-id',
  templateUrl: './condition-id.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    IonicModule,
    PersonButtonComponent,
    ChartMenuButtonComponent,
    PatientConditionInputDirective,
    ScrollToTopComponent,
    PatientGoalInputDirective,
    ExpandableDirective,
    NgFor,
    GoalItemComponent,
    CarePlanItemComponent,
    EncounterItemComponent,
    AsyncPipe,
    TitleCasePipe,
    DatePipe,
    DistanceToNowPipe,
    ReferencedResourcePipe,
    ReferencingResourcesPipe,
  ],
})
export class ConditionIdPage extends AbstractResourcePageDirective<PatientConditionStateService> {
  public trackById = trackByIdGeneric;

  public patient$: Observable<IPatient | undefined>;
  public condition$: Observable<ICondition | undefined>;
  public history$: Observable<ICondition[]>;

  constructor(
    private patientState: PatientStateService,
    private patientConditionState: PatientConditionStateService,
    protected override injector: Injector,
  ) {
    super(patientConditionState, injector);

    this.patient$ = this.patientState.patient$;
    this.condition$ = this.patientConditionState.condition$;
    this.history$ = this.patientConditionState.history$;

    this.routing
      .goBack({
        resource: this.condition$,
        loading: this.loading$,
        route: ['../../'],
        relativeTo: this.route,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }
}
