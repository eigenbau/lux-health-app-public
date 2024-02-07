import { IPatient } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPatient';
import { IPerson } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPerson';
import { IPractitioner } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPractitioner';
import { IRelatedPerson } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IRelatedPerson';
import { formatISO } from 'date-fns';

export const getName = (
  resource: IPerson | IPatient | IRelatedPerson | IPractitioner | undefined,
  displayPrefix?: 'prefix',
): string => {
  if (!resource) {
    return '';
  }
  const prefix = (
    resource?.name?.[0].prefix && displayPrefix === 'prefix'
      ? `${resource.name[0].prefix}. `
      : ''
  ).replace(/\.+/g, '.');
  const given = resource?.name?.[0]?.given?.[0];
  const family = resource?.name?.[0]?.family;

  return [prefix, given, family].filter(Boolean).join(' ');
};

export const getAge = (
  resource:
    | IPerson
    | IPatient
    | IRelatedPerson
    | IPractitioner
    | undefined
    | null,
): number => {
  const today = new Date();
  const dateString = resource?.birthDate ?? formatISO(today);
  const birthDate = new Date(dateString);
  // FIXME: Incomplete validation -
  // complete solution: https://esganzerla.medium.com/simple-date-validation-with-javascript-caea0f71883c
  if (!+birthDate) {
    return NaN;
  }
  const m = today.getMonth() - birthDate.getMonth();
  const age = today.getFullYear() - birthDate.getFullYear();

  return m < 0 || (m === 0 && today.getDate() < birthDate.getDate())
    ? age - 1
    : age;
};

export const getInitials = (
  config: {
    firstname?: string;
    lastname?: string;
    name?: string;
  } = {},
): string => {
  const { firstname = '', lastname = '', name = '' } = config;

  if (firstname.length > 0 && lastname.length > 0) {
    return firstname.charAt(0).toUpperCase() + lastname.charAt(0).toUpperCase();
  }
  if (!name) {
    ('');
  }
  if (name.indexOf(' ') > 0 && name.indexOf(' ') < name.length) {
    return (
      name.split(' ')[0].charAt(0).toUpperCase() +
      name.split(' ')[1].charAt(0).toUpperCase()
    );
  }
  if (name.length > 1) {
    return name.substring(0, 1).toUpperCase();
  }
  return '';
};
