import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { PatientObservationStateService } from '@core/state/patient-observation-state.service';
import { PatientStateService } from '@core/state/patient-state.service';
import { trackByIdGeneric } from '@core/utils/angular-functions';
import { AbstractResourcePageDirective } from 'src/app/shared/directives/pages/resource-page/abstract-resource-page.directive';
import { ReferencingResourcesPipe } from '@pipes/referencing-resources/referencing-resources.pipe';
import { ReferencedResourcePipe } from '@pipes/referenced-resource/referenced-resource.pipe';
import { ValueCodeFormatPipe } from '@pipes/value-code-format/value-code-format.pipe';
import { ValueXArrayPipe } from '@pipes/value-x-array/value-x-array.pipe';
import { DistanceToNowPipe } from '@pipes/distance-to-now/distance-to-now.pipe';
import { BodySitePipe } from '@pipes/body-site/body-site.pipe';
import { EffectiveXToDatePipe } from '@pipes/effective-x-to-date/effective-x-to-date.pipe';
import { DocumentReferenceItemComponent } from '@components/resource-list-items/document-reference-item/document-reference-item.component';
import { EncounterItemComponent } from '@components/resource-list-items/encounter-item/encounter-item.component';
import { ExpandableDirective } from '@directives/expandable/expandable.directive';
import { PatientDocumentReferenceInputDirective } from '@directives/modal-handlers/patient-document-reference-input/patient-document-reference-input.directive';
import { ScrollToTopComponent } from '@components/scroll-to-top/scroll-to-top.component';
import { PatientObservationInputDirective } from '@directives/modal-handlers/patient-observation-input/patient-observation-input.directive';
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
import { IObservation } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IObservation';
import { IPatient } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPatient';
import { Observable, takeUntil } from 'rxjs';

@Component({
  selector: 'app-observation-id',
  templateUrl: './observation-id.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    IonicModule,
    PersonButtonComponent,
    ChartMenuButtonComponent,
    PatientObservationInputDirective,
    ScrollToTopComponent,
    PatientDocumentReferenceInputDirective,
    ExpandableDirective,
    NgFor,
    EncounterItemComponent,
    DocumentReferenceItemComponent,
    AsyncPipe,
    TitleCasePipe,
    DatePipe,
    EffectiveXToDatePipe,
    BodySitePipe,
    DistanceToNowPipe,
    ValueXArrayPipe,
    ValueCodeFormatPipe,
    ReferencedResourcePipe,
    ReferencingResourcesPipe,
  ],
})
export class ObservationIdPage extends AbstractResourcePageDirective<PatientObservationStateService> {
  public trackById = trackByIdGeneric;

  public patient$: Observable<IPatient>;
  public observation$: Observable<IObservation>;

  constructor(
    private patientState: PatientStateService,
    private patientObservationState: PatientObservationStateService,
    protected override injector: Injector,
  ) {
    super(patientObservationState, injector);

    this.patient$ = this.patientState.patient$;
    this.observation$ = this.patientObservationState.observation$;

    this.routing
      .goBack({
        resource: this.observation$,
        loading: this.loading$,
        route: ['../../'],
        relativeTo: this.route,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }
}
