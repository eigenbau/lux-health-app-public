import { Pipe, PipeTransform } from '@angular/core';
import { IPatient } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPatient';
import { IPerson } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPerson';
import { IPractitioner } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPractitioner';
import { IRelatedPerson } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IRelatedPerson';
import { getName } from '@core/utils/fhir/person-functions';

@Pipe({
  name: 'name',
  standalone: true,
})
export class NamePipe implements PipeTransform {
  transform(
    resource:
      | IPerson
      | IPatient
      | IRelatedPerson
      | IPractitioner
      | undefined
      | null,
    displayPrefix?: 'prefix',
  ): string {
    return resource ? getName(resource, displayPrefix) : '';
  }
}
