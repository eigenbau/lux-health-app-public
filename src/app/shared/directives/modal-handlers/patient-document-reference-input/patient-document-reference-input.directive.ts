import { Directive, HostListener, Input } from '@angular/core';
import { IonRouterOutlet, ModalController } from '@ionic/angular';
import { Reference } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/reference';
import { IDocumentReference } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IDocumentReference';
import { PatientDocumentReferenceStateService } from '@core/state/patient-document-reference-state.service';
import { PatientStateService } from '@core/state/patient-state.service';
import { PatientDocumentReferenceInputModalPage } from './patient-document-reference-input-modal/patient-document-reference-input-modal.page';
import { preventSwipeToClose } from '@core/utils/ionic-functions';

@Directive({
  selector: '[appPatientDocumentReferenceInput]',
  standalone: true,
})
export class PatientDocumentReferenceInputDirective {
  @Input('appPatientDocumentReferenceInput') documentReference:
    | IDocumentReference
    | undefined;
  @Input() encounterId: string | undefined;
  @Input() observationId: string | undefined;
  @Input() dateTime: string | Date | undefined;

  private modalOpen = false; // Prevents opening of multiple instances on fast clicks

  constructor(
    private routerOutlet: IonRouterOutlet,
    private modalController: ModalController,
    private patientDocumentReferenceState: PatientDocumentReferenceStateService,
    private patientState: PatientStateService,
  ) {}

  private get related(): Reference[] {
    return this.encounterId
      ? [{ reference: `Encounter/${this.encounterId}` }]
      : this.observationId
        ? [{ reference: `Observation/${this.observationId}` }]
        : [];
  }

  private get documentReferenceDefault(): IDocumentReference {
    const related = this.related;
    return {
      content: [],
      resourceType: 'DocumentReference',
      subject: {
        reference: `Patient/${this.patientState.patientId}`,
      },
      context: {
        related,
      },
    };
  }
  @HostListener('click') onClick() {
    this.openModal();
  }

  private async openModal(): Promise<void> {
    if (this.modalOpen) {
      return;
    }
    this.modalOpen = true;

    const dateTime = this.dateTime || '';

    const documentReference = this.documentReference
      ? this.documentReference
      : this.documentReferenceDefault;

    const modal = await this.modalController.create({
      component: PatientDocumentReferenceInputModalPage,
      canDismiss: preventSwipeToClose,
      presentingElement: this.routerOutlet.parentOutlet?.nativeEl,
      componentProps: {
        documentReference,
        dateTime,
      },
    });

    modal.onDidDismiss().then((response) => {
      this.modalOpen = false;
      if (response?.data?.bundle) {
        // post bundle
        this.patientDocumentReferenceState
          .postResources(response?.data?.bundle)
          .subscribe();
      }
    });

    return await modal.present();
  }
}
