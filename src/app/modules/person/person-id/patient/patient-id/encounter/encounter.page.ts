import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
} from '@angular/core';
import { PatientEncounterStateService } from '@core/state/patient-encounter-state.service';
import { PatientStateService } from '@core/state/patient-state.service';
import { trackByIdGeneric } from '@core/utils/angular-functions';
import { AbstractResourceListDirective } from 'src/app/shared/directives/pages/resource-list/abstract-resource-list.directive';
import { EncounterItemComponent } from '@components/resource-list-items/encounter-item/encounter-item.component';
import { ScrollToTopComponent } from '@components/scroll-to-top/scroll-to-top.component';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { PatientEncounterInputDirective } from '@directives/modal-handlers/patient-encounter-input/patient-encounter-input.directive';
import { ChartMenuButtonComponent } from '@components/chart-menu-button/chart-menu-button.component';
import { PersonButtonComponent } from '@components/person-button/person-button.component';
import { IonicModule } from '@ionic/angular';
import { IEncounter } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IEncounter';
import { IPatient } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPatient';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-encounter',
  templateUrl: './encounter.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonicModule,
    PersonButtonComponent,
    ChartMenuButtonComponent,
    PatientEncounterInputDirective,
    NgIf,
    ScrollToTopComponent,
    NgFor,
    EncounterItemComponent,
    AsyncPipe,
  ],
})
export class EncounterPage
  extends AbstractResourceListDirective<PatientEncounterStateService>
  implements OnInit
{
  public trackById = trackByIdGeneric;

  // UI output streams
  public patient$: Observable<IPatient>;
  public encounterList$: Observable<IEncounter[]>;

  constructor(
    private patientState: PatientStateService,
    private patientEncounterState: PatientEncounterStateService,
    protected override injector: Injector,
  ) {
    super(patientEncounterState, injector);

    this.patient$ = this.patientState.patient$;
    this.encounterList$ = this.patientEncounterState.encounterList$;
  }

  override ngOnInit(): void {
    this.searchInput.setValue(this.patientEncounterState.searchInput);
    this.initTemplate();
  }
}
