import { Injectable, OnDestroy } from '@angular/core';
import {
  startOfDay,
  isMonday,
  previousMonday,
  isSunday,
  nextSunday,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  differenceInHours,
  subHours,
  addHours,
  addDays,
  addMonths,
  addWeeks,
  addYears,
  subMonths,
  subWeeks,
  subYears,
  format,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
  isSameDay,
} from 'date-fns';
import { ApexAxisChartSeries, ApexXAxis, ApexYAxis } from 'ng-apexcharts';
import { Subject, takeUntil, tap } from 'rxjs';
import { StateService } from '@core/state/abstract-services/state.service';
import { UiSettingsStateService } from '@core/state/ui-settings-state.service';
import {
  convertValueGroupsToSeries,
  isArrayOfApexAxisChartSeriesData,
} from '@core/utils/apexcharts-functions';
import { buildObservationBundle } from '@core/utils/fhir/observation-functions';
import {
  arrayHasValue,
  isObject,
  sortByInt,
} from '@core/utils/object-functions';
import {
  ApexAxisChartSeriesData,
  ApexChartSeriesEntry,
  ChartOptions,
} from '@models/apexcharts.model';
import { ObservationBundle } from '@models/observation.model';
import { chartOptions } from '../configs/chart-options';
import { IObservation } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IObservation';
import { isNumber } from '@core/utils/number-functions';
interface VisibleDateRange {
  min: Date;
  max: Date;
}

interface Timestamp {
  timestamp: number;
  resourceId: string;
}

export interface DataPoint {
  seriesIndex: number;
  dataPointIndex: number;
}

export interface ChartState {
  zoomLevel: 'day' | 'week' | 'month' | 'year' | 'all';
  visibleObservations: ObservationBundle | undefined;
  visibleChartSeries: ApexChartSeriesEntry[];
  observationId: string;
  observationBundle: ObservationBundle | undefined;
  selectedDataPoints: DataPoint[];
  chartOptions: Partial<ChartOptions>;
}

const chartState: ChartState = {
  zoomLevel: 'month',
  visibleObservations: undefined,
  visibleChartSeries: [],
  observationId: '',
  observationBundle: undefined,
  selectedDataPoints: [],
  chartOptions,
};

