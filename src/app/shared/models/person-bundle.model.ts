import { IPatient } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPatient';
import { IPerson } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPerson';
import { IPractitioner } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPractitioner';
import { IRelatedPerson } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IRelatedPerson';
import { PersonResourceType } from './person-resource-type.model';

export interface PersonBundle {
  person: IPerson;
  patient?: IPatient;
  practitioner?: IPractitioner;
  relatedPerson?: IRelatedPerson[];
}

export interface PersonRoles {
  patient: boolean;
  relatedPerson: boolean;
  practitioner: boolean;
}

export interface PersonBundleChildResource {
  resourceType: PersonResourceType;
  id: string;
  person: IPerson;
}
