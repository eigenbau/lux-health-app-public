import { CodeableConcept } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/codeableConcept';
import { ObservationComponent } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/observationComponent';
import { IObservation } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IObservation';
import { formatISO } from 'date-fns';
import {
  ObservationBundle,
  ObservationByBodySite,
  ObservationFilter,
  ObservationRootType,
  ObservationsByCategory,
  ObservationTemplate,
} from '@models/observation.model';
import { environment } from 'src/environments/environment';
import {
  arrayHasValue,
  filterByString,
  isObject,
  sortByString,
} from '../object-functions';
import {
  codeableConceptsMatch,
  filterByCodeableConcept,
  hasCodeableConcept,
  reduceToUniqueCodes,
} from './codeable-concept-functions';
import { buildValueGroupArray, getValueType } from './value-x-functions';
import { ValueKey } from '@models/value-x.model';

export const getNotes = (
  observation: IObservation | undefined | null,
): string => {
  if (!observation?.note) {
    return '';
  }
  if (observation.note.length <= 0) {
    return '';
  }
  const notes: string[] = [];
  observation.note.forEach((n) => {
    if (n?.text) {
      notes.push(n.text);
    }
  });
  return notes.filter(Boolean).join(' \n\n');
};

export const getTimeOfObservation = (
  observation: IObservation | undefined | null,
): string => {
  if (!observation) return '';
  const time = observation.effectiveDateTime
    ? new Date(observation.effectiveDateTime).getTime()
    : observation.effectiveInstant
      ? new Date(observation.effectiveInstant).getTime()
      : observation.effectivePeriod &&
          observation.effectivePeriod.start &&
          observation.effectivePeriod.end // return median of time period
        ? new Date(observation.effectivePeriod.start).getTime() +
          (new Date(observation.effectivePeriod.end).getTime() -
            new Date(observation.effectivePeriod.start).getTime()) /
            2
        : undefined;

  if (!time) {
    if (!environment.production) {
      console.error('Could not find readable effective[x] in observation.');
    }
    return '';
  }
  return formatISO(new Date(time));
};

export const templateFromObservation = (
  observation: IObservation,
): IObservation => {
  const template: Record<string, any> = { ...observation };
  const keys = ['id', 'effectiveDateTime', 'effectivePeriod'];

  keys.forEach((key) => {
    if (key in template) {
      delete template[key];
    }
  });
  return template as IObservation;
};

export const buildObservationBundle = (
  observations: IObservation[] | undefined,
  code: string = '',
): ObservationBundle => {
  const bundle: ObservationBundle = {
    total: 0,
    observations: [],
  };
  if (!arrayHasValue(observations)) {
    return bundle;
  }
  if (!code) {
    code = observations?.[0]?.code?.coding?.[0].code ?? '';
  }

  const filteredObservations: IObservation[] = observations.filter(
    (o) => o.code.coding?.[0].code === code,
  );

  if (!arrayHasValue(filteredObservations)) {
    return bundle;
  }

  const values = buildValueGroupArray(filteredObservations);

  bundle.values = values;
  bundle.code = filteredObservations[0]?.code;
  bundle.category = filteredObservations[0]?.category;
  bundle.total = filteredObservations.length;
  bundle.observations = filteredObservations;

  return bundle;
};

export const buildCategories = <
  T extends IObservation | ObservationBundle = IObservation,
>(
  observations: T[],
): ObservationsByCategory<T>[] => {
  if (!observations) {
    return [];
  }

  const observationsWithIndex: T[] = observations.map((o, i) => ({
    ...o,
    index: i,
  }));

  const defaultCategory: CodeableConcept[] = [
    { coding: [{ display: 'Miscellaneous', code: 'miscellaneous' }] },
  ];

  observations.map((observation) => {
    if (!observation?.category) {
      observation.category = [...defaultCategory];
    }
    return observation;
  });

  const observationsByCategories: ObservationsByCategory<T>[] = [];
  const categoryCodes = getUniqueCategoryCodes(observations);
  categoryCodes.forEach((code) => {
    observationsByCategories.push({
      code,
      observations: getObservationsOfCategory(observationsWithIndex, code),
    });
  });
  const sortedObservationsByCategories = sortByString(
    observationsByCategories,
    ['code', 'coding', 0, 'display'],
  );
  return sortedObservationsByCategories;
};

export const filterObservations = (
  observations: IObservation[] | ObservationTemplate[],
  filter: ObservationFilter,
): IObservation[] | ObservationTemplate[] => {
  const { searchInput = '', category = [] } = filter;

  if (observations.length < 1) {
    return [];
  }
  const filteredList = filterByString(
    observations,
    ['code', 'coding', 0, 'display'],
    searchInput,
  );
  if (category.length > 0) {
    const filteredListByCategories = filterByCodeableConcept(
      filteredList,
      ['category', 0],
      category,
    );
    return filteredListByCategories;
  }
  return filteredList;
};

