import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
} from '@angular/core';
import { PatientCarePlanStateService } from '@core/state/patient-care-plan-state.service';
import { PatientStateService } from '@core/state/patient-state.service';
import { trackByIdGeneric } from '@core/utils/angular-functions';
import { AbstractResourceListDirective } from 'src/app/shared/directives/pages/resource-list/abstract-resource-list.directive';
import { CarePlanItemComponent } from '@components/resource-list-items/care-plan-item/care-plan-item.component';
import { ScrollToTopComponent } from '@components/scroll-to-top/scroll-to-top.component';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { PatientCarePlanInputDirective } from '@directives/modal-handlers/patient-care-plan-input/patient-care-plan-input.directive';
import { ChartMenuButtonComponent } from '@components/chart-menu-button/chart-menu-button.component';
import { PersonButtonComponent } from '@components/person-button/person-button.component';
import { IonicModule } from '@ionic/angular';
import { Observable } from 'rxjs';
import { IPatient } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPatient';
import { ICarePlan } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/ICarePlan';

@Component({
  selector: 'app-care-plan',
  templateUrl: './care-plan.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonicModule,
    PersonButtonComponent,
    ChartMenuButtonComponent,
    PatientCarePlanInputDirective,
    NgIf,
    ScrollToTopComponent,
    NgFor,
    CarePlanItemComponent,
    AsyncPipe,
  ],
})
export class CarePlanPage
  extends AbstractResourceListDirective<PatientCarePlanStateService>
  implements OnInit
{
  public trackById = trackByIdGeneric;

  // UI output streams
  public patient$: Observable<IPatient | undefined>;
  public carePlanList$: Observable<ICarePlan[]>;

  constructor(
    private patientState: PatientStateService,
    private patientCarePlanState: PatientCarePlanStateService,
    protected override injector: Injector,
  ) {
    super(patientCarePlanState, injector);
    this.patient$ = this.patientState.patient$;
    this.carePlanList$ = this.patientCarePlanState.carePlanList$;
  }
  override ngOnInit(): void {
    this.searchInput.setValue(this.patientCarePlanState.searchInput);
    this.initTemplate();
  }
}
