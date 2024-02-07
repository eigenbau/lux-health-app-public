import { Pipe, PipeTransform } from '@angular/core';
import { arrayHasValue } from '@core/utils/object-functions';
import { ApexChartSeriesEntry } from '@models/apexcharts.model';

@Pipe({
  name: 'apexchartsSeriesValue',
  standalone: true,
})
export class ApexchartsSeriesValuePipe implements PipeTransform {
  transform(
    series: ApexChartSeriesEntry | undefined,
    selectedResourceId: string | undefined,
  ): string | number {
    const defaultValue = '-';
    if (!arrayHasValue(series?.data)) {
      return defaultValue;
    }
    if (!selectedResourceId && series && arrayHasValue(series.data)) {
      const min = Math.min(...series.data.map((d) => d.y));
      const max = Math.max(...series.data.map((d) => d.y));
      return min !== max ? `${min} to ${max}` : min;
    }
    if (selectedResourceId) {
      const selectedValue = series?.data.find(
        (d) => d.meta.resourceId === selectedResourceId,
      );
      return selectedValue ? selectedValue.y : defaultValue;
    }
    return defaultValue;
  }
}