export const reduceToUniqueObservations = (
  observations: IObservation[],
): IObservation[] => {
  if (!observations || observations.length < 1) {
    return [];
  }
  const reducedObservations: IObservation[] = observations.reduce(
    (uniqueObservations: IObservation[], newObservation) => {
      const uniqueCodes = uniqueObservations.map(
        (observation) => observation.code,
      );
      return hasCodeableConcept(uniqueCodes, newObservation.code)
        ? uniqueObservations
        : [...uniqueObservations, newObservation];
    },
    [],
  );
  return reducedObservations;
};

export const orderObservationComponent = (
  observation: IObservation,
): IObservation => {
  if (!isObject(observation)) {
    return observation;
  }
  if (!arrayHasValue(observation?.component)) {
    return observation;
  }

  return {
    ...observation,
    component: sortByString(observation.component || [], [
      'code',
      'coding',
      0,
      'code',
    ]),
  };
};

export const groupObservationsByBodySite = (
  observations: ObservationRootType[],
): ObservationByBodySite[] => {
  if (!arrayHasValue(observations)) {
    return [];
  }
  const bodySiteArray: CodeableConcept[] = observations
    .map((o) => o?.bodySite)
    .filter(Boolean) as CodeableConcept[];
  const bodySites: CodeableConcept[] = bodySiteArray.reduce(
    (nextBodySites: CodeableConcept[], newBodySite) =>
      !newBodySite || hasCodeableConcept(nextBodySites, newBodySite)
        ? nextBodySites
        : [...nextBodySites, newBodySite],
    [],
  );
  if (!arrayHasValue(bodySites)) {
    return [
      {
        bodySite: {},
        observations,
      },
    ];
  }
  const observationsByBodySite = bodySites.map((bodySite) => ({
    bodySite,
    observations: observations.filter(
      (o) =>
        codeableConceptsMatch(o?.bodySite || {}, bodySite) ||
        (!o?.bodySite && !bodySite),
    ),
  }));
  return observationsByBodySite;
};

export const isQuantitative = (
  valueSource:
    | IObservation
    | ObservationComponent
    | (IObservation | ObservationComponent)[],
): boolean => {
  const quantitativeValueX = ['valueQuantity', 'valueInteger'];
  if (quantitativeValueX.indexOf(getValueType(valueSource) ?? '') > -1) {
    return true;
  }
  return false;
};

export const isQuantitativeObservation = (
  observation: IObservation[],
): boolean => {
  if (!arrayHasValue(observation)) {
    return false;
  }
  if (isQuantitative(observation)) {
    return true;
  }
  if (!arrayHasValue(observation[0].component)) {
    return false;
  }
  return observation?.[0]?.component?.some((c) => isQuantitative(c)) || false;
};

export const codeAndValueXAreHomogenious = (
  valueSources: (IObservation | ObservationComponent)[],
): boolean => {
  if (!arrayHasValue(valueSources)) {
    return false;
  }
  const codes = valueSources
    .map((vs) => {
      // Check if vs.code and vs.code.coding[0] are defined
      if (vs?.code?.coding?.[0].code && vs?.code?.coding?.[0].system) {
        return vs.code.coding[0].code + vs.code.coding[0].system;
      }
      return '';
    })
    .filter(Boolean);

  const valueXArray = valueSources
    .map((vs) => getValueType(vs))
    .filter((vs): vs is ValueKey => !!vs);
  // Check if all codes are equal and all ValueX types are equal
  if (
    codes.every((c) => c === codes[0]) &&
    valueXArray.every((v) => v === valueXArray[0])
  ) {
    return true;
  }
  return false;
};

// Private functions
const getObservationsOfCategory = <
  T extends IObservation | ObservationBundle = IObservation,
>(
  observations: T[],
  categoryCode: CodeableConcept,
): ObservationsByCategory<T>['observations'] => {
  const observationsOfCategory = observations.filter(
    (observation) =>
      observation.category?.some((resourceCategory) =>
        codeableConceptsMatch(resourceCategory, categoryCode),
      ),
  );
  const sortedObservationsOfCategory = sortByString(observationsOfCategory, [
    'code',
    'coding',
    0,
    'display',
  ]);
  return sortedObservationsOfCategory;
};

const getUniqueCategoryCodes = (
  observations: (IObservation | ObservationBundle)[],
): CodeableConcept[] => {
  if (observations.length < 1) {
    return [];
  }

  const codeArrays = observations
    .map((observation) => observation.category)
    .filter(Boolean) as CodeableConcept[][];
  // Flatten array of code arrays
  const codes = ([] as CodeableConcept[]).concat(...codeArrays);

  return reduceToUniqueCodes(codes);
};
