import { Pipe, PipeTransform } from '@angular/core';
import { isSameDay } from 'date-fns';
import { th } from 'date-fns/locale';

@Pipe({
  name: 'isSameDay',
  standalone: true,
})
export class IsSameDayPipe implements PipeTransform {
  transform(
    value: Date | string | number | undefined | null,
    comparisonValue: Date | string | number | undefined | null,
  ): boolean {
    const date =
      typeof value === 'number'
        ? new Date(value)
        : typeof value === 'string'
          ? new Date(value)
          : value;
    const comparison =
      typeof comparisonValue === 'number'
        ? new Date(comparisonValue)
        : typeof comparisonValue === 'string'
          ? new Date(comparisonValue)
          : comparisonValue;
    if (!date || !comparison)
      throw new Error('IsSameDayPipe: date or comparison is null or undefined');
    return isSameDay(date, comparison);
  }
}
