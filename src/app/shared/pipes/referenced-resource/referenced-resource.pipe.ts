/*
This pipe can be used to get resources that are referenced in a given resource
It takes a Reference | Reference[], and a ResourceType as input;
It returns a strong typed Resource | Resource[], depending on the input;
If the input Reference is an array, it returns a Resource array
*/

import { Pipe, PipeTransform } from '@angular/core';
import { Reference } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/reference';
import { Resource } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/resource';
import { ICarePlan } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/ICarePlan';
import { ICondition } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/ICondition';
import { IDocumentReference } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IDocumentReference';
import { IEncounter } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IEncounter';
import { IGoal } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IGoal';
import { IObservation } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IObservation';
import { IProcedure } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IProcedure';
import { combineLatest, map, Observable } from 'rxjs';
import { PatientCarePlanStateService } from '@core/state/patient-care-plan-state.service';
import { PatientConditionStateService } from '@core/state/patient-condition-state.service';
import { PatientDocumentReferenceStateService } from '@core/state/patient-document-reference-state.service';
import { PatientEncounterStateService } from '@core/state/patient-encounter-state.service';
import { PatientGoalStateService } from '@core/state/patient-goal-state.service';
import { PatientObservationStateService } from '@core/state/patient-observation-state.service';
import { PatientProcedureStateService } from '@core/state/patient-procedure-state.service';
import { getReferencedResource } from '@core/utils/fhir/resource-functions';
import { ResourceString } from '@models/resources.model';

type OutputResource<T extends ResourceString> = T extends 'ICondition'
  ? ICondition
  : T extends 'IGoal'
    ? IGoal
    : T extends 'ICarePlan'
      ? ICarePlan
      : T extends 'IEncounter'
        ? IEncounter
        : T extends 'IProcedure'
          ? IProcedure
          : T extends 'IDocumentReference'
            ? IDocumentReference
            : T extends 'IObservation'
              ? IObservation
              : Resource;

type Output<
  R extends Reference | Reference[],
  T extends ResourceString,
> = R extends Reference ? OutputResource<T> : OutputResource<T>[];

@Pipe({
  name: 'referencedResource',
  standalone: true,
})
export class ReferencedResourcePipe implements PipeTransform {
  constructor(
    private conditionState: PatientConditionStateService,
    private goalState: PatientGoalStateService,
    private carePlanState: PatientCarePlanStateService,
    private encounterState: PatientEncounterStateService,
    private procedureState: PatientProcedureStateService,
    private documentReferenceState: PatientDocumentReferenceStateService,
    private observationState: PatientObservationStateService,
  ) {}
  transform<T extends ResourceString, R extends Reference | Reference[]>(
    reference: R | undefined,
    resourceType: T,
  ): Observable<Output<R, T>> {
    const resource$ = combineLatest([
      this.conditionState.conditionList$,
      this.goalState.goalList$,
      this.carePlanState.carePlanList$,
      this.encounterState.encounterList$,
      this.procedureState.procedureList$,
      this.documentReferenceState.documentReferenceList$,
      this.observationState.observationList$,
    ]).pipe(
      map(
        ([
          conditions,
          goals,
          carePlans,
          encounters,
          procedures,
          documentReferences,
          observations,
        ]) => {
          switch (resourceType) {
            case 'ICondition':
              return conditions;
            case 'IGoal':
              return goals;
            case 'ICarePlan':
              return carePlans;
            case 'IEncounter':
              return encounters;
            case 'IProcedure':
              return procedures;
            case 'IDocumentReference':
              return documentReferences;
            case 'IObservation':
              return observations;
            default:
              return [];
          }
        },
      ),
      map((list) => {
        if (!reference) {
          throw new Error('No reference supplied to ReferencedResourcePipe');
        }
        if (!Array.isArray(reference)) {
          return getReferencedResource(
            reference?.reference,
            list as OutputResource<T>[],
          );
        }
        return reference
          .map((ref) =>
            getReferencedResource(ref?.reference, list as OutputResource<T>[]),
          )
          .filter((l) => !!l);
      }),
    );

    return resource$ as Observable<Output<R, T>>;
  }
}
