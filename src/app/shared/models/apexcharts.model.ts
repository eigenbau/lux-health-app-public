import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexStroke,
  ApexTooltip,
  ApexDataLabels,
  ApexStates,
  ApexMarkers,
  ApexLegend,
  ApexGrid,
  ApexFill,
  ApexPlotOptions,
} from 'ng-apexcharts';
import { ValueStats } from './value-x.model';

export type ChartOptions = {
  plotOptions: ApexPlotOptions;
  colors: string[];
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis[];
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  states: ApexStates;
  markers: ApexMarkers;
  legend: ApexLegend;
  grid: ApexGrid;
  fill: ApexFill;
};

export interface ApexChartSeriesEntry {
  code?: string;
  bodySite?: string;
  unit?: string;
  stats?: ValueStats;
  name: string;
  data: ApexAxisChartSeriesData[];
}

export interface ApexAxisChartSeriesData {
  x: any;
  y: any;
  fillColor?: string;
  strokeColor?: string;
  goals?: any;
  meta: {
    resourceId: string;
  };
}
