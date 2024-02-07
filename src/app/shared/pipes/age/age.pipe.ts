import { Pipe, PipeTransform } from '@angular/core';
import { IPatient } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPatient';
import { IPerson } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPerson';
import { IPractitioner } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPractitioner';
import { IRelatedPerson } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IRelatedPerson';
import { getAge } from '@core/utils/fhir/person-functions';

@Pipe({
  name: 'age',
  standalone: true,
})
export class AgePipe implements PipeTransform {
  transform(
    resource:
      | IPerson
      | IPatient
      | IRelatedPerson
      | IPractitioner
      | undefined
      | null,
  ): number {
    return getAge(resource);
  }
}
