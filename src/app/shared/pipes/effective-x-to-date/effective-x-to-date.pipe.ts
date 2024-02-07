import { Pipe, PipeTransform } from '@angular/core';
import { IObservation } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IObservation';
import { getTimeOfObservation } from '@core/utils/fhir/observation-functions';

@Pipe({
  name: 'effectiveXToDate',
  standalone: true,
})
export class EffectiveXToDatePipe implements PipeTransform {
  transform(resourceWithEffectiveX: IObservation | undefined | null): string {
    return getTimeOfObservation(resourceWithEffectiveX);
  }
}
