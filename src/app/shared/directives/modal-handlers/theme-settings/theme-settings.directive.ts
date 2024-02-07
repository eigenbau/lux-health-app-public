import { Directive, HostListener } from '@angular/core';
import { IonRouterOutlet, ModalController } from '@ionic/angular';
import { ThemeModalPage } from './theme-modal/theme-modal.page';
import { preventSwipeToClose } from '@core/utils/ionic-functions';

@Directive({
  selector: '[appThemeSettings]',
  standalone: true,
})
export class ThemeSettingsDirective {
  private modalOpen = false; // Prevents opening of multiple instances on fast clicks

  constructor(
    private routerOutlet: IonRouterOutlet,
    private modalController: ModalController,
  ) {}

  @HostListener('click') onClick() {
    this.openModal();
  }

  private async openModal(): Promise<void> {
    if (this.modalOpen) {
      return;
    }
    this.modalOpen = true;

    const modal = await this.modalController.create({
      component: ThemeModalPage,
      canDismiss: preventSwipeToClose,
      presentingElement: this.routerOutlet.nativeEl,
    });

    modal.onDidDismiss().then(() => {
      this.modalOpen = false;
    });

    return await modal.present();
  }
}
