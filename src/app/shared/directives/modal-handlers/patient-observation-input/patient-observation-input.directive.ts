import { Directive, HostListener, Input } from '@angular/core';
import { IonRouterOutlet, ModalController } from '@ionic/angular';
import { IObservation } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IObservation';
import { formatISO } from 'date-fns';
import { PatientObservationStateService } from '@core/state/patient-observation-state.service';
import { PatientObservationInputModalPage } from './patient-observation-input-modal/patient-observation-input-modal.page';
import { preventSwipeToClose } from '@core/utils/ionic-functions';

@Directive({
  selector: '[appPatientObservationInput]',
  standalone: true,
})
export class PatientObservationInputDirective {
  @Input('appPatientObservationInput') observation: IObservation | undefined;
  @Input() editMode = true;

  private modalOpen = false; // Prevents opening of multiple instances on fast clicks

  constructor(
    private routerOutlet: IonRouterOutlet,
    private modalController: ModalController,
    private patientObservationState: PatientObservationStateService
  ) {}

  @HostListener('click') onClick() {
    this.openModal();
  }

  private async openModal(): Promise<void> {
    if (this.modalOpen) {
      return;
    }
    if (!this.observation) {
      console.error('Please pass a valid Observation resource as a template');
    }

    this.modalOpen = true;

    const observation = this.editMode
      ? this.observation
      : {
          ...this.observation,
          id: '',
          effectiveDateTime: formatISO(new Date()),
        };

    const modal = await this.modalController.create({
      component: PatientObservationInputModalPage,
      canDismiss: preventSwipeToClose,
      presentingElement: this.routerOutlet.parentOutlet?.nativeEl,
      componentProps: {
        observation,
      },
    });

    modal.onDidDismiss().then((response) => {
      this.modalOpen = false;
      if (response?.data?.bundle) {
        // post bundle
        this.patientObservationState
          .postResources(response?.data?.bundle)
          .subscribe();
      }
    });

    return await modal.present();
  }
}
