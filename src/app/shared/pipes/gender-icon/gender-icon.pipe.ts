import { Pipe, PipeTransform } from '@angular/core';
import { IPatient } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPatient';
import { IPerson } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPerson';
import { IPractitioner } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPractitioner';
import { IRelatedPerson } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IRelatedPerson';

@Pipe({
  name: 'genderIcon',
  standalone: true,
})
export class GenderIconPipe implements PipeTransform {
  transform(
    resource:
      | IPerson
      | IPatient
      | IRelatedPerson
      | IPractitioner
      | undefined
      | null,
  ): 'female-outline' | 'male-outline' | 'male-female-outline' {
    return resource?.gender === 'female'
      ? 'female-outline'
      : resource?.gender === 'male'
        ? 'male-outline'
        : 'male-female-outline';
  }
}
