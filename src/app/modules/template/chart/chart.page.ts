import { Component, Injector } from '@angular/core';
import { NotificationsService } from '@core/notifications/notifications.service';
import { TemplateChartStateService } from '@core/state/template-chart-state.service';
import { AbstractTemplateListDirective } from 'src/app/shared/directives/pages/template-list/abstract-template-list.directive';
import { ChartTemplate } from '@models/template-chart.model';
import { ListFilterPipe } from '@pipes/list-filter/list-filter.pipe';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { NavComponent } from '../components/nav/nav.component';
import { RemoveHostDirective } from '@directives/remove-host/remove-host.directive';
import { TemplateChartInputDirective } from '@directives/modal-handlers/template-chart-input/template-chart-input.directive';
import { StandardHeaderDirective } from '@directives/standard-header/standard-header.directive';
import { IonicModule } from '@ionic/angular';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.page.html',
  styleUrls: ['./chart.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    StandardHeaderDirective,
    TemplateChartInputDirective,
    RemoveHostDirective,
    NavComponent,
    NgIf,
    NgFor,
    RouterLink,
    AsyncPipe,
    ListFilterPipe,
  ],
})
export class ChartPage extends AbstractTemplateListDirective<TemplateChartStateService> {
  public list$: Observable<ChartTemplate[]>;

  constructor(
    private templateChartState: TemplateChartStateService,
    private notifications: NotificationsService,
    protected override injector: Injector,
  ) {
    super(templateChartState, injector);

    this.list$ = this.templateChartState.list$;
  }

  public async onDeleteChartTemplate(id: string | undefined): Promise<void> {
    if (!id) {
      return;
    }
    const deleteItem = await this.notifications.presentAlertDelete();
    if (deleteItem) {
      this.templateChartState.deleteTemplate(id).subscribe();
    }
  }

  public trackById(index: number, entry: ChartTemplate): string {
    return entry.firestoreId ? entry.firestoreId : '';
  }
}
