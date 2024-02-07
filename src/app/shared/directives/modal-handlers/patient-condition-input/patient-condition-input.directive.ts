import { Directive, HostListener, Input, Optional } from '@angular/core';
import { IonRouterOutlet, ModalController } from '@ionic/angular';
import { ICondition } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/ICondition';
import { PatientConditionStateService } from '@core/state/patient-condition-state.service';
import { PatientStateService } from '@core/state/patient-state.service';
import { PatientConditionInputModalPage } from './patient-condition-input-modal/patient-condition-input-modal.page';
import { preventSwipeToClose } from '@core/utils/ionic-functions';

@Directive({
  selector: '[appPatientConditionInput]',
  standalone: true,
})
export class PatientConditionInputDirective {
  @Input('appPatientConditionInput') condition: ICondition | undefined;
  @Input() encounterId: string | undefined;

  private modalOpen = false; // Prevents opening of multiple instances on fast clicks

  constructor(
    private modalController: ModalController,
    private patientConditionState: PatientConditionStateService,
    private patientState: PatientStateService,
    @Optional() private routerOutlet?: IonRouterOutlet,
  ) {}

  private get conditionDefault(): ICondition {
    const encounter =
      this.encounterId || ''
        ? { reference: `Encounter/${this.encounterId}` }
        : undefined;

    return {
      resourceType: 'Condition',
      subject: {
        reference: `Patient/${this.patientState.patientId}`,
      },
      encounter,
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

    const condition = this.condition ? this.condition : this.conditionDefault;

    const modal = await this.modalController.create({
      component: PatientConditionInputModalPage,
      canDismiss: preventSwipeToClose,
      presentingElement:
        this.routerOutlet == null
          ? await this.modalController.getTop()
          : this.routerOutlet.nativeEl,
      componentProps: {
        condition,
      },
    });

    modal.onDidDismiss().then((response) => {
      this.modalOpen = false;
      if (response?.data?.bundle) {
        // post bundle
        this.patientConditionState
          .postCondition(response?.data?.bundle)
          .subscribe();
      }
    });

    return await modal.present();
  }
}
