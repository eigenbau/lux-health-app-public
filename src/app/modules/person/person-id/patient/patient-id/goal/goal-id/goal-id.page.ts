import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { PatientGoalStateService } from '@core/state/patient-goal-state.service';
import { PatientStateService } from '@core/state/patient-state.service';
import { trackByIdGeneric } from '@core/utils/angular-functions';
import { AbstractResourcePageDirective } from 'src/app/shared/directives/pages/resource-page/abstract-resource-page.directive';
import { ReferencingResourcesPipe } from '@pipes/referencing-resources/referencing-resources.pipe';
import { IdPipe } from '@pipes/id/id.pipe';
import { DistanceToNowPipe } from '@pipes/distance-to-now/distance-to-now.pipe';
import { CarePlanItemComponent } from '@components/resource-list-items/care-plan-item/care-plan-item.component';
import { RouterLink } from '@angular/router';
import { ExpandableDirective } from '@directives/expandable/expandable.directive';
import { ScrollToTopComponent } from '@components/scroll-to-top/scroll-to-top.component';
import { PatientGoalInputDirective } from '@directives/modal-handlers/patient-goal-input/patient-goal-input.directive';
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
import { IGoal } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IGoal';
import { IPatient } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPatient';
import { Observable, takeUntil } from 'rxjs';

@Component({
  selector: 'app-goal-id',
  templateUrl: './goal-id.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    IonicModule,
    PersonButtonComponent,
    ChartMenuButtonComponent,
    PatientGoalInputDirective,
    ScrollToTopComponent,
    ExpandableDirective,
    NgFor,
    RouterLink,
    CarePlanItemComponent,
    AsyncPipe,
    TitleCasePipe,
    DatePipe,
    DistanceToNowPipe,
    IdPipe,
    ReferencingResourcesPipe,
  ],
})
export class GoalIdPage extends AbstractResourcePageDirective<PatientGoalStateService> {
  public trackById = trackByIdGeneric;

  public patient$: Observable<IPatient>;
  public goal$: Observable<IGoal>;
  public history$: Observable<IGoal[]>;

  constructor(
    private patientState: PatientStateService,
    private patientGoalState: PatientGoalStateService,
    protected override injector: Injector,
  ) {
    super(patientGoalState, injector);

    this.patient$ = this.patientState.patient$;
    this.goal$ = this.patientGoalState.goal$;
    this.history$ = this.patientGoalState.history$;

    this.routing
      .goBack({
        resource: this.goal$,
        loading: this.loading$,
        route: ['../../'],
        relativeTo: this.route,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }
}
