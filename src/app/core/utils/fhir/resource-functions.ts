import { CodeableConcept } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/codeableConcept';
import { Period } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/period';
import { Reference } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/reference';
import { IGoal } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IGoal';
import { ResourceType } from '@models/resources.model';
import {
  BODY_SITE_LEFT_SIDE,
  BODY_SITE_RIGHT_SIDE,
} from '../../config/fhir.constants';
import { arrayHasValue } from '../object-functions';
import { toDashed } from '../string-functions';
import { isCodeableConcept } from './codeable-concept-functions';
import { ENCOUNTER_DURATION_DEFAULT } from '@core/config/clinic.constant';

export const formatPeriodFromStartAndDuration = (
  start: Date,
  duration: number,
): Period => {
  const end = new Date(start.getTime() + duration * 60000);
  return { start, end };
};

export const formatDurationFromPeriod = (
  period: Period | undefined,
  defaultDuration: number | undefined | null = ENCOUNTER_DURATION_DEFAULT, // if null is suppplied, the default will not be used,...
): number => {
  if (!period?.start || !period?.end) {
    return defaultDuration ? defaultDuration : ENCOUNTER_DURATION_DEFAULT; // ... therefore it is re-assigned in this guard
  }
  const start = new Date(period.start);
  const end = new Date(period.end);

  const durationInMinutes = Math.round(
    Math.abs(start.getTime() - end.getTime()) / 60000,
  );
  return durationInMinutes;
};

export const getReferencedResource = <T extends ResourceType>(
  reference: Reference['reference'] | undefined,
  resources: T[],
): T | undefined => {
  if (!arrayHasValue(resources)) {
    // throw new Error(`No resources supplied to 'getReferencedResource'.`);
    return undefined;
  }
  const r = resources?.find((r) => reference?.endsWith(r?.id || ''));
  if (!r) {
    // throw new Error(`No resourceType found in 'getReferencedResource'.`);
    return undefined;
  }
  return r;
};

export const getIdFromReference = (
  reference: Reference['reference'],
): string => {
  if (!reference) {
    throw new Error(`No reference string supplied to 'getIdFromReference'.`);
  }
  return reference.replace(/^[^/]*\//, '');
};

export const getReferencedResourceType = (
  reference: Reference['reference'],
): string => {
  if (!reference) {
    throw new Error(
      `No reference string supplied to 'getReferencedResourceType'.`,
    );
  }
  return reference.replace(/\/.*/, '');
};

export const convertResourceTypeToPatch = (resourceType: string): string =>
  toDashed(resourceType);

export const periodDurationInMinutes = (period: Period | undefined): number => {
  if (!period?.start || !period?.end) {
    console.warn(`No Period object supplied to 'periodDurationInMinutes'.`);
    return 0;
  }
  const start = new Date(period.start);
  const end = new Date(period.end);
  return Math.round(Math.abs(start.getTime() - end.getTime()) / 60000);
};

export const getFileTypeIcon = (contentType = ''): string =>
  contentType.indexOf('pdf') > -1
    ? 'document-text-outline'
    : contentType.indexOf('video') > -1
      ? 'videocam-outline'
      : contentType.indexOf('image') > -1
        ? 'camera-outline'
        : contentType.indexOf('audio') > -1
          ? 'mic-outline'
          : 'attach-outline';

export const getGoalTitle = (goal: IGoal | undefined): string => {
  if (!goal) {
    return '';
  }
  const description = goal?.description?.coding?.[0].display || '';
  const target = !arrayHasValue(goal?.target)
    ? ''
    : goal.target?.[0]?.detailString || '';
  return [description, target].filter(Boolean).join(' • ');
};

export const formatBodySite = (
  bodySite: CodeableConcept | string | undefined | null,
): string => {
  if (typeof bodySite === 'string' && !bodySite) {
    console.warn(`No string supplied to 'formatBodySite'.`);
    return '';
  }
  if (typeof bodySite !== 'string' && !isCodeableConcept(bodySite)) {
    console.warn(`No CodeableConcept supplied to 'formatBodySite'.`);
    return '';
  }
  const bodySiteDisplay =
    typeof bodySite === 'string'
      ? bodySite
      : bodySite.coding?.[0].display ?? '';

  return bodySiteDisplay === BODY_SITE_LEFT_SIDE.coding?.[0].display
    ? 'Left'
    : bodySiteDisplay === BODY_SITE_RIGHT_SIDE.coding?.[0].display
      ? 'Right'
      : typeof bodySite === 'string'
        ? bodySite
        : bodySite.coding?.[0].display || '';
};
