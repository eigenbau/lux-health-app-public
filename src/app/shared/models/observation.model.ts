import { CodeableConcept } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/codeableConcept';
import { IObservation } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IObservation';
import { FirestoreDoc } from './firestore-doc.model';
import { ValueGroup } from './value-x.model';

export type ObservationTemplate = FirestoreDoc & IObservation;

export interface ObservationWithIndex extends IObservation {
  index: number;
}

export interface ObservationTemplateWithIndex extends ObservationTemplate {
  index: number;
}

export type ObservationRootType =
  | IObservation
  | ObservationTemplate
  | ObservationWithIndex
  | ObservationTemplateWithIndex;

export interface ObservationBundle {
  index?: number;
  total: number;
  code?: CodeableConcept;
  category?: CodeableConcept[];
  values?: ValueGroup[];
  observations?: ObservationRootType[];
}

export interface ObservationsByCategory<
  T extends ObservationRootType | ObservationBundle =
    | ObservationRootType
    | ObservationBundle,
> {
  code?: CodeableConcept;
  observations?: T[];
}

export interface ObservationFilter {
  searchInput: string | undefined | null;
  category: CodeableConcept[];
}

export interface ObservationByBodySite {
  observations: ObservationRootType[];
  bodySite: CodeableConcept;
}
