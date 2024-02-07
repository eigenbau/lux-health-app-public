import { ApexAxisChartSeries } from 'ng-apexcharts';
import { ValueGroup } from '@models/value-x.model';
import {
  ApexAxisChartSeriesData,
  ApexChartSeriesEntry,
} from '@models/apexcharts.model';
import { arrayHasValue } from './object-functions';

export const convertValueGroupsToSeries = (
  valueGroups: ValueGroup[] | undefined,
): ApexAxisChartSeries => {
  const series: ApexAxisChartSeries = [];
  if (!arrayHasValue(valueGroups)) {
    throw new Error(`No valueGroups supplied to 'convertValueGroupsToSeries'.`);
  }
  valueGroups.forEach((vg) => {
    if (vg.isHomongeneous && vg.type === 'number') {
      series.push(buildSeriesFromValueGroup(vg));
    }
  });
  return series;
};

const buildSeriesFromValueGroup = (
  valueGroup: ValueGroup,
): ApexAxisChartSeries[number] => {
  const series: ApexChartSeriesEntry = {
    name: valueGroup.codeDisplay || '',
    bodySite: valueGroup?.bodySite,
    code: valueGroup.code,
    unit: valueGroup?.unit,
    stats: valueGroup?.stats,
    data: valueGroup.series.map((valueObject) => {
      const datetime = valueObject?.datetime ? +valueObject?.datetime : 0;
      return {
        x: datetime,
        y: +valueObject.value,
        meta: { resourceId: valueObject.referenceId || '' },
      };
    }),
  };
  // Arrange dates in cronological order
  series.data.sort((a, b) => a.x - b.x);
  return series;
};

export const isApexAxisChartSeriesData = (
  obj: unknown,
): obj is ApexAxisChartSeriesData => {
  if (typeof obj === 'object' && obj !== null) {
    const asData = obj as ApexAxisChartSeriesData;
    return (
      'x' in asData &&
      'y' in asData &&
      'meta' in asData &&
      typeof asData.meta === 'object' &&
      asData.meta !== null &&
      'resourceId' in asData.meta &&
      typeof asData.meta.resourceId === 'string'
    );
  }
  return false;
};

export const isArrayOfApexAxisChartSeriesData = (
  obj: unknown,
): obj is ApexAxisChartSeriesData[] => {
  if (Array.isArray(obj)) {
    return obj.every((item) => isApexAxisChartSeriesData(item));
  }
  return false;
};
