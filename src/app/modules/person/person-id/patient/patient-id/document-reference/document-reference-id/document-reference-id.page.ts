import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { Observable, map, takeUntil } from 'rxjs';
import { PatientDocumentReferenceStateService } from '@core/state/patient-document-reference-state.service';
import { PatientStateService } from '@core/state/patient-state.service';
import { trackByIdGeneric } from '@core/utils/angular-functions';
import { getFileTypeIcon } from '@core/utils/fhir/resource-functions';
import { AbstractResourcePageDirective } from 'src/app/shared/directives/pages/resource-page/abstract-resource-page.directive';
import { ReferencedResourcePipe } from '@pipes/referenced-resource/referenced-resource.pipe';
import { FileUrlPipe } from '@pipes/file-url/file-url.pipe';
import { DistanceToNowPipe } from '@pipes/distance-to-now/distance-to-now.pipe';
import { ObservationItemComponent } from '@components/resource-list-items/observation-item/observation-item.component';
import { EncounterItemComponent } from '@components/resource-list-items/encounter-item/encounter-item.component';
import { ExpandableDirective } from '@directives/expandable/expandable.directive';
import { ScrollToTopComponent } from '@components/scroll-to-top/scroll-to-top.component';
import { PatientDocumentReferenceInputDirective } from '@directives/modal-handlers/patient-document-reference-input/patient-document-reference-input.directive';
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
import { IPatient } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPatient';
import { IDocumentReference } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IDocumentReference';

@Component({
  selector: 'app-document-reference-id',
  templateUrl: './document-reference-id.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    IonicModule,
    PersonButtonComponent,
    ChartMenuButtonComponent,
    PatientDocumentReferenceInputDirective,
    ScrollToTopComponent,
    ExpandableDirective,
    NgFor,
    EncounterItemComponent,
    ObservationItemComponent,
    AsyncPipe,
    TitleCasePipe,
    DatePipe,
    DistanceToNowPipe,
    FileUrlPipe,
    ReferencedResourcePipe,
  ],
})
export class DocumentReferenceIdPage extends AbstractResourcePageDirective<PatientDocumentReferenceStateService> {
  public trackById = trackByIdGeneric;

  public patient$: Observable<IPatient>;
  public documentReference$: Observable<IDocumentReference>;

  public fileTypeIcon$: Observable<string>;

  constructor(
    private patientState: PatientStateService,
    private patientDocumentReferenceState: PatientDocumentReferenceStateService,
    protected override injector: Injector,
  ) {
    super(patientDocumentReferenceState, injector);

    this.patient$ = this.patientState.patient$;
    this.documentReference$ =
      this.patientDocumentReferenceState.documentReference$;

    this.fileTypeIcon$ = this.documentReference$.pipe(
      map((dr) =>
        getFileTypeIcon(dr?.content[0]?.attachment?.contentType || ''),
      ),
    );

    this.routing
      .goBack({
        resource: this.documentReference$,
        loading: this.loading$,
        route: ['../../'],
        relativeTo: this.route,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }
}
