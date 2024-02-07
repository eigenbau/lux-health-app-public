import { Coding } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/coding';
import { ObservationComponent } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/observationComponent';
import { IObservation } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IObservation';
import {
  ResourceWithValueX,
  ValueGroup,
  ValueKey,
  ValueObject,
  ValueStats,
  ValueX,
  ValueXArray,
} from '@models/value-x.model';
import { capitalize, capitalizeAllWords } from '../string-functions';
import { compare } from '../number-functions';
import { arrayHasIndex, arrayHasValue } from '../object-functions';
import {
  ObservationByBodySite,
  ObservationRootType,
} from '@models/observation.model';
import {
  codeAndValueXAreHomogenious,
  getTimeOfObservation,
  groupObservationsByBodySite,
} from './observation-functions';
import { parseISO } from 'date-fns';
import {
  VALUE_CODEABLE_CONCEPT,
  VALUE_INTEGER,
  VALUE_QUANTITY,
  VALUE_STRING,
} from '../../config/fhir.constants';
import { environment } from 'src/environments/environment';

export const getValueSummary = (
  observation: IObservation | undefined | null,
): string => {
  if (!observation) {
    return '';
  }
  const values = getValueXArray(observation);

  if (
    !values
      .map((v) => v.value)
      .filter(Boolean)
      .join('')
  ) {
    return '';
  }

  // check if units are all equal

  const unitsAllEqual = values.every((v) => v.unit === values[0].unit);

  const joinedValues = values
    .map((v) =>
      unitsAllEqual
        ? v.value
        : `${v.value} ${valueCodeRename(v?.code || '', +v.value)}`,
    )
    .filter(Boolean)
    .join(' / ');

  const joinedComponentCodes = values
    .map((v) => v?.componentCodeDisplay)
    .filter(Boolean)
    .join(' / ');

  const valueCodeOfJoinedValues = unitsAllEqual
    ? valueCodeRename(values[0]?.code || '', +values[0]?.value)
    : '';

  const valuesAndCodes = valueCodeOfJoinedValues
    ? `${joinedValues} ${valueCodeOfJoinedValues}`
    : joinedValues;
  // Returns
  return values.length > 1
    ? `${valuesAndCodes} (${joinedComponentCodes})`
    : `${valuesAndCodes}`;
};

export const getValueType = (
  valueSource:
    | IObservation
    | ObservationComponent
    | (IObservation | ObservationComponent)[],
): ValueKey | undefined => {
  if (!valueSource) {
    throw new Error(`No valueSource supplied to 'getValueType'.`);
  }
  const reducedValueSource =
    Array.isArray(valueSource) && valueSource?.length > 0
      ? valueSource.slice(0)[0]
      : valueSource;
  const valueType =
    VALUE_QUANTITY in reducedValueSource
      ? VALUE_QUANTITY
      : VALUE_INTEGER in reducedValueSource
        ? VALUE_INTEGER
        : VALUE_STRING in reducedValueSource
          ? VALUE_STRING
          : undefined;

  if (!valueType) {
    // throw new Error(`Unable to identify value type in 'getValueType'.`);
    return undefined;
  }
  return valueType;
};

export const getValueXArray = (observation: IObservation): ValueX[] => {
  const codeValuePairs: ValueX[] = [];
  if (!observation.component || observation.component?.length === 0) {
    codeValuePairs.push({
      ...getValueX(observation),
      componentCodeDisplay: observation.code.coding?.[0].display,
    });
  }
  if (observation.component?.length && observation.component?.length > 0) {
    observation.component?.forEach((c) =>
      codeValuePairs.push({
        ...getValueX(c),
        componentCodeDisplay: abreviateValueXComponentDisplay(
          c.code.coding?.[0].display,
          observation.code.coding?.[0].display,
        ),
      }),
    );
  }
  return codeValuePairs;
};

export const buildValueGroupArray = (
  observations: ObservationRootType[],
): ValueGroup[] => {
  if (!arrayHasValue(observations)) {
    return [];
  }
  const valueGroupArray: ValueGroup[] = [];

  const observationsByBodySites: ObservationByBodySite[] =
    groupObservationsByBodySite(observations);

  observationsByBodySites.forEach((obbs) => {
    const obs = obbs.observations;
    if (getValueType(obs[0])) {
      valueGroupArray.push(buildValueGroup(obs));
    }
    if (!!arrayHasValue(obs[0]?.component)) {
      obs[0].component?.forEach((_, index) =>
        valueGroupArray.push(buildValueGroup(obs, index)),
      );
    }
  });
  return valueGroupArray;
};

