import { Injectable, OnDestroy } from '@angular/core';
import { ApexAxisChartSeries } from 'ng-apexcharts';
import { Subject, takeUntil, tap } from 'rxjs';
import { StateService } from '@core/state/abstract-services/state.service';
import { UiSettingsStateService } from '@core/state/ui-settings-state.service';
import { ChartOptions } from '@models/apexcharts.model';
import { chartOptions } from '../configs/chart-options';

export interface ApexAxisChartSeriesData {
  x: any;
  y: any;
  fillColor?: string;
  strokeColor?: string;
  goals?: any;
  meta: { id: string };
}

export interface ChartState {
  chartOptions: Partial<ChartOptions>;
}

const chartState: ChartState = {
  chartOptions,
};

@Injectable()
export class ChartStateService
  extends StateService<ChartState>
  implements OnDestroy
{
  public readonly chartOptions$ = this.select((state) => state.chartOptions);
  public readonly series$ = this.select((state) => state.chartOptions?.series);
  public readonly colors$ = this.select((state) => state.chartOptions?.colors);
  public readonly chart$ = this.select((state) => state.chartOptions.chart);

  protected override readonly destroy$ = new Subject<null>();

  constructor(private uiSettingsState: UiSettingsStateService) {
    super(chartState);

    // Set colors and marker click function
    this.uiSettingsState.state$
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          const hsl = this.uiSettingsState.getHSLColorWheel();
          this.setState({
            chartOptions: {
              ...this.state.chartOptions,
              colors: [...hsl],
            },
          });
        }),
      )
      .subscribe();
  }

  override ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  // public
  public setSeries(series: ApexAxisChartSeries): void {
    // Set data from Observation[]
    this.setState({
      chartOptions: {
        ...this.state.chartOptions,
        series,
      },
    });
  }

  public setDimensions(
    dimensions: {
      width?: number | string;
      height?: number | string;
    } = {},
  ) {
    const {
      width = this.state.chartOptions.chart?.width,
      height = this.state.chartOptions.chart?.height,
    } = dimensions;
    this.setState({
      chartOptions: {
        ...this.state.chartOptions,
        chart: {
          ...this.state.chartOptions.chart,
          type: this.state.chartOptions.chart?.type || 'line',
          width,
          height,
        },
      },
    });
  }
}
