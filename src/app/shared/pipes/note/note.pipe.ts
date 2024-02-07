import { Pipe, PipeTransform } from '@angular/core';
import { IObservation } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IObservation';
import { getNotes } from '@core/utils/fhir/observation-functions';

@Pipe({
  name: 'note',
  standalone: true,
})
export class NotePipe implements PipeTransform {
  transform(observation: IObservation | undefined | null): string {
    return getNotes(observation);
  }
}
