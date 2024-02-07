import { Directive, HostListener, Input } from '@angular/core';
import { IonRouterOutlet, ModalController } from '@ionic/angular';
import { TemplateObservationStateService } from '@core/state/template-observation-state.service';
import { TemplateObservationInputModalPage } from './template-observation-input-modal/template-observation-input-modal.page';
import { ObservationTemplate } from '@models/observation.model';
import { preventSwipeToClose } from '@core/utils/ionic-functions';

@Directive({
  selector: '[appTemplateObservationInput]',
  standalone: true,
})
export class TemplateObservationInputDirective {
  @Input('appTemplateObservationInput')
  observationTemplate: ObservationTemplate | undefined;

  private modalOpen = false; // Prevents opening of multiple instances on fast clicks

  constructor(
    private routerOutlet: IonRouterOutlet,
    private modalController: ModalController,
    private templateObservationState: TemplateObservationStateService,
  ) {}

  @HostListener('click') onClick() {
    this.openModal();
  }

  private async openModal(): Promise<void> {
    if (this.modalOpen) {
      return;
    }
    this.modalOpen = true;

    const observationTemplate = this.observationTemplate;

    const modal = await this.modalController.create({
      component: TemplateObservationInputModalPage,
      canDismiss: preventSwipeToClose,
      presentingElement: this.routerOutlet.parentOutlet?.nativeEl,
      componentProps: { observationTemplate },
    });

    modal.onDidDismiss().then((response) => {
      this.modalOpen = false;
      if (response?.data?.observationTemplate) {
        // post bundle
        this.templateObservationState
          .setTemplate(response.data.observationTemplate)
          .subscribe();
      }
    });

    return await modal.present();
  }
}
