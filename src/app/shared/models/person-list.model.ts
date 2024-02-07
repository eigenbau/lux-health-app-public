import { IRelatedPerson } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IRelatedPerson';
import { IPractitioner } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPractitioner';
import { IPatient } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPatient';

export interface PersonListEntry {
  rootPersonResourceId?: string;
  resource: IPatient | IRelatedPerson | IPractitioner;
}
export type PersonList = PersonListEntry[];
