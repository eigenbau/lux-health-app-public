import { Pipe, PipeTransform } from '@angular/core';
import { IObservation } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IObservation';
import { getValueSummary } from '@core/utils/fhir/value-x-functions';

@Pipe({
  name: 'valueX',
  standalone: true,
})
export class ValueXPipe implements PipeTransform {
  transform(observation: IObservation | undefined | null): string {
    return getValueSummary(observation);
  }
}
