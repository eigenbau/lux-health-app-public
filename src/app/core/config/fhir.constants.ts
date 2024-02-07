import { Params } from '@angular/router';
import { CodeableConcept } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/codeableConcept';
import { Coding } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/coding';

// FHIR RESOURCES
// # CARE PLAN
export const CARE_PLAN_CATEGORY: CodeableConcept = {
  coding: [
    {
      system: 'http://snomed.info/sct',
      code: '773513001',
      display: 'Physiotherapy care plan',
    },
  ],
};

// # CONDITION
export const CONDITION_CATEGORY: CodeableConcept = {
  coding: [
    {
      system: 'http://terminology.hl7.org/CodeSystem/condition-category',
      code: 'problem-list-item',
      display: 'Problem List Item',
    },
  ],
};

export const CONDITION_CLINICAL_STATUS_DEFAULT: CodeableConcept = {
  coding: [
    {
      system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
      code: 'active',
      display: 'Active',
    },
  ],
};

export const CONDITION_VERIFICATION_STATUS_DEFAULT: CodeableConcept = {
  coding: [
    {
      system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
      code: 'provisional',
      display: 'Provisional',
    },
  ],
};

// # DOCUMENT REFERENCE
export const DOCUMENT_REFERENCE_ACCEPTED_FILE_TYPES =
  'audio/*,video/*,image/*,.pdf';

export const DOCUMENT_REFERENCE_MAX_FILE_SIZE = 5e7; //50MB

export const DOCUMENT_REFERENCE_TYPE_DEFAULT: CodeableConcept = {
  coding: [
    {
      system: 'http://loinc.org',
      code: '34824-3',
      display: 'Physical therapy Consult note',
    },
  ],
};
export const DOCUMENT_REFERENCE_CATEGORY_DEFAULT: CodeableConcept = {
  coding: [
    {
      system: 'http://loinc.org',
      code: '11488-4',
      display: 'Consult note',
    },
  ],
};

// # ENCOUNTER
export const ENCOUNTER_SERVICE_TYPE: CodeableConcept = {
  coding: [
    {
      system: 'http://terminology.hl7.org/CodeSystem/service-type',
      code: '65',
      display: 'Physiotherapy',
    },
  ],
};
export const ENCOUNTER_CLASS: Coding = {
  system: 'http://terminology.hl7.org/ValueSet/v3-ActEncounterCode',
  code: 'HH',
  display: 'home health',
};

// # GOAL
export const GOAL_CATEGORY: CodeableConcept = {
  coding: [
    {
      system: 'http://terminology.hl7.org/CodeSystem/goal-category',
      code: 'physiotherapy',
      display: 'Physiotherapy',
    },
  ],
};
export const GOAL_TARGET_MEASURE: CodeableConcept = {
  coding: [
    {
      system: 'http://snomed.info/sct',
      code: '1055210001',
      display: 'Target parameter',
    },
  ],
};
// # OBSERVATION
// ## Observation valueX vars
export const VALUE_QUANTITY = 'valueQuantity';
export const VALUE_INTEGER = 'valueInteger';
export const VALUE_STRING = 'valueString';
export const VALUE_CODEABLE_CONCEPT = 'valueCodeableConcept';

// ## Observation.bodySite
export const BODY_SITE_LEFT_SIDE: CodeableConcept = {
  coding: [
    {
      system: 'http://snomed.info/sct',
      code: '31156008',
      display: 'Structure of left half of body',
    },
  ],
};
export const BODY_SITE_RIGHT_SIDE: CodeableConcept = {
  coding: [
    {
      system: 'http://snomed.info/sct',
      code: '85421007',
      display: 'Structure of right half of body',
    },
  ],
};
// ### If Observation.bodySite is set to BODY_SITE_DEFAULT,
// ### the observation input form shows a laterality select instead of the value set search
export const BODY_SITE_DEFAULT = BODY_SITE_LEFT_SIDE;

// # PROCEDURE
export const PROCEDURE_CATEGORY: CodeableConcept = {
  coding: [
    {
      system: 'http://snomed.info/sct',
      code: '91251008',
      display: 'Physical therapy procedure',
    },
  ],
};

// TERMINOLOGY SETTINGS
// # TERMINOLOGY SERVER
const serverRoot = 'https://r4.ontoserver.csiro.au';
export const TERMINOLOGY_API_URL = `${serverRoot}/fhir/ValueSet/`;
const snomedUrl = 'http://snomed.info/sct';
export const SNOMED_ECL_URL = `${snomedUrl}?fhir_vs=ecl/`;
export const VALUE_SET_DEFAULT_PARAMS: Params = {
  count: 20,
  activeOnly: true,
  _sort: 'display',
};
