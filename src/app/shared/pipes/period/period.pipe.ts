import { Pipe, PipeTransform } from '@angular/core';
import { Period } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/period';
import { format, formatISO } from 'date-fns';
import { distanceToNow } from '@core/utils/date-number-functions';
import { periodDurationInMinutes } from '@core/utils/fhir/resource-functions';
import { capitalize } from '@core/utils/string-functions';

@Pipe({
  name: 'period',
  standalone: true,
})
export class PeriodPipe implements PipeTransform {
  transform(
    period: Period | undefined | null,
    details?:
      | 'when'
      | 'duration'
      | 'durationInt'
      | 'distanceToNow'
      | 'time'
      | 'date',
  ): string {
    if (!period || !period.start || !period.end) {
      return '';
    }
    const start = new Date(period.start);
    const end = new Date(period.end);
    // const startDate = `${doubleDigit(start.getDate())}.${doubleDigit(
    //   start.getMonth() + 1
    // )}.${start.getFullYear()}`;
    const startDateDistanceToNow = capitalize(distanceToNow(formatISO(start)));
    const startDateFormatted = format(start, 'd MMM y');
    const startTime = format(start, 'h:mm a');
    const durationInMinutes = periodDurationInMinutes(period);
    return details === 'when'
      ? `${startDateDistanceToNow} at ${startTime}`
      : details === 'duration'
        ? `${durationInMinutes} minutes`
        : details === 'durationInt'
          ? `${durationInMinutes}`
          : details === 'date'
            ? startDateFormatted
            : details === 'distanceToNow'
              ? startDateDistanceToNow
              : details === 'time'
                ? startTime
                : `${startDateDistanceToNow} • ${startTime} • ${durationInMinutes} minutes`;
  }
}
