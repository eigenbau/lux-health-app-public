import { Directive, HostListener, Input } from '@angular/core';
import { IonRouterOutlet, ModalController } from '@ionic/angular';
import { PersonStateService } from '@core/state/person-state.service';
import { PersonInputModalPage } from './person-input-modal/person-input-modal.page';
import { PersonBundle, PersonRoles } from '@models/person-bundle.model';
import { preventSwipeToClose } from '@core/utils/ionic-functions';

@Directive({
  selector: '[appPersonInput]',
  standalone: true,
})
export class PersonInputDirective {
  @Input('appPersonInput') personBundle: PersonBundle | undefined;
  @Input() initialPersonRoles: PersonRoles | undefined;

  private modalOpen = false; // Prevents opening of multiple instances on fast clicks

  constructor(
    private routerOutlet: IonRouterOutlet,
    private modalController: ModalController,
    private personState: PersonStateService,
  ) {}

  @HostListener('click') onClick() {
    this.openModal();
  }

  private async openModal(): Promise<void> {
    if (this.modalOpen) {
      return;
    }
    this.modalOpen = true;

    const personBundle = this.personBundle ? this.personBundle : undefined;
    const initialPersonRoles = this.initialPersonRoles;

    const modal = await this.modalController.create({
      component: PersonInputModalPage,
      canDismiss: preventSwipeToClose,
      presentingElement: this.routerOutlet?.parentOutlet?.nativeEl,
      componentProps: {
        personBundle,
        initialPersonRoles,
      },
    });

    modal.onDidDismiss().then((response) => {
      this.modalOpen = false;
      if (response?.data?.personBundle) {
        this.personState
          .updatePerson(response.data.personBundle as PersonBundle)
          .subscribe();
      }
    });

    return await modal.present();
  }
}
