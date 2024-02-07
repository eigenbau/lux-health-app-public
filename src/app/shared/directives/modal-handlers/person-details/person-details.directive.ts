import { Directive, HostListener } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PersonDetailsModalPage } from './person-details-modal/person-details-modal.page';

@Directive({
  selector: '[appPersonDetails]',
  standalone: true,
})
export class PersonDetailsDirective {
  private modalOpen = false; // Prevents opening of multiple instances on fast clicks

  constructor(private modalController: ModalController) {}

  @HostListener('click') onClick() {
    this.openModal();
  }

  public async openModal(): Promise<void> {
    if (this.modalOpen) {
      return;
    }
    this.modalOpen = true;

    const modal = await this.modalController.create({
      component: PersonDetailsModalPage,
      canDismiss: true,
      breakpoints: [0, 0.4, 0.9],
      initialBreakpoint: 0.4,
      backdropDismiss: true,
    });

    modal.onDidDismiss().then(() => {
      this.modalOpen = false;
    });

    return await modal.present();
  }
}
