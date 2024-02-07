import { Params } from '@angular/router';
import { ValueSetContains } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/valueSetContains';

export interface ValueSetConfig {
  valueSet?: string;
  valueSetCustomName?: Lowercase<string>; // Used to generate custom ValueSets that are stored in the Firestore user collections
  params?: Params;
  ecl?: string;
  source?: 'local' | 'terminology-server';
}

export interface UserCustomValueSets {
  [key: string]: ValueSetContains[];
}
