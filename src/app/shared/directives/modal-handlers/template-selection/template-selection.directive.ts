import { Directive, EventEmitter, HostListener, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TemplateSelectionModalPage } from './template-selection-modal/template-selection-modal.page';
import { TemplateBundle } from '@models/template.model';
import { preventSwipeToClose } from '@core/utils/ionic-functions';

@Directive({
  selector: '[appTemplateSelection]',
  standalone: true,
})
export class TemplateSelectionDirective {
  @Output() templateBundleSelected = new EventEmitter<TemplateBundle>();

  private modalOpen = false; // Prevents opening of multiple instances on fast clicks

  constructor(private modalController: ModalController) {}

  @HostListener('click') onClick() {
    this.openModal();
  }

  public openModalOnInit(): void {
    this.openModal();
  }

  private async openModal(): Promise<void> {
    if (this.modalOpen) {
      return;
    }
    this.modalOpen = true;

    const modal = await this.modalController.create({
      component: TemplateSelectionModalPage,
      canDismiss: preventSwipeToClose,
      presentingElement: await this.modalController.getTop(),
    });

    modal.onDidDismiss().then((res) => {
      this.modalOpen = false;
      if (!res?.data?.templateBundle) {
        return;
      }
      const templateBundle = res.data.templateBundle as TemplateBundle;

      this.templateBundleSelected.emit(templateBundle);
    });

    return await modal.present();
  }
}
