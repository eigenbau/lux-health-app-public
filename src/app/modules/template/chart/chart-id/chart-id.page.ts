import { Component } from '@angular/core';
import { TemplateChartStateService } from '@core/state/template-chart-state.service';
import { ObservationListComponent } from '@components/observation-list/observation-list.component';
import { ScrollToTopComponent } from '@components/scroll-to-top/scroll-to-top.component';
import { TemplateChartInputDirective } from '@directives/modal-handlers/template-chart-input/template-chart-input.directive';
import { NgIf, AsyncPipe } from '@angular/common';
import { StandardHeaderDirective } from '@directives/standard-header/standard-header.directive';
import { IonicModule } from '@ionic/angular';
import { IObservation } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IObservation';
import { Observable } from 'rxjs';
import { ChartTemplate } from '@models/template-chart.model';

@Component({
  selector: 'app-chart-id',
  templateUrl: './chart-id.page.html',
  standalone: true,
  imports: [
    IonicModule,
    StandardHeaderDirective,
    NgIf,
    TemplateChartInputDirective,
    ScrollToTopComponent,
    ObservationListComponent,
    AsyncPipe,
  ],
})
export class ChartIdPage {
  public readonly chartTemplate$: Observable<ChartTemplate | undefined>;
  public readonly chartTemplateObservations$: Observable<IObservation[]>;

  constructor(private templateChartState: TemplateChartStateService) {
    this.chartTemplate$ = this.templateChartState.chartTemplate$;
    this.chartTemplateObservations$ =
      this.templateChartState.chartTemplateObservations$;
  }
}