const getValueX = (
  valueSource: IObservation | ObservationComponent,
): { value: number | string; unit?: string; code?: string } => {
  if (
    VALUE_QUANTITY in valueSource &&
    valueSource.valueQuantity?.value !== undefined
  ) {
    return {
      value: +valueSource.valueQuantity.value,
      unit: valueSource.valueQuantity?.unit,
      code: valueSource.valueQuantity?.code,
    };
  }
  if (VALUE_INTEGER in valueSource && valueSource.valueInteger !== undefined) {
    return { value: +valueSource.valueInteger };
  }
  if (VALUE_STRING in valueSource) {
    return { value: valueSource.valueString || '' };
  }
  if (VALUE_CODEABLE_CONCEPT in valueSource) {
    return {
      value: valueSource.valueCodeableConcept?.coding?.[0]?.display || '',
    };
  }
  throw new Error(`Unable to get ValueX 'getValueX'.`);
};

const buildValueGroup = (
  observations: ObservationRootType[],
  componentIndex: number = -1,
): ValueGroup => {
  if (!arrayHasValue(observations)) {
    throw new Error(`No observations supplied to 'buildValueGroup'.`);
  }
  const resourcesWithValueX =
    componentIndex < 0
      ? observations
      : (observations
          ?.map((o) =>
            arrayHasIndex(o?.component, componentIndex)
              ? o.component?.[componentIndex]
              : undefined,
          )
          .filter(Boolean) as ObservationComponent[]);

  const series: ValueObject[] = resourcesWithValueX.map((r, i) =>
    getValueObject(r, observations[i]),
  );
  const type = typeof series[0].value as 'string' | 'number';
  const { code, unit } = getValueX(resourcesWithValueX[0]);
  const isHomongeneous = codeAndValueXAreHomogenious(resourcesWithValueX);
  const codeDisplay =
    componentIndex < 0
      ? observations?.[0].code.coding?.[0].display
      : abreviateValueXComponentDisplay(
          resourcesWithValueX[0]?.code.coding?.[0].display,
          observations[0]?.code.coding?.[0].display,
        );
  const stats = buildValueStats(series);
  const bodySite = observations[0]?.bodySite?.coding
    ? observations[0].bodySite?.coding[0]?.display
    : undefined;
  return {
    series,
    type,
    code,
    bodySite,
    unit,
    isHomongeneous,
    codeDisplay,
    stats,
  };
};

const getValueObject = (
  resourceWithValueX: ResourceWithValueX,
  rootObservation: IObservation,
): ValueObject => ({
  value: resourceWithValueX ? getValueX(resourceWithValueX).value : '',
  datetime: parseISO(getTimeOfObservation(rootObservation)).getTime(),
  referenceId: rootObservation.id,
});

const buildValueStats = (series: ValueObject[]): ValueStats => {
  if (!arrayHasValue(series)) {
    throw new Error(`No series supplied to 'buildValueStats'.`);
  }
  const valueStats: ValueStats = {
    first: series[0], // assuming and array ordered by date
    last: series[series.length - 1], // assuming and array ordered by date,
    min: { value: 0 },
    max: { value: 0 },
    mean: { value: 0 },
    range: 0,
    count: series.length,
  };
  if (typeof series[0].value === 'number') {
    valueStats.min = series.reduce(
      (previousVO, currentVO) =>
        +previousVO.value < +currentVO.value ? previousVO : currentVO,
      series[0],
    );
    valueStats.max = series.reduce(
      (previousVO, currentVO) =>
        +previousVO.value > +currentVO.value ? previousVO : currentVO,
      series[0],
    );
    valueStats.mean = series.reduce(
      (previousVO, currentVO) => ({ value: +previousVO.value + +currentVO }),
      { value: 0 },
    );
    valueStats.range = +valueStats.max.value - +valueStats.min.value;
  }

  return valueStats;
};

export const valueCodeRename = (code: string, quantity = 2): string => {
  const plural = !quantity || quantity > 1 ? true : false;
  const score = plural ? 'Points' : 'Point';

  return code === 'deg'
    ? 'Degree'
    : code === '{ScoreOf}' || code === '{score}'
      ? score
      : code;
};

export const abreviateValueXComponentDisplay = (
  display: Coding['display'],
  parentDisplay: Coding['display'],
): string => {
  if (!display || !parentDisplay) {
    return '';
  }
  const abreviatedDisplay = display
    .toLowerCase()
    .replace(parentDisplay.toLowerCase(), '')
    .trim();
  return capitalize(abreviatedDisplay);
  // return capitalizeAllWords(abreviatedDisplay);
};

export const valueXArrayMinMax = (
  valueXArrayArray: ValueXArray[],
  target: 'min' | 'max',
): ValueXArray => {
  const targetOperation = target === 'min' ? 'smaller' : 'larger';

  const initialValue: ValueXArray = [];

  return valueXArrayArray.reduce((valueXArrayMin, valueXArrayCurrent) => {
    const valueXArray = valueXArrayMin ? valueXArrayMin : valueXArrayCurrent;
    return valueXArray.map((v, i) => {
      const valueCurrent = valueXArrayCurrent[i]?.value;
      if (v?.value !== undefined && valueCurrent !== undefined) {
        const value = compare(+v.value, +valueCurrent, targetOperation);
        return {
          ...v,
          value: value || 0,
        };
      }
      return v;
    });
  }, initialValue);
};
