import { ChartOptions } from '@models/apexcharts.model';

export const chartOptions: Partial<ChartOptions> = {
  chart: {
    redrawOnParentResize: true,
    type: 'line',
    sparkline: {
      enabled: true,
    },
    // dropShadow: {
    //   enabled: true,
    //   enabledOnSeries: undefined,
    //   top: 2,
    //   left: 0,
    //   blur: 2,
    //   color: '#000',
    //   opacity: 0.35,
    // },
    animations: {
      easing: 'easein',
      speed: 100,
      dynamicAnimation: {
        enabled: true,
        speed: 200,
      },
    },
  },
  stroke: {
    curve: 'straight',
    lineCap: 'round',
    width: 4,
  },
  fill: {
    // FIXME: add dynamic color functionality
    // colors: ['red', 'blue'],
    type: 'gradient',
    gradient: {
      shadeIntensity: 0.5,
      opacityFrom: 0,
      opacityTo: 0.5,
      stops: [0, 75, 100],
    },
  },
  xaxis: {
    type: 'datetime',
    min: 5,
    max: 160,
  },
  markers: {
    size: 0,
    fillOpacity: 0,
    strokeOpacity: 0,
    strokeWidth: 0,
  },
  grid: {
    padding: {
      top: 8,
      bottom: 8,
      left: 2,
      right: 2,
    },
  },
};
