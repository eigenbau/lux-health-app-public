import { Pipe, PipeTransform } from '@angular/core';
import { CodeableConcept } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/codeableConcept';
import { formatBodySite } from '@core/utils/fhir/resource-functions';

@Pipe({
  name: 'bodySite',
  standalone: true,
})
export class BodySitePipe implements PipeTransform {
  transform(bodySite: CodeableConcept | string | undefined | null): string {
    return formatBodySite(bodySite);
  }
}
