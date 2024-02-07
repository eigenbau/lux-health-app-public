import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
} from '@angular/core';
import { PatientGoalStateService } from '@core/state/patient-goal-state.service';
import { PatientStateService } from '@core/state/patient-state.service';
import { trackByIdGeneric } from '@core/utils/angular-functions';
import { AbstractResourceListDirective } from 'src/app/shared/directives/pages/resource-list/abstract-resource-list.directive';
import { GoalItemComponent } from '@components/resource-list-items/goal-item/goal-item.component';
import { ScrollToTopComponent } from '@components/scroll-to-top/scroll-to-top.component';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { PatientGoalInputDirective } from '@directives/modal-handlers/patient-goal-input/patient-goal-input.directive';
import { ChartMenuButtonComponent } from '@components/chart-menu-button/chart-menu-button.component';
import { PersonButtonComponent } from '@components/person-button/person-button.component';
import { IonicModule } from '@ionic/angular';
import { IGoal } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IGoal';
import { IPatient } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPatient';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-goal',
  templateUrl: './goal.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonicModule,
    PersonButtonComponent,
    ChartMenuButtonComponent,
    PatientGoalInputDirective,
    NgIf,
    ScrollToTopComponent,
    NgFor,
    GoalItemComponent,
    AsyncPipe,
  ],
})
export class GoalPage
  extends AbstractResourceListDirective<PatientGoalStateService>
  implements OnInit
{
  public trackById = trackByIdGeneric;

  // UI output streams
  public patient$: Observable<IPatient>;
  public goalList$: Observable<IGoal[]>;

  constructor(
    private patientState: PatientStateService,
    private patientGoalState: PatientGoalStateService,
    protected override injector: Injector,
  ) {
    super(patientGoalState, injector);

    this.patient$ = this.patientState.patient$;
    this.goalList$ = this.patientGoalState.goalList$;
  }

  override ngOnInit(): void {
    this.searchInput.setValue(this.patientGoalState.searchInput);
    this.initTemplate();
  }
}
