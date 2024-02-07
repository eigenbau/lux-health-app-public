import { Pipe, PipeTransform } from '@angular/core';
import { Reference } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/reference';
import { getReferencedResourceType } from '@core/utils/fhir/resource-functions';

@Pipe({
  name: 'referencedResourceType',
})
export class ReferencedResourceTypePipe implements PipeTransform {
  transform(reference: Reference['reference']): string {
    return getReferencedResourceType(reference);
  }
}
