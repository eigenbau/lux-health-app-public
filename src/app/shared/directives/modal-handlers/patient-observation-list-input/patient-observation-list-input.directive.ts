import { Directive, HostListener, Input, Optional } from '@angular/core';
import { ModalController, IonRouterOutlet } from '@ionic/angular';
import { Reference } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/reference';
import { IObservation } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IObservation';
import { formatISO } from 'date-fns';
import { PatientObservationStateService } from '@core/state/patient-observation-state.service';
import { PatientStateService } from '@core/state/patient-state.service';
import { ObservationRootType } from '@models/observation.model';
import { PatientObservationListInputModalPage } from './patient-observation-list-input-modal/patient-observation-list-input-modal.page';
import { preventSwipeToClose } from '@core/utils/ionic-functions';

@Directive({
  selector: '[appPatientObservationListInput]',
  standalone: true,
})
export class PatientObservationListInputDirective {
  @Input('appPatientObservationListInput') observations:
    | ObservationRootType[]
    | undefined = [];
  @Input() encounterId: string | undefined;
  @Input() dateTime: string | Date | undefined;

  public now = formatISO(new Date());
  private modalOpen = false; // Prevents opening of multiple instances on fast clicks

  constructor(
    public modalController: ModalController,
    private patientObservationState: PatientObservationStateService,
    private patientState: PatientStateService,
    @Optional() private routerOutlet?: IonRouterOutlet,
  ) {}

  private get encounter(): Reference | undefined {
    return this.encounterId
      ? { reference: `Encounter/${this.encounterId}` }
      : undefined;
  }

  private get subject(): Reference {
    return {
      reference: `Patient/${this.patientState.patientId}`,
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

    const observations = this.observations;
    const dateTime = this.dateTime;
    const subject = this.subject;
    const encounter = this.encounter;

    const modal = await this.modalController.create({
      component: PatientObservationListInputModalPage,
      canDismiss: preventSwipeToClose,
      presentingElement:
        this.routerOutlet == null
          ? await this.modalController.getTop()
          : this.routerOutlet.nativeEl,
      componentProps: {
        observations,
        dateTime,
        subject,
        encounter,
      },
    });

    modal.onDidDismiss().then((response) => {
      this.modalOpen = false;
      if (response?.data?.bundle?.observations) {
        const observationArray = response?.data?.bundle
          ?.observations as IObservation[];
        // post bundle
        this.patientObservationState
          .postResources(observationArray)
          .subscribe();
      }
    });

    return await modal.present();
  }
}
