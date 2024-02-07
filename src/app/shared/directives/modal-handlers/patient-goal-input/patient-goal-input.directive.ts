import { Directive, HostListener, Input, Optional } from '@angular/core';
import { IonRouterOutlet, ModalController } from '@ionic/angular';
import { IGoal } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IGoal';
import { PatientGoalStateService } from '@core/state/patient-goal-state.service';
import { PatientStateService } from '@core/state/patient-state.service';
import { PatientGoalInputModalPage } from './patient-goal-input-modal/patient-goal-input-modal.page';
import { preventSwipeToClose } from '@core/utils/ionic-functions';

@Directive({
  selector: '[appPatientGoalInput]',
  standalone: true,
})
export class PatientGoalInputDirective {
  @Input('appPatientGoalInput') goal: IGoal | undefined;
  @Input() conditionId: string | undefined;

  private modalOpen = false; // Prevents opening of multiple instances on fast clicks

  constructor(
    private modalController: ModalController,
    private patientGoalState: PatientGoalStateService,
    private patientState: PatientStateService,
    @Optional() private routerOutlet?: IonRouterOutlet,
  ) {}

  private get goalDefault(): IGoal {
    const addresses = this.conditionId
      ? [{ reference: `Condition/${this.conditionId}` }]
      : undefined;

    return {
      resourceType: 'Goal',
      description: {},
      subject: {
        reference: `Patient/${this.patientState.patientId}`,
      },
      addresses,
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

    const goal = this.goal ? this.goal : this.goalDefault;

    const modal = await this.modalController.create({
      component: PatientGoalInputModalPage,
      canDismiss: preventSwipeToClose,
      presentingElement:
        this.routerOutlet == null
          ? await this.modalController.getTop()
          : this.routerOutlet.nativeEl,
      componentProps: {
        goal,
      },
    });

    modal.onDidDismiss().then((response) => {
      this.modalOpen = false;
      if (response?.data?.bundle) {
        // post bundle
        this.patientGoalState.postGoal(response?.data?.bundle).subscribe();
      }
    });

    return await modal.present();
  }
}
