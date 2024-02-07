import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
} from '@angular/core';
import { PatientDocumentReferenceStateService } from '@core/state/patient-document-reference-state.service';
import { PatientStateService } from '@core/state/patient-state.service';
import { trackByIdGeneric } from '@core/utils/angular-functions';
import { AbstractResourceListDirective } from 'src/app/shared/directives/pages/resource-list/abstract-resource-list.directive';
import { DocumentReferenceItemComponent } from '@components/resource-list-items/document-reference-item/document-reference-item.component';
import { ScrollToTopComponent } from '@components/scroll-to-top/scroll-to-top.component';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { PatientDocumentReferenceInputDirective } from '@directives/modal-handlers/patient-document-reference-input/patient-document-reference-input.directive';
import { ChartMenuButtonComponent } from '@components/chart-menu-button/chart-menu-button.component';
import { PersonButtonComponent } from '@components/person-button/person-button.component';
import { IonicModule } from '@ionic/angular';
import { IDocumentReference } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IDocumentReference';
import { IPatient } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPatient';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-document-reference',
  templateUrl: './document-reference.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonicModule,
    PersonButtonComponent,
    ChartMenuButtonComponent,
    PatientDocumentReferenceInputDirective,
    NgIf,
    ScrollToTopComponent,
    NgFor,
    DocumentReferenceItemComponent,
    AsyncPipe,
  ],
})
export class DocumentReferencePage
  extends AbstractResourceListDirective<PatientDocumentReferenceStateService>
  implements OnInit
{
  public trackById = trackByIdGeneric;

  // UI output streams
  public patient$: Observable<IPatient>;
  public documentReferenceList$: Observable<IDocumentReference[]>;

  constructor(
    private patientState: PatientStateService,
    private patientDocumentReferenceState: PatientDocumentReferenceStateService,
    protected override injector: Injector,
  ) {
    super(patientDocumentReferenceState, injector);

    this.patient$ = this.patientState.patient$;
    this.documentReferenceList$ =
      this.patientDocumentReferenceState.documentReferenceList$;
  }

  override ngOnInit(): void {
    this.searchInput.setValue(this.patientDocumentReferenceState.searchInput);
    this.initTemplate();
  }
}
