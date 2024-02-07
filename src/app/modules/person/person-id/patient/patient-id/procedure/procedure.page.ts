import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
} from '@angular/core';
import { IProcedure } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IProcedure';
import { PatientProcedureStateService } from '@core/state/patient-procedure-state.service';
import { PatientStateService } from '@core/state/patient-state.service';
import { trackByIdGeneric } from '@core/utils/angular-functions';
import { AbstractResourceListDirective } from 'src/app/shared/directives/pages/resource-list/abstract-resource-list.directive';
import { ProcedureItemComponent } from '@components/resource-list-items/procedure-item/procedure-item.component';
import { ScrollToTopComponent } from '@components/scroll-to-top/scroll-to-top.component';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { PatientProcedureInputDirective } from '@directives/modal-handlers/patient-procedure-input/patient-procedure-input.directive';
import { ChartMenuButtonComponent } from '@components/chart-menu-button/chart-menu-button.component';
import { PersonButtonComponent } from '@components/person-button/person-button.component';
import { IonicModule } from '@ionic/angular';
import { IPatient } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPatient';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-procedure',
  templateUrl: './procedure.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonicModule,
    PersonButtonComponent,
    ChartMenuButtonComponent,
    PatientProcedureInputDirective,
    NgIf,
    ScrollToTopComponent,
    NgFor,
    ProcedureItemComponent,
    AsyncPipe,
  ],
})
export class ProcedurePage
  extends AbstractResourceListDirective<PatientProcedureStateService>
  implements OnInit
{
  public trackById = trackByIdGeneric;

  // UI output streams
  public patient$: Observable<IPatient>;
  public procedureList$: Observable<IProcedure[]>;

  constructor(
    private patientState: PatientStateService,
    private patientProcedureState: PatientProcedureStateService,
    protected override injector: Injector,
  ) {
    super(patientProcedureState, injector);

    this.patient$ = this.patientState.patient$;
    this.procedureList$ = this.patientProcedureState.procedureList$;
  }

  override ngOnInit(): void {
    this.searchInput.setValue(this.patientProcedureState.searchInput);
    this.initTemplate();
  }
}
