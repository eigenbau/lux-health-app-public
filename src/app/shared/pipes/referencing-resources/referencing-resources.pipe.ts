/*
This pipe can be used to get resources that reference the given resource
It takes referencedResource, a ResourceType, and a referencePath as input;
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
import { ResourceString, ResourceType } from '@models/resources.model';
import { arrayHasValue, isObject } from '@core/utils/object-functions';

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

@Pipe({
  name: 'referencingResources',
  standalone: true,
})
export class ReferencingResourcesPipe implements PipeTransform {
  constructor(
    private conditionState: PatientConditionStateService,
    private goalState: PatientGoalStateService,
    private carePlanState: PatientCarePlanStateService,
    private encounterState: PatientEncounterStateService,
    private procedureState: PatientProcedureStateService,
    private documentReferenceState: PatientDocumentReferenceStateService,
    private observationState: PatientObservationStateService,
  ) {}

  transform<T extends ResourceString>(
    referencedResource: ResourceType,
    resourceType: T,
    referencePath: string[] | undefined | null,
  ): Observable<OutputResource<T>[]> {
    if (!arrayHasValue(referencePath))
      throw new Error(
        'ReferencingResourcesPipe: referencePath is undefined or null',
      );
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
      map(
        (list) =>
          (list as ResourceType[])?.filter((resource) => {
            const refsArray = this.getReferenceArray(referencePath, resource);
            return refsArray?.some(
              (ref) =>
                ref?.reference &&
                referencedResource.id &&
                ref?.reference?.indexOf(referencedResource.id) > -1,
            );
          }) as OutputResource<T>[],
      ),
    );

    return resource$;
  }

  // Private methods
  private getReferenceArray(
    referencePath: (string | number)[],
    resource: ResourceType,
  ): Reference[] {
    const references: Reference[] = [];

    const getReferenceRecursion = (
      path: (string | number)[],
      object: { [key: string]: any },
    ): void => {
      if (!isObject(object) || !arrayHasValue(path)) {
        return;
      }

      const [head, ...rest] = path;

      if (!rest.length) {
        // Reached end of path
        // Push to output - NOTE: pushed value can either be of type Reference[] || Reference
        const refs: Reference[] = Array.isArray(object[head])
          ? [...object[head]]
          : [object[head]];
        references.push(...refs);
        return;
      }

      // If Object is array, traverse each array entry
      if (Array.isArray(object[head])) {
        object[head].forEach((item: any) => {
          getReferenceRecursion(rest, item);
        });
      }
      // Else continue to traverse single path
      if (!Array.isArray(object[head])) {
        getReferenceRecursion(rest, object[head]);
      }
    };

    getReferenceRecursion(referencePath, resource);

    return references;
  }
}
