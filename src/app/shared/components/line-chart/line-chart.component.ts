import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import {
  Gesture,
  GestureController,
  GestureDetail,
  IonicModule,
} from '@ionic/angular';
import { SegmentChangeEventDetail } from '@ionic/core';
import {
  differenceInDays,
  differenceInHours,
  differenceInMonths,
  differenceInYears,
  isSameYear,
} from 'date-fns';
import format from 'date-fns/format';
import {
  ApexAxisChartSeries,
  ApexXAxis,
  ChartComponent,
  NgApexchartsModule,
} from 'ng-apexcharts';
import {
  distinctUntilChanged,
  map,
  Observable,
  Subject,
  take,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs';
import {
  ObservationBundle,
  ObservationRootType,
} from '@models/observation.model';
import {
  ChartState,
  ChartStateService,
  DataPoint,
} from './services/chart-state.service';
import { BodySitePipe } from '@pipes/body-site/body-site.pipe';
import { ApexchartsSeriesValuePipe } from '@pipes/apexcharts-series-value/apexcharts-series-value.pipe';
import { ValueCodeFormatPipe } from '@pipes/value-code-format/value-code-format.pipe';
import { DistanceToNowPipe } from '@pipes/distance-to-now/distance-to-now.pipe';
import { EffectiveXToDatePipe } from '@pipes/effective-x-to-date/effective-x-to-date.pipe';
import { NgIf, NgFor, AsyncPipe, DatePipe } from '@angular/common';
import { ChartOptions, ApexChartSeriesEntry } from '@models/apexcharts.model';

interface SegmentEvent extends Event {
  detail?: SegmentChangeEventDetail;
}
@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ChartStateService],
  standalone: true,
  imports: [
    NgIf,
    IonicModule,
    NgFor,
    NgApexchartsModule,
    AsyncPipe,
    DatePipe,
    EffectiveXToDatePipe,
    DistanceToNowPipe,
    ValueCodeFormatPipe,
    ApexchartsSeriesValuePipe,
    BodySitePipe,
  ],
})
export class LineChartComponent implements AfterViewInit, OnDestroy {
  // Fixes chart not showing when navigating (back) to a page that renders this chart component
  @Input({ required: true }) set viewDidEnter(viewDidEnter: number) {
    if (viewDidEnter) {
      this.next();
    }
  }
  @Input({ required: true }) set series(observationBundle: ObservationBundle) {
    this.chartState.setObservationBundle(observationBundle);
  }
  @Input({ required: true }) set selectedObservationId(id: string) {
    this.chartState.setSelectedObservationId(id);
  }

  @ViewChild(ChartComponent) chart: ChartComponent | undefined;
  @ViewChild(ChartComponent, { read: ElementRef }) chartElement:
    | ElementRef
    | undefined;
  @Output() selectedObservationIdChanged = new EventEmitter<string>();

  // take(1) to avoid repeated chart reload at state change
  public chartOptions$: Observable<Partial<ChartOptions>>;
  public series$: Observable<ApexAxisChartSeries | undefined>;
  public zoomLevel$: Observable<'day' | 'week' | 'month' | 'year' | 'all'>;
  public observationId$: Observable<string>;
  public observationBundle$: Observable<ObservationBundle | undefined>;
  public selectedDataPoints$: Observable<DataPoint[]>;
  public visibleRange$: Observable<string>;

  public visibleObservations$: Observable<ObservationBundle | undefined>;
  public visibleCartSeries$: Observable<ApexChartSeriesEntry[]>;
  public selectedObservation$: Observable<ObservationRootType | undefined>;

  private readonly xaxis$: Observable<ApexXAxis | undefined>;
  private readonly colors$: Observable<string[] | undefined>;

  private observationId: string = ''; // Flag used in onChartSwipe()
  private destroy$ = new Subject<null>();

  private basicChartGesture: Gesture | undefined;
  private swiping = false;

  constructor(
    private gestureCtrl: GestureController,
    private chartState: ChartStateService,
  ) {
    // take(1) to avoid repeated chart reload at state change
    this.chartOptions$ = this.chartState.chartOptions$.pipe(take(1));
    this.series$ = this.chartState.series$;
    this.zoomLevel$ = this.chartState.zoomLevel$;
    this.observationId$ = this.chartState.observationId$;
    this.observationBundle$ = this.chartState.observationBundle$;
    this.selectedDataPoints$ = this.chartState.selectedDataPoints$;
    this.visibleRange$ = this.chartState.xaxis$.pipe(
      map((x) => (x?.min && x?.max ? this.formatDateRange(x.min, x.max) : '')),
    );

    this.visibleObservations$ = this.chartState.visibleObservations$;
    this.visibleCartSeries$ = this.chartState.visibleCartSeries$;
    this.selectedObservation$ = this.observationId$.pipe(
      distinctUntilChanged(),
      withLatestFrom(this.observationBundle$),
      map(
        ([id, observationBundle]) =>
          observationBundle?.observations?.find((o) => o.id === id),
      ),
    );

    this.xaxis$ = this.chartState.xaxis$;
    this.colors$ = this.chartState.colors$;
  }

