import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
} from '@angular/core';
import { PatientConditionStateService } from '@core/state/patient-condition-state.service';
import { PatientStateService } from '@core/state/patient-state.service';
import { trackByIdGeneric } from '@core/utils/angular-functions';
import { AbstractResourceListDirective } from 'src/app/shared/directives/pages/resource-list/abstract-resource-list.directive';
import { ConditionItemComponent } from '@components/resource-list-items/condition-item/condition-item.component';
import { ScrollToTopComponent } from '@components/scroll-to-top/scroll-to-top.component';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { PatientConditionInputDirective } from '@directives/modal-handlers/patient-condition-input/patient-condition-input.directive';
import { ChartMenuButtonComponent } from '@components/chart-menu-button/chart-menu-button.component';
import { PersonButtonComponent } from '@components/person-button/person-button.component';
import { IonicModule } from '@ionic/angular';
import { Observable } from 'rxjs';
import { ICondition } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/ICondition';
import { IPatient } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPatient';

@Component({
  selector: 'app-condition',
  templateUrl: './condition.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonicModule,
    PersonButtonComponent,
    ChartMenuButtonComponent,
    PatientConditionInputDirective,
    NgIf,
    ScrollToTopComponent,
    NgFor,
    ConditionItemComponent,
    AsyncPipe,
  ],
})
export class ConditionPage
  extends AbstractResourceListDirective<PatientConditionStateService>
  implements OnInit
{
  public trackById = trackByIdGeneric;

  // UI output streams
  public patient$: Observable<IPatient>;
  public conditionList$: Observable<ICondition[]>;

  constructor(
    private patientState: PatientStateService,
    private patientConditionState: PatientConditionStateService,
    protected override injector: Injector,
  ) {
    super(patientConditionState, injector);

    this.patient$ = this.patientState.patient$;
    this.conditionList$ = this.patientConditionState.conditionList$;
  }

  override ngOnInit(): void {
    this.searchInput.setValue(this.patientConditionState.searchInput);
    this.initTemplate();
  }
}
