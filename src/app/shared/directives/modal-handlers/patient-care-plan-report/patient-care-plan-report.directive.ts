import { Directive, HostListener } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PatientCarePlanReportModalPage } from './patient-care-plan-report-modal/patient-care-plan-report-modal.page';

@Directive({
  selector: '[appPatientCarePlanReport]',
  standalone: true,
})
export class PatientCarePlanReportDirective {
  private modalOpen = false; // Prevents opening of multiple instances on fast clicks

  constructor(private modalController: ModalController) {}

  @HostListener('click') onClick() {
    this.openModal();
  }

  private async openModal(): Promise<void> {
    if (this.modalOpen) {
      return;
    }
    this.modalOpen = true;

    const modal = await this.modalController.create({
      component: PatientCarePlanReportModalPage,
      canDismiss: true,
      breakpoints: [0, 0.9],
      initialBreakpoint: 0.9,
      backdropDismiss: false,
      componentProps: {},
      keyboardClose: false,
    });

    modal.onDidDismiss().then(() => {
      this.modalOpen = false;
    });

    return await modal.present();
  }
}
