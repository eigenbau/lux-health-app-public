import { ChartOptions } from '@models/apexcharts.model';

export const chartOptions: Partial<ChartOptions> = {
  plotOptions: {},
  chart: {
    zoom: {
      enabled: false,
    },
    redrawOnParentResize: true,
    type: 'line',
    toolbar: {
      show: false,
    },
    animations: {
      easing: 'easein',
      speed: 100,
      dynamicAnimation: {
        enabled: true,
        speed: 200,
      },
    },
  },
  grid: {
    padding: {
      left: 0,
      right: 0,
    },
  },
  stroke: {
    curve: 'straight',
    lineCap: 'round',
    width: 4,
  },
  xaxis: {
    offsetY: -4,
    type: 'numeric',
    tooltip: {
      enabled: false,
    },
    axisBorder: {
      show: false,
    },
    labels: {
      hideOverlappingLabels: true,
      showDuplicates: false,
      trim: true,
    },
    axisTicks: {
      show: false,
    },
    crosshairs: {
      // required and styled in global.css
      show: true,
      width: 4,
      position: 'back',
      stroke: {
        width: 0,
      },
      fill: {
        type: 'solid',
        color: 'white',
      },
    },
  },
  yaxis: [
    {
      tickAmount: 3,
      opposite: true,
      forceNiceScale: true,
      floating: true,
      decimalsInFloat: 0,
      labels: {
        offsetX: 48,
        offsetY: -8,
        align: 'right',
        show: false,
      },
    },
  ],
  // affects marker selection - do not change, as it interrupts sync of marker selection and
  // parent observationId value
  tooltip: {
    enabled: true,
    shared: false,
    intersect: false,
  },
  markers: {
    size: 3,
    fillOpacity: 1,
    strokeOpacity: 1,
    strokeWidth: 2,
  },
  legend: { show: false },
  states: {
    active: {
      // affects marker selection - do not change, as it will break marker selection methods,
      // preventing markers of multiple series to be selected together
      allowMultipleDataPointsSelection: true,
      filter: {
        type: 'none',
        value: 0,
      },
    },
  },
};
