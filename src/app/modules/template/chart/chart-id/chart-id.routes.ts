import { Routes } from '@angular/router';
import { TemplateChartIdGuard } from '@core/guards/template-chart-id.guard';

import { ChartIdPage } from './chart-id.page';

export const routes: Routes = [
  {
    path: '',
    component: ChartIdPage,
    canActivate: [TemplateChartIdGuard],
  },
];
