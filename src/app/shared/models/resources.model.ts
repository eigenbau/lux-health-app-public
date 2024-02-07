import { ICarePlan } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/ICarePlan';
import { ICondition } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/ICondition';
import { IDocumentReference } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IDocumentReference';
import { IEncounter } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IEncounter';
import { IGoal } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IGoal';
import { IObservation } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IObservation';
import { IPerson } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPerson';
import { IPractitioner } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPractitioner';
import { IProcedure } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IProcedure';
import { IRelatedPerson } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IRelatedPerson';

export type ResourceType =
  | IPerson
  | IRelatedPerson
  | IPractitioner
  | ICondition
  | IGoal
  | ICarePlan
  | IEncounter
  | IProcedure
  | IDocumentReference
  | IObservation;

export type ResourceString =
  | 'ICondition'
  | 'IGoal'
  | 'ICarePlan'
  | 'IEncounter'
  | 'IProcedure'
  | 'IDocumentReference'
  | 'IObservation';
