import { ObservationComponent } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/observationComponent';
import { IObservation } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IObservation';
import { ObservationTemplate } from './observation.model';

export interface ValueX {
  // retire
  value: number | string;
  code?: string;
  unit?: string;
  componentCodeDisplay?: string;
}

export type ValueXArray = ValueX[]; // retire

export interface ValueXStats {
  // retire
  latest?: ValueX[];
  min?: ValueX[];
  max?: ValueX[];
}

export type ResourceWithValueX =  // rename
  | IObservation
  | ObservationTemplate
  | ObservationComponent;

export type ValueKey =
  | 'valueCodeableConcept'
  | 'valueInteger'
  | 'valueQuantity'
  | 'valueString'
  | 'valueString';

export interface ValueObject {
  value: string | number;
  datetime?: Date | string | number;
  referenceId?: string;
}

export interface ValueStats {
  min: ValueObject;
  max: ValueObject;
  mean: ValueObject;
  first: ValueObject;
  last: ValueObject;
  range: number;
  count: number;
}

export interface ValueGroup {
  series: ValueObject[];
  type: 'string' | 'number';
  code?: string;
  bodySite?: string;
  unit?: string;
  isHomongeneous: boolean;
  codeDisplay?: string;
  stats: ValueStats;
}
