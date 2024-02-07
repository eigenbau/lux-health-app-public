import { Directive, HostListener, Input } from '@angular/core';
import { IonRouterOutlet, ModalController } from '@ionic/angular';
import { TemplateChartStateService } from '@core/state/template-chart-state.service';
import { TemplateChartInputModalPage } from './template-chart-input-modal/template-chart-input-modal.page';
import { ChartTemplate } from '@models/template-chart.model';
import { preventSwipeToClose } from '@core/utils/ionic-functions';

@Directive({
  selector: '[appTemplateChartInput]',
  standalone: true,
})
export class TemplateChartInputDirective {
  @Input('appTemplateChartInput')
  chartTemplate: ChartTemplate | undefined;

  private modalOpen = false; // Prevents opening of multiple instances on fast clicks

  constructor(
    private routerOutlet: IonRouterOutlet,
    private modalController: ModalController,
    private templateChartState: TemplateChartStateService,
  ) {}

  @HostListener('click') onClick() {
    this.openModal();
  }

  private async openModal(): Promise<void> {
    if (this.modalOpen) {
      return;
    }
    this.modalOpen = true;

    const chartTemplate = this.chartTemplate;

    const modal = await this.modalController.create({
      component: TemplateChartInputModalPage,
      canDismiss: preventSwipeToClose,
      presentingElement: this.routerOutlet.parentOutlet?.nativeEl,
      componentProps: { chartTemplate },
    });

    modal.onDidDismiss().then((response) => {
      this.modalOpen = false;
      if (response?.data?.chartTemplate) {
        this.templateChartState
          .setTemplate(response.data.chartTemplate)
          .subscribe();
      }
    });

    return await modal.present();
  }
}