  ngAfterViewInit(): void {
    if (!this.chartElement || !this.chart) {
      return;
    }
    this.basicChartGesture = this.gestureCtrl.create(
      {
        el: this.chartElement.nativeElement,
        threshold: 50,
        direction: 'x',
        gestureName: 'chart-gesture',
        onStart: (ev: GestureDetail) => {
          this.onChartSwipe(ev);
        },
        onEnd: () => (this.swiping = false),
      },
      true,
    );
    this.basicChartGesture.enable();

    this.observationId$
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged(),
        withLatestFrom(this.selectedDataPoints$),
        tap(([observationId, selectedDataPoints]) => {
          this.observationId = observationId;
          const newDataPoint =
            this.chartState.getSeriesAndDataPointIndex(observationId);
          try {
            // Update chart
            selectedDataPoints.forEach((dp) => {
              if (dp.dataPointIndex > -1 && dp.seriesIndex > -1 && this.chart) {
                this.chart.toggleDataPointSelection(
                  dp.seriesIndex,
                  dp.dataPointIndex,
                );
              }
            });
            newDataPoint.forEach((dp) => {
              if (dp.dataPointIndex > -1 && dp.seriesIndex > -1 && this.chart) {
                this.chart.toggleDataPointSelection(
                  dp.seriesIndex,
                  dp.dataPointIndex,
                );
              }
            });

            // Update state
            this.chartState.setSelectedDataPointIndex(newDataPoint);

            // Emit new observationId
            this.selectedObservationIdChanged.emit(observationId);
          } catch (error) {}
        }),
      )
      .subscribe();

    this.xaxis$
      .pipe(
        takeUntil(this.destroy$),
        tap((xaxis) => {
          try {
            this.chart?.updateOptions({ xaxis });
          } catch (error) {}
        }),
      )
      .subscribe();

    this.colors$
      .pipe(
        takeUntil(this.destroy$),
        tap((colors) => {
          try {
            this.chart?.updateOptions({ colors });
          } catch (error) {}
        }),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    if (this.basicChartGesture) {
      this.basicChartGesture.destroy();
    }
    this.destroy$.next(null);
  }

  public onChartSwipe(ev: GestureDetail): void {
    if (this.observationId !== '') {
      return this.chartState.setSelectedObservationIdToNone();
    }

    if (this.swiping) {
      return;
    }

    if (ev.deltaX < 0) {
      this.next();
    }
    if (ev.deltaX > 0) {
      this.previous();
    }
    this.swiping = true;
  }

  public onZoomClick(e: SegmentEvent): void {
    if (!e.detail?.value) {
      return;
    }
    const zoomLevel = e.detail.value as ChartState['zoomLevel'];
    this.chartState.setZoom(zoomLevel);
  }

  // Private methods
  private previous(): void {
    this.chartState.setVisibleRange('previous');
  }

  private next(): void {
    this.chartState.setVisibleRange('next');
  }

  private formatDateRange(min: number, max: number): string {
    if (!min || !max) {
      return '';
    }
    const minDate = new Date(min);
    const maxDate = new Date(max);
    return differenceInHours(maxDate, minDate) < 25
      ? format(min, 'EEEE, d MMM y')
      : differenceInDays(maxDate, minDate) < 8
        ? `${format(
            min,
            `d MMM ${isSameYear(min, max) ? '' : 'y'}`,
          )} - ${format(max, 'd MMM y')}`
        : differenceInMonths(maxDate, minDate) < 1
          ? format(min, 'MMM y')
          : differenceInMonths(maxDate, minDate) > 0 &&
              differenceInMonths(maxDate, minDate) < 6
            ? `${format(min, 'MMM y')} - ${format(max, 'MMM y')}`
            : differenceInYears(maxDate, minDate) < 1
              ? format(min, 'y')
              : differenceInYears(maxDate, minDate) < 3
                ? `${format(min, 'MMM y')} - ${format(max, 'MMM y')}`
                : `${format(min, 'y')} - ${format(max, 'y')}`;
  }
}
