import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
} from '@angular/core';
import { CodeableConcept } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/codeableConcept';
import { map, Observable } from 'rxjs';
import { FhirApiValueSetService } from '@core/fhir-api/fhir-api-value-set.service';
import { PatientObservationStateService } from '@core/state/patient-observation-state.service';
import { PatientStateService } from '@core/state/patient-state.service';
import { templateFromObservation } from '@core/utils/fhir/observation-functions';
import { sortByString } from '@core/utils/object-functions';
import { AbstractResourceListDirective } from 'src/app/shared/directives/pages/resource-list/abstract-resource-list.directive';
import { ObservationFilterPipe } from '@pipes/observation-filter/observation-filter.pipe';
import { ObservationItemComponent } from '@components/resource-list-items/observation-item/observation-item.component';
import { ObservationListComponent } from '@components/observation-list/observation-list.component';
import { HorizontalScrollSelectComponent } from '@components/horizontal-scroll-select/horizontal-scroll-select.component';
import { ScrollToTopComponent } from '@components/scroll-to-top/scroll-to-top.component';
import { PatientObservationListInputDirective } from '@directives/modal-handlers/patient-observation-list-input/patient-observation-list-input.directive';
import { ChartMenuButtonComponent } from '@components/chart-menu-button/chart-menu-button.component';
import { PersonButtonComponent } from '@components/person-button/person-button.component';
import { NgIf, AsyncPipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { IObservation } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IObservation';
import { IPatient } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPatient';

@Component({
  selector: 'app-observation',
  templateUrl: './observation.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonicModule,
    NgIf,
    PersonButtonComponent,
    ChartMenuButtonComponent,
    PatientObservationListInputDirective,
    ScrollToTopComponent,
    HorizontalScrollSelectComponent,
    ObservationListComponent,
    ObservationItemComponent,
    AsyncPipe,
    ObservationFilterPipe,
  ],
})
export class ObservationPage
  extends AbstractResourceListDirective<PatientObservationStateService>
  implements OnInit
{
  public getTemplate = templateFromObservation;

  public observationCategory$: Observable<CodeableConcept[]>;

  // UI output streams
  public patient$: Observable<IPatient>;
  public observationListOfLatestPerCode$: Observable<IObservation[]>;

  constructor(
    private patientState: PatientStateService,
    private patientObservationState: PatientObservationStateService,
    private valueSet: FhirApiValueSetService,
    protected override injector: Injector,
  ) {
    super(patientObservationState, injector);

    this.observationCategory$ = this.valueSet
      .getValueSetLocally('observation-category')
      .pipe(
        map((vs) => vs.expansion?.contains),
        map((valueSetContains) =>
          valueSetContains
            ? valueSetContains.map((code) => ({ coding: [code] }))
            : [],
        ),
        map((codeableConcept) =>
          sortByString(codeableConcept, ['coding', 0, 'display']),
        ),
      );

    // UI output streams
    this.patient$ = this.patientState.patient$;
    this.observationListOfLatestPerCode$ =
      this.patientObservationState.observationListOfLatestPerCode$;
  }

  override ngOnInit() {
    this.searchInput.setValue(this.patientObservationState.searchInput);
    this.initTemplate();
  }
}
