import { Pipe, PipeTransform } from '@angular/core';
import { Reference } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/reference';
import { getIdFromReference } from '@core/utils/fhir/resource-functions';

@Pipe({
  name: 'id',
  standalone: true,
})
export class IdPipe implements PipeTransform {
  transform(reference: Reference['reference'] | undefined | null): string {
    if (!reference) throw new Error('Reference in IdPipe is undefined or null');
    return getIdFromReference(reference);
  }
}