@Injectable()
export class ChartStateService
  extends StateService<ChartState>
  implements OnDestroy
{
  public readonly chartOptions$ = this.select((state) => state.chartOptions);
  public readonly visibleObservations$ = this.select(
    (state) => state.visibleObservations,
  );
  public readonly visibleCartSeries$ = this.select(
    (state) => state.visibleChartSeries,
  );
  public readonly observationId$ = this.select((state) => state.observationId);
  public readonly observationBundle$ = this.select(
    (state) => state.observationBundle,
  );
  public readonly selectedDataPoints$ = this.select(
    (state) => state.selectedDataPoints,
  );
  public readonly zoomLevel$ = this.select((state) => state.zoomLevel);
  public readonly xaxis$ = this.select((state) => state.chartOptions.xaxis);
  public readonly series$ = this.select((state) => state.chartOptions.series);
  public readonly colors$ = this.select((state) => state.chartOptions.colors);

  protected override readonly destroy$ = new Subject<null>();

  constructor(private uiSettingsState: UiSettingsStateService) {
    super(chartState);

    // Set colors and marker click function
    this.setState({
      chartOptions: {
        ...this.state.chartOptions,
        chart: {
          ...this.state.chartOptions.chart,
          type: this.state.chartOptions.chart?.type || 'line',
          events: {
            // dataPointSelection: (event, chartContext, config) => {
            //   console.log('point selection', config);
            // },
            markerClick: (
              event,
              chartContext,
              { seriesIndex, dataPointIndex, config },
            ) => {
              const observationId = this.getObservationIdFromDataPointIndex(
                seriesIndex,
                dataPointIndex,
              );
              this.setSelectedObservationId(observationId);
            },
            // click: (e, chartContext, config) => {
            //   this.setSelectedObservationIdToNone();
            // },
          },
        },
      },
    });

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

  private get xValues(): Timestamp[] {
    if (!this.state.chartOptions.series) {
      return [];
    }
    const timestampArray = this.state.chartOptions.series.reduce(
      (acc: Timestamp[], val) => {
        const xSerries = val.data.map((d) => {
          return {
            timestamp: d && !isNumber(d) && 'x' in d ? d.x : 0,
            resourceId:
              d && !isNumber(d) && 'meta' in d ? d.meta.resourceId : '',
          };
        });
        return [...acc, ...xSerries];
      },
      [],
    );
    return sortByInt(timestampArray, ['timestamp']);
  }

  override ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  // public
  public setObservationBundle(observationBundle: ObservationBundle): void {
    this.setState({ observationBundle });
    const s = convertValueGroupsToSeries(observationBundle.values);
    if (s) {
      this.setSeriesAndFormatYAxis(s as ApexChartSeriesEntry[]);
      this.setZoom('all');
    }
  }

  public setZoom(zoomLevel: ChartState['zoomLevel']): void {
    const visibleDateRange = this.getVisibleDateRange(
      zoomLevel,
      this.state.observationId,
    );
    if (!visibleDateRange) {
      return;
    }
    const { tickAmount, labels } = this.setXAxisWithAdaptedLabels(zoomLevel);

    const min = visibleDateRange.min.getTime();
    const max = visibleDateRange.max.getTime();
    // update chartState
    this.setState({
      visibleObservations: this.getVisibleObservations(min, max),
      visibleChartSeries: this.getVisibleChartSeries(min, max),
      zoomLevel,
      chartOptions: {
        ...this.state.chartOptions,
        xaxis: {
          ...this.state.chartOptions.xaxis,
          min,
          max,
          tickAmount,
          labels: {
            ...this.state.chartOptions.xaxis?.labels,
            formatter: labels?.formatter,
            style: { cssClass: zoomLevel },
          },
        },
      },
    });
  }

  public setVisibleRange(direction: 'previous' | 'next'): void {
    if (
      !this.state.chartOptions?.xaxis?.min ||
      !this.state.chartOptions?.xaxis?.max
    ) {
      throw new Error(`No xaxis min or max supplied to 'setVisibleRange'.`);
    }
    const zoomLevel = this.state.zoomLevel;
    const currentMin = new Date(this.state.chartOptions.xaxis.min);
    const currentMax = new Date(this.state.chartOptions.xaxis.max);
    const dataMin = new Date(this.xValues[0].timestamp);
    const dataMax = new Date(this.xValues.slice(-1)[0].timestamp);

    const visibleDateRange: VisibleDateRange = {
      min: currentMin,
      max: currentMax,
    };

    if (direction === 'next') {
      switch (zoomLevel) {
        case 'day':
          visibleDateRange.min = addDays(currentMin, 1);
          visibleDateRange.max = addDays(currentMax, 1);
          break;
        case 'week':
          visibleDateRange.min = addWeeks(currentMin, 1);
          visibleDateRange.max = addWeeks(currentMax, 1);
          break;
        case 'month':
          visibleDateRange.min = startOfMonth(addMonths(currentMin, 1));
          visibleDateRange.max = endOfMonth(addMonths(currentMax, 1));
          break;
        case 'year':
          visibleDateRange.min = startOfYear(addYears(currentMin, 1));
          visibleDateRange.max = endOfYear(addYears(currentMax, 1));
          break;
      }
    }
    if (direction === 'previous') {
      switch (zoomLevel) {
        case 'day':
          visibleDateRange.min = subDays(currentMin, 1);
          visibleDateRange.max = subDays(currentMax, 1);
          break;
        case 'week':
          visibleDateRange.min = subWeeks(currentMin, 1);
          visibleDateRange.max = subWeeks(currentMax, 1);
          break;
        case 'month':
          visibleDateRange.min = startOfMonth(subMonths(currentMin, 1));
          visibleDateRange.max = endOfMonth(subMonths(currentMax, 1));
          break;
        case 'year':
          visibleDateRange.min = startOfYear(subYears(currentMin, 1));
          visibleDateRange.max = endOfYear(subYears(currentMax, 1));
          break;
      }
    }
    const min = visibleDateRange.min.getTime();
    const max = visibleDateRange.max.getTime();

    if (dataMin.getTime() < max && dataMax.getTime() > min) {
      this.setState({
        visibleObservations: this.getVisibleObservations(min, max),
        visibleChartSeries: this.getVisibleChartSeries(min, max),
        chartOptions: {
          ...this.state.chartOptions,
          xaxis: {
            ...this.state.chartOptions.xaxis,
            min,
            max,
          },
        },
      });
    }
  }

  public setSelectedObservationId(observationId: string): void {
    const visibleDateRange = this.getVisibleDateRange(
      this.state.zoomLevel,
      observationId,
    );
    const min = visibleDateRange.min.getTime();
    const max = visibleDateRange.max.getTime();
    this.setState({
      observationId,
      visibleObservations: this.getVisibleObservations(min, max),
      visibleChartSeries: this.getVisibleChartSeries(min, max),
      chartOptions: {
        ...this.state.chartOptions,
        xaxis: {
          ...this.state.chartOptions.xaxis,
          min,
          max,
        },
      },
    });
  }

  public setSelectedObservationIdToNone(): void {
    this.setState({ observationId: undefined });
  }

  public setSelectedDataPointIndex(selectedDataPoint: DataPoint[]): void {
    this.setState({ selectedDataPoints: selectedDataPoint });
  }

  public getSeriesAndDataPointIndex(observationId: string): DataPoint[] {
    const returnValue: DataPoint[] = [{ seriesIndex: -1, dataPointIndex: -1 }];

    this.state.chartOptions.series?.forEach((s, seriesIndex) => {
      const dataPointIndex = (s.data as ApexAxisChartSeriesData[])
        .map((d) => d.meta.resourceId)
        .indexOf(observationId);
      if (dataPointIndex > -1) {
        returnValue.push({ seriesIndex, dataPointIndex });
      }
    });
    return returnValue;
  }

  // Private methods
  private setSeriesAndFormatYAxis(series: ApexChartSeriesEntry[]): void {
    const yAxisDefault = this.state.chartOptions.yaxis?.[0];
    const yaxis: ApexYAxis[] = [];
    series.forEach((s, i) => {
      // Set decimals based on data range
      const decimalsInFloat =
        s.stats?.range && s.stats.range <= 2
          ? 2
          : s.stats?.range && s.stats.range <= 10
            ? 1
            : 0;
      const opposite = i === 0 ? true : false;
      const offsetX = i === 0 ? 38 : 30;
      const show =
        // show yaxis of first series if series[] length < 3 OR if all series units are equal
        i === 0 &&
        (series.length < 3 ||
          series.every(({ unit }) => unit === series[0].unit))
          ? true
          : // show yaxis of second series if series[] length < 3 AND if both series have different units
            i === 1 && series.length < 3 && series[0].unit !== s.unit
            ? true
            : false;

      // Apply series yaxis custom options and push to array
      // NOTE: the conditional push only works with a maximum of two yaxis, otherwise the yaxis could be assigned to
      // the wrong data series; e.g.: if thr chart has series A, B, and C and the yaxis has labels for A, and C, then
      // series B may have the labels of C assigmend
      if (show) {
        yaxis.push({
          ...yAxisDefault,
          decimalsInFloat,
          opposite,
          ...{ labels: { ...yAxisDefault?.labels, show, offsetX } },
        });
      }
    });

    // Set data from Observation[]
    this.setState({
      chartOptions: {
        ...this.state.chartOptions,
        series,
        yaxis,
      },
    });
  }

  private getObservationIdFromDataPointIndex(
    seriesIndex: number = -1,
    dataPointIndex: number = -1,
  ): string {
    if (dataPointIndex < 0) {
      return '';
    }
    // find observationId in series index
    const data = {
      ...(this.state.chartOptions.series?.[seriesIndex].data[
        dataPointIndex
      ] as ApexAxisChartSeriesData),
    };
    return data.meta.resourceId;
  }

  private getVisibleObservations(min: number, max: number): ObservationBundle {
    if (!min || !max) {
      throw new Error(`No min or max supplied to 'getVisibleObservations'.`);
    }
    // const data = this.state.chartOptions.series[0]
    //   .data as ApexAxisChartSeriesData[];

    const data = this.getReducedSeriesData(this.state.chartOptions.series);

    const observations = [
      ...(this.state.observationBundle?.observations || []),
    ];

    const visibleObservations = !arrayHasValue(observations)
      ? []
      : data
          .filter((d) => d.x > min && d.x < max)
          .map((d) => observations.find((o) => o.id === d.meta.resourceId))
          .filter((o): o is IObservation => o !== undefined);
    return buildObservationBundle(visibleObservations);
  }

  private getVisibleChartSeries(
    min: number,
    max: number,
  ): ApexChartSeriesEntry[] {
    const chartSeries = [...(this.state.chartOptions.series || [])];
    return chartSeries.map((cs) => ({
      ...cs,
      data: (cs.data as ApexAxisChartSeriesData[]).filter(
        (d) => d.x > min && d.x < max,
      ),
    })) as ApexChartSeriesEntry[];
  }

  private getReducedSeriesData(
    series: ApexAxisChartSeries | undefined,
  ): ApexAxisChartSeriesData[] {
    if (!series) {
      throw new Error(`No series supplied to 'getReducedSeriesData'.`);
    }
    const reducedSeries = series.reduce<ApexAxisChartSeriesData[]>(
      (acc, val) => {
        if (
          Array.isArray(val.data) &&
          isArrayOfApexAxisChartSeriesData(val.data)
        ) {
          return [...acc, ...val.data];
        }
        return acc;
      },
      [],
    );
    return reducedSeries;
  }

  private setXAxisWithAdaptedLabels(
    zoomLevel: ChartState['zoomLevel'],
  ): Partial<ApexXAxis> {
    const xaxis: { tickAmount?: number; format?: string } = {};

    switch (zoomLevel) {
      case 'day':
        xaxis.tickAmount = 12;
        xaxis.format = 'H';
        break;
      case 'week':
        xaxis.tickAmount = 7;
        xaxis.format = 'EEEEE';
        break;
      case 'month':
        xaxis.tickAmount = 5;
        xaxis.format = 'd';
        break;
      case 'year':
        xaxis.tickAmount = 13;
        xaxis.format = 'LLLLL';
        break;
      default:
        xaxis.tickAmount = undefined;
        xaxis.format = this.formatDefaultXaxisLabel();
    }
    return {
      tickAmount: xaxis.tickAmount,
      labels: {
        // FIXME: use of formatter shortens xaxis on right of screen
        formatter: (v) => format(new Date(v), xaxis.format || ''),
      },
    };
  }

  private getVisibleDateRange(
    zoomLevel: ChartState['zoomLevel'],
    observationId: string,
  ): VisibleDateRange {
    const xMin = this.state.chartOptions.xaxis?.min || 0;
    const xMax = this.state.chartOptions.xaxis?.max || 0;

    if (!this.xValues) {
      throw new Error(`No xValues supplied to 'getVisibleDateRange'.`);
    }
    const visibleXValues = this.xValues.filter(
      (x) => x.timestamp > xMin && x.timestamp < xMax,
    );

    // Set min and max timestamp based on: visible xValues, OR xaxis, OR xValues
    const min =
      visibleXValues[0]?.timestamp ||
      this.state.chartOptions.xaxis?.min ||
      this.xValues[0].timestamp;
    const max =
      visibleXValues.slice(-1)[0]?.timestamp ||
      this.state.chartOptions.xaxis?.max ||
      this.xValues[0].timestamp;

    // If observationId is given, i.e. a dataPoint is selected, set date to related timestamp, else
    // if min is same as max, use min as new date, else
    // set focus on center date if the two dates are different
    const timestamp =
      observationId && arrayHasValue(this.xValues)
        ? this.xValues.find((t) => t.resourceId === observationId)?.timestamp
        : undefined;
    const date = timestamp
      ? new Date(timestamp)
      : new Date(min === max ? min : (max - min) / 2 + min);

    const dateRange: VisibleDateRange = {
      // initialized with dummy values
      min: new Date(),
      max: new Date(),
    };
    switch (zoomLevel) {
      case 'day':
        dateRange.min = startOfDay(date);
        dateRange.max = addDays(dateRange.min, 1);
        break;
      case 'week':
        dateRange.min = isMonday(date) ? date : previousMonday(date);
        dateRange.max = isSunday(date) ? date : nextSunday(date);
        dateRange.min.setHours(12);
        dateRange.max.setHours(12);
        dateRange.min = subDays(dateRange.min, 1);
        break;
      case 'month':
        dateRange.min = startOfMonth(date);
        dateRange.max = endOfMonth(date);
        break;
      case 'year':
        dateRange.min = startOfYear(date);
        dateRange.max = endOfYear(date);
        break;
      default:
        dateRange.min = new Date(this.xValues[0].timestamp);
        dateRange.max = new Date(this.xValues.slice(-1)[0].timestamp);
        const diff = differenceInHours(dateRange.max, dateRange.min);
        if (isSameDay(dateRange.min, dateRange.max)) {
          dateRange.min = startOfDay(date);
          dateRange.max = addDays(dateRange.min, 1);
        }
        if (!isSameDay(dateRange.min, dateRange.max)) {
          dateRange.min = subHours(dateRange.min, diff * 0.2);
          dateRange.max = addHours(dateRange.max, diff * 0.2);
        }
    }
    return dateRange;
  }

  private formatDefaultXaxisLabel(): string {
    if (!this.xValues) {
      return '';
    }
    const min = new Date(this.xValues[0].timestamp);
    const max = new Date(this.xValues.slice(-1)[0].timestamp);
    const diff = differenceInDays(max, min);

    return differenceInDays(max, min) < 1
      ? 'H'
      : differenceInWeeks(max, min) < 1
        ? 'EEEEE'
        : differenceInMonths(max, min) < 1
          ? 'd'
          : differenceInYears(max, min) < 1
            ? 'LLL'
            : differenceInYears(max, min) < 3
              ? `LLL ''yy`
              : 'Y';
  }
}
