import { Directive, HostListener, Input } from '@angular/core';
import { IonRouterOutlet, ModalController } from '@ionic/angular';
import { PatientEncounterStateService } from '@core/state/patient-encounter-state.service';
import { PatientEncounterInputModalPage } from './patient-encounter-input-modal/patient-encounter-input-modal.page';
import { PatientStateService } from '@core/state/patient-state.service';
import { IEncounter } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IEncounter';
import {
  ENCOUNTER_CLASS,
  ENCOUNTER_SERVICE_TYPE,
} from '@core/config/fhir.constants';
import { preventSwipeToClose } from '@core/utils/ionic-functions';

@Directive({
  selector: '[appPatientEncounterInput]',
  standalone: true,
})
export class PatientEncounterInputDirective {
  @Input('appPatientEncounterInput') encounter: IEncounter | undefined;

  private modalOpen = false; // Prevents opening of multiple instances on fast clicks

  constructor(
    private routerOutlet: IonRouterOutlet,
    private modalController: ModalController,
    private patientEncounterState: PatientEncounterStateService,
    private patientState: PatientStateService
  ) {}

  public get blankEncounter(): IEncounter {
    return {
      resourceType: 'Encounter', // static
      status: 'finished',
      class: ENCOUNTER_CLASS,
      serviceType: ENCOUNTER_SERVICE_TYPE,
      subject: {
        // static
        reference: `Patient/${this.patientState.patientId}`,
      },
      id: '',
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

    const encounter = this.encounter ? this.encounter : this.blankEncounter;

    const modal = await this.modalController.create({
      component: PatientEncounterInputModalPage,
      canDismiss: preventSwipeToClose,
      presentingElement: this.routerOutlet.parentOutlet?.nativeEl,
      componentProps: { encounter },
    });

    modal.onDidDismiss().then((response) => {
      this.modalOpen = false;
      if (response?.data?.bundle) {
        // post bundle
        this.patientEncounterState
          .postResources(response?.data?.bundle)
          .subscribe();
      }
    });

    return await modal.present();
  }
}
