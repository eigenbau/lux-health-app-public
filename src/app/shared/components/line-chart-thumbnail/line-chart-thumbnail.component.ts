import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { Observable, Subject, take, takeUntil, tap } from 'rxjs';
import { convertValueGroupsToSeries } from '@core/utils/apexcharts-functions';
import { ValueGroup } from '@models/value-x.model';
import { ChartStateService } from './services/chart-state.service';
import { NgIf, AsyncPipe } from '@angular/common';
import { ChartOptions } from '@models/apexcharts.model';
import { arrayHasValue } from '@core/utils/object-functions';

@Component({
  selector: 'app-line-chart-thumbnail',
  templateUrl: './line-chart-thumbnail.component.html',
  providers: [ChartStateService],
  standalone: true,
  imports: [NgIf, NgApexchartsModule, AsyncPipe],
})
export class LineChartThumbnailComponent implements AfterViewInit, OnDestroy {
  @Input() set series(valueGroups: ValueGroup[] | undefined) {
    const s = !arrayHasValue(valueGroups)
      ? null
      : convertValueGroupsToSeries(valueGroups);
    if (s) {
      this.chartState.setSeries(s);
    }
  }
  @Input({ required: true }) set height(height: number | string) {
    this.chartState.setDimensions({ height });
  }
  @Input({ required: true }) set width(width: number | string) {
    this.chartState.setDimensions({ width });
  }

  @ViewChild(ChartComponent) chart: ChartComponent | undefined;
  @ViewChild(ChartComponent, { read: ElementRef }) chartElement:
    | ElementRef
    | undefined;

  public chartOptions$: Observable<Partial<ChartOptions>>;
  public series$: Observable<ApexAxisChartSeries | undefined>;
  private chart$: Observable<ApexChart | undefined>;

  private readonly colors$: Observable<string[] | undefined>;

  private readonly destroy$ = new Subject<null>();

  constructor(private chartState: ChartStateService) {
    this.chartOptions$ = this.chartState.chartOptions$.pipe(take(1));
    this.series$ = this.chartState.series$;
    this.chart$ = this.chartState.chart$;
    this.colors$ = this.chartState.colors$;
  }

  ngAfterViewInit(): void {
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

    this.chart$
      .pipe(
        takeUntil(this.destroy$),
        tap((chart) => {
          try {
            this.chart?.updateOptions({ chart });
          } catch (error) {}
        }),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
