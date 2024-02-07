import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { Observable, map, takeUntil } from 'rxjs';
import { PatientCarePlanStateService } from '@core/state/patient-care-plan-state.service';
import { PatientStateService } from '@core/state/patient-state.service';
import { trackByIdGeneric } from '@core/utils/angular-functions';
import { AbstractResourcePageDirective } from 'src/app/shared/directives/pages/resource-page/abstract-resource-page.directive';
import { ReferencedResourcePipe } from '@pipes/referenced-resource/referenced-resource.pipe';
import { DistanceToNowPipe } from '@pipes/distance-to-now/distance-to-now.pipe';
import { GoalItemComponent } from '@components/resource-list-items/goal-item/goal-item.component';
import { ExpandableDirective } from '@directives/expandable/expandable.directive';
import { ScrollToTopComponent } from '@components/scroll-to-top/scroll-to-top.component';
import { ShowOnScrollDirective } from '@directives/show-on-scroll/show-on-scroll.directive';
import { PatientCarePlanInputDirective } from '@directives/modal-handlers/patient-care-plan-input/patient-care-plan-input.directive';
import { PatientCarePlanReportDirective } from '@directives/modal-handlers/patient-care-plan-report/patient-care-plan-report.directive';
import { ChartMenuButtonComponent } from '@components/chart-menu-button/chart-menu-button.component';
import { PersonButtonComponent } from '@components/person-button/person-button.component';
import { IonicModule } from '@ionic/angular';
import {
  NgIf,
  NgFor,
  NgStyle,
  AsyncPipe,
  TitleCasePipe,
  DatePipe,
} from '@angular/common';
import { ICarePlan } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/ICarePlan';
import { IPatient } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPatient';
import { Reference } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/reference';

@Component({
  selector: 'app-care-plan-id',
  templateUrl: './care-plan-id.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    IonicModule,
    PersonButtonComponent,
    ChartMenuButtonComponent,
    PatientCarePlanReportDirective,
    PatientCarePlanInputDirective,
    ShowOnScrollDirective,
    ScrollToTopComponent,
    NgFor,
    ExpandableDirective,
    NgStyle,
    GoalItemComponent,
    AsyncPipe,
    TitleCasePipe,
    DatePipe,
    DistanceToNowPipe,
    ReferencedResourcePipe,
  ],
})
export class CarePlanIdPage extends AbstractResourcePageDirective<PatientCarePlanStateService> {
  public trackById = trackByIdGeneric;

  public patient$: Observable<IPatient | undefined>;
  public carePlan$: Observable<ICarePlan>;
  public history$: Observable<ICarePlan[]>;
  public goalReferencesFromAllActivities$: Observable<Reference[]>;

  constructor(
    private patientState: PatientStateService,
    private patientCarePlanState: PatientCarePlanStateService,
    protected override injector: Injector,
  ) {
    super(patientCarePlanState, injector);
    this.patient$ = this.patientState.patient$;
    this.carePlan$ = this.patientCarePlanState.carePlan$;
    this.history$ = this.patientCarePlanState.history$;
    this.goalReferencesFromAllActivities$ =
      this.patientCarePlanState.goalReferencesFromAllActivities$;

    this.routing
      .goBack({
        resource: this.carePlan$,
        loading: this.loading$,
        route: ['../../'],
        relativeTo: this.route,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }
}
