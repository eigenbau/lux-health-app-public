import { CodeableConcept } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/codeableConcept';
import { arrayHasValue, objectProperty } from '../object-functions';
import { Coding } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/coding';

export const reduceToUniqueCodes = (
  codes: CodeableConcept[],
): CodeableConcept[] =>
  codes.reduce(
    (uniqueCodes, newCode) =>
      hasCodeableConcept(uniqueCodes, newCode)
        ? uniqueCodes
        : [...uniqueCodes, newCode],
    [] as CodeableConcept[],
  );

export const codeableConceptHasCode = (
  cc: CodeableConcept,
  codes: string | string[],
): boolean => {
  if (!arrayHasValue(cc.coding)) {
    return false;
  }
  const codeArray = [...codes];
  return codeArray.some((code) => code === cc?.coding?.[0]?.code);
};

export const hasCodeableConcept = (
  codeableConceptArray: CodeableConcept[],
  codeableConcept: CodeableConcept,
): boolean =>
  codeableConceptArray.some((codeableConceptArrayEntry) =>
    codeableConceptsMatch(codeableConceptArrayEntry, codeableConcept),
  );

export const codeableConceptsMatch = (
  a: CodeableConcept = {},
  b: CodeableConcept = {},
): boolean => {
  if (!a.coding || !b.coding) {
    return false;
  }
  return a.coding.some(
    (aCoding) =>
      b.coding?.some(
        (bCoding) =>
          aCoding.code === bCoding.code && aCoding.system === bCoding.system,
      ),
  );
};

export const filterByCodeableConcept = <T extends { [key: string]: any }>(
  arr: T[],
  codeableConceptPath: (string | number)[],
  filterArray: CodeableConcept[],
): T[] => {
  const filterString = filterArray.join().toUpperCase();
  return arr.filter((item) => {
    const codeableConcept = objectProperty(
      codeableConceptPath,
      item,
    ) as CodeableConcept;
    return hasCodeableConcept(filterArray, codeableConcept);
  });
};

export const codeableConceptIsEmpty = (
  codeableConcept: CodeableConcept | CodeableConcept[],
): boolean => {
  if (!codeableConcept) {
    return true;
  }
  const codeableConceptArray = Array.isArray(codeableConcept)
    ? codeableConcept
    : [codeableConcept];

  return codeableConceptArray.some(
    (cc) => !!!objectProperty(['coding', 0, 'code'], cc),
  );
};

export const isCodeableConcept = (input: unknown): input is CodeableConcept => {
  return (
    typeof input === 'object' &&
    input !== null &&
    'coding' in input &&
    (input.coding === undefined ||
      (Array.isArray(input.coding) && input.coding.every((c) => isCoding(c))))
  );
};

export const isCoding = (input: unknown): input is Coding => {
  return (
    typeof input === 'object' &&
    input !== null &&
    (('system' in input && typeof input.system === 'string') ||
      ('code' in input && typeof input.code === 'string') ||
      ('display' in input && typeof input.display === 'string'))
  );
};
