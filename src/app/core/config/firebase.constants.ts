import { environment } from '../../../environments/environment';

// FIREBASE SETTINGS
// # DOCUMENT REFERENCE
// ## FHIR DocumentReference Resource file path
export const FHIR_DOCUMENT_REFERENCE_FILE_PATH = `${environment.pathBase}/fhir/resource/document-reference/`;

// # FIREBASE DATABASE
export const OBSERVATION_TEMPLATE_PATH = `${environment.pathBase}-template-observation`;
export const CHART_TEMPLATE_PATH = `${environment.pathBase}-template-chart`;
export const USER_CUSTOM_VALUE_SETS = `${environment.pathBase}-user-custom-value-sets`;
