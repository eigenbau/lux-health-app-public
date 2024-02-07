import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
} from '@angular/core';
import { NavController, IonicModule } from '@ionic/angular';
import { Reference } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/reference';
import { Observable, switchMap, takeUntil, tap } from 'rxjs';
import { NotificationsService } from '@core/notifications/notifications.service';
import { RoutingService } from '@core/routing/routing.service';
import { ScheduleStateService } from '@core/state/schedule-state.service';
import { trackByIdGeneric } from '@core/utils/angular-functions';
import { AbstractResourceListDirective } from 'src/app/shared/directives/pages/resource-list/abstract-resource-list.directive';
import { IsSameDayPipe } from '@pipes/is-same-day/is-same-day.pipe';
import { PeriodPipe } from '@pipes/period/period.pipe';
import { SkeletonListComponent } from '@components/skeleton-list/skeleton-list.component';
import { ScrollToTopComponent } from '@components/scroll-to-top/scroll-to-top.component';
import {
  NgIf,
  NgFor,
  AsyncPipe,
  TitleCasePipe,
  DatePipe,
} from '@angular/common';
import { IEncounter } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IEncounter';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonicModule,
    NgIf,
    ScrollToTopComponent,
    SkeletonListComponent,
    NgFor,
    AsyncPipe,
    TitleCasePipe,
    DatePipe,
    PeriodPipe,
    IsSameDayPipe,
  ],
})
export class SchedulePage
  extends AbstractResourceListDirective<ScheduleStateService>
  implements OnInit
{
  public trackById = trackByIdGeneric;

  // UI output streams
  public scheduleList$: Observable<IEncounter[]>;

  constructor(
    private scheduleState: ScheduleStateService,
    private navController: NavController,
    private notifications: NotificationsService,
    private routingService: RoutingService,
    protected override injector: Injector,
  ) {
    super(scheduleState, injector);

    this.scheduleList$ = this.scheduleState.scheduleList$;
  }

  override ngOnInit(): void {
    this.initTemplate();
    this.scheduleState.getList().subscribe();
  }

  public goToPatientPage(
    reference: Reference['reference'] | undefined,
    resourceType = '',
    resourceId = '',
  ): void {
    if (!reference) {
      return;
    }
    this.notifications.presentLoader();
    this.routingService
      .getPatientRoute(reference, resourceType, resourceId)
      .pipe(
        tap((route) => {
          this.navController.navigateForward(route);
        }),
        switchMap(() => this.notifications.dismissLoader()),
      )
      .subscribe();
  }
}
