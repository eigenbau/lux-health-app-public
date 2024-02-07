import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { PatientProcedureStateService } from '@core/state/patient-procedure-state.service';
import { PatientStateService } from '@core/state/patient-state.service';
import { AbstractResourcePageDirective } from 'src/app/shared/directives/pages/resource-page/abstract-resource-page.directive';
import { ReferencedResourcePipe } from '@pipes/referenced-resource/referenced-resource.pipe';
import { PeriodPipe } from '@pipes/period/period.pipe';
import { EncounterItemComponent } from '@components/resource-list-items/encounter-item/encounter-item.component';
import { ExpandableDirective } from '@directives/expandable/expandable.directive';
import { ScrollToTopComponent } from '@components/scroll-to-top/scroll-to-top.component';
import { PatientProcedureInputDirective } from '@directives/modal-handlers/patient-procedure-input/patient-procedure-input.directive';
import { ChartMenuButtonComponent } from '@components/chart-menu-button/chart-menu-button.component';
import { PersonButtonComponent } from '@components/person-button/person-button.component';
import { IonicModule } from '@ionic/angular';
import { NgIf, NgFor, AsyncPipe, TitleCasePipe } from '@angular/common';
import { IPatient } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPatient';
import { IProcedure } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IProcedure';
import { Observable, takeUntil } from 'rxjs';

@Component({
  selector: 'app-procedure-id',
  templateUrl: './procedure-id.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    IonicModule,
    PersonButtonComponent,
    ChartMenuButtonComponent,
    PatientProcedureInputDirective,
    ScrollToTopComponent,
    NgFor,
    ExpandableDirective,
    EncounterItemComponent,
    AsyncPipe,
    TitleCasePipe,
    PeriodPipe,
    ReferencedResourcePipe,
  ],
})
export class ProcedureIdPage extends AbstractResourcePageDirective<PatientProcedureStateService> {
  public patient$: Observable<IPatient>;
  public procedure$: Observable<IProcedure>;

  constructor(
    private patientState: PatientStateService,
    private patientProcedureState: PatientProcedureStateService,
    protected override injector: Injector,
  ) {
    super(patientProcedureState, injector);

    this.patient$ = this.patientState.patient$;
    this.procedure$ = this.patientProcedureState.procedure$;

    this.routing
      .goBack({
        resource: this.procedure$,
        loading: this.loading$,
        route: ['../../'],
        relativeTo: this.route,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }
}
