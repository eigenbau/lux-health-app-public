import { Pipe, PipeTransform } from '@angular/core';
import { formatISO, parseISO } from 'date-fns';
import { distanceToNow } from '@core/utils/date-number-functions';

@Pipe({
  name: 'distanceToNow',
  standalone: true,
})
export class DistanceToNowPipe implements PipeTransform {
  transform(value: Date | string | number | undefined | null): string {
    if (!value) return '';
    const date =
      typeof value === 'number'
        ? new Date(value)
        : typeof value === 'string'
          ? parseISO(value)
          : value;
    return value ? distanceToNow(formatISO(date)) : '';
  }
}
