import { Pipe, PipeTransform } from '@angular/core';
import { IObservation } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IObservation';
import { getValueXArray } from '@core/utils/fhir/value-x-functions';
import { ValueX } from '@models/value-x.model';

@Pipe({
  name: 'valueXArray',
  standalone: true,
})
export class ValueXArrayPipe implements PipeTransform {
  transform(observation: IObservation | undefined | null): ValueX[] {
    if (!observation) {
      return [];
    }
    return getValueXArray(observation);
  }
}
