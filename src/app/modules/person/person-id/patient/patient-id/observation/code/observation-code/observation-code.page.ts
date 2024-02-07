import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subject,
  filter,
  map,
  takeUntil,
  tap,
} from 'rxjs';
import { PatientObservationStateService } from '@core/state/patient-observation-state.service';
import { PatientStateService } from '@core/state/patient-state.service';
import {
  buildObservationBundle,
  templateFromObservation,
} from '@core/utils/fhir/observation-functions';
import { BodySitePipe } from '@pipes/body-site/body-site.pipe';
import { DistanceToNowPipe } from '@pipes/distance-to-now/distance-to-now.pipe';
import { EffectiveXToDatePipe } from '@pipes/effective-x-to-date/effective-x-to-date.pipe';
import { ValueXPipe } from '@pipes/value-x/value-x.pipe';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ExpandableDirective } from '@directives/expandable/expandable.directive';
import { LineChartComponent } from '@components/line-chart/line-chart.component';
import { ScrollToTopComponent } from '@components/scroll-to-top/scroll-to-top.component';
import { PatientObservationInputDirective } from '@directives/modal-handlers/patient-observation-input/patient-observation-input.directive';
import { ChartMenuButtonComponent } from '@components/chart-menu-button/chart-menu-button.component';
import { PersonButtonComponent } from '@components/person-button/person-button.component';
import { IonicModule } from '@ionic/angular';
import { NgIf, NgFor, NgClass, NgStyle, AsyncPipe } from '@angular/common';
import { IPatient } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPatient';
import { ObservationBundle } from '@models/observation.model';
import { IObservation } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IObservation';
import { arrayHasValue } from '@core/utils/object-functions';
import { RoutingService } from '@core/routing/routing.service';

@Component({
  selector: 'app-observation-code',
  templateUrl: './observation-code.page.html',
  styleUrls: ['./observation-code.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    IonicModule,
    PersonButtonComponent,
    ChartMenuButtonComponent,
    PatientObservationInputDirective,
    ScrollToTopComponent,
    LineChartComponent,
    NgFor,
    ExpandableDirective,
    NgClass,
    RouterLink,
    NgStyle,
    AsyncPipe,
    ValueXPipe,
    EffectiveXToDatePipe,
    DistanceToNowPipe,
    BodySitePipe,
  ],
})
export class ObservationCodePage implements OnDestroy {
  public patient$: Observable<IPatient>;
  public loading$: Observable<boolean>;
  protected readonly destroy$ = new Subject<null>();

  public observationBundle$: Observable<ObservationBundle>;
  public selectedObservationId$ = new BehaviorSubject<string | undefined>(
    undefined,
  );
  public observationTemplate$: Observable<IObservation>;

  // Helper to trigger chart reload in line-chart-component
  public viewDidEnter$ = new BehaviorSubject<number>(0);

  constructor(
    private patientState: PatientStateService,
    private patientObservationState: PatientObservationStateService,
    private routing: RoutingService,
    private route: ActivatedRoute,
  ) {
    this.patient$ = this.patientState.patient$;
    this.loading$ = this.patientObservationState.loading$;
    this.observationBundle$ =
      this.patientObservationState.observationFilteredByCode$.pipe(
        map((o) => buildObservationBundle(o)),
      );
    this.observationTemplate$ = this.observationBundle$.pipe(
      map((observationByCode) => {
        const o = arrayHasValue(observationByCode.observations)
          ? observationByCode.observations.slice(-1)[0]
          : undefined;
        return o ? templateFromObservation(o) : undefined;
      }),
      filter(Boolean),
    );

    this.routing
      .goBack({
        resource: this.patientObservationState.observationFilteredByCode$,
        loading: this.loading$,
        route: ['../../../'],
        relativeTo: this.route,
      })
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          console.log('activatedRoute', this.route);
        }),
      )
      .subscribe();
  }

  public set selectedObservationId(id: string) {
    this.selectedObservationId$.next(id);
  }

  ngOnDestroy(): void {
    this.selectedObservationId$.complete();
    this.viewDidEnter$.complete();
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  ionViewWillEnter(): void {
    this.viewDidEnter$.next(this.viewDidEnter$.value + 1);
  }

  public selectObservation(id: string): void {
    this.selectedObservationId$.next(id);
  }
}
