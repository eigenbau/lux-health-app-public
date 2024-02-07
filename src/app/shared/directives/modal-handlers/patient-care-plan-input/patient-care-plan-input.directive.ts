import { Directive, HostListener, Input } from '@angular/core';
import { IonRouterOutlet, ModalController } from '@ionic/angular';
import { ICarePlan } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/ICarePlan';
import { PatientCarePlanStateService } from '@core/state/patient-care-plan-state.service';
import { PatientStateService } from '@core/state/patient-state.service';
import { PatientCarePlanInputModalPage } from './patient-care-plan-input-modal/patient-care-plan-input-modal.page';
import { preventSwipeToClose } from '@core/utils/ionic-functions';

@Directive({
  selector: '[appPatientCarePlanInput]',
  standalone: true,
})
export class PatientCarePlanInputDirective {
  @Input('appPatientCarePlanInput') carePlan?: ICarePlan;

  private modalOpen = false; // Prevents opening of multiple instances on fast clicks

  constructor(
    private routerOutlet: IonRouterOutlet,
    private modalController: ModalController,
    private patientCarePlanState: PatientCarePlanStateService,
    private patientState: PatientStateService,
  ) {}

  private get carePlanDefault(): ICarePlan {
    return {
      resourceType: 'CarePlan',
      subject: {
        reference: `Patient/${this.patientState.patientId}`,
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

    const carePlan = this.carePlan ? this.carePlan : this.carePlanDefault;

    const modal = await this.modalController.create({
      component: PatientCarePlanInputModalPage,
      canDismiss: preventSwipeToClose,
      presentingElement: this.routerOutlet.parentOutlet?.nativeEl,
      componentProps: {
        carePlan,
      },
    });

    modal.onDidDismiss().then((response) => {
      this.modalOpen = false;
      if (response?.data?.bundle) {
        // post bundle
        this.patientCarePlanState
          .postCarePlan(response?.data?.bundle)
          .subscribe();
      }
    });

    return await modal.present();
  }
}
