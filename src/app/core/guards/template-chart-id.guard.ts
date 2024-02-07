import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { TemplateChartStateService } from '../state/template-chart-state.service';

@Injectable({
  providedIn: 'root',
})
export class TemplateChartIdGuard {
  constructor(private templateChartState: TemplateChartStateService) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    this.templateChartState.setChartId(route.params['chartId']);
    return true;
  }
}
