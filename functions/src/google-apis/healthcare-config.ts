import * as gapiHealthcare from '@googleapis/healthcare';

// FIXME: eventuallt refactor to method outlined in this guide:
// https://cloud.google.com/healthcare-api/docs/how-tos/fhir-search
// or at least confirm that the current approach utilizes best practice
// @googleapis/healthcare is set at v10.0.0 (legacy-12),
// as the latest version(v12.0.0) is not compatible with the current
// The latest version successfully completes the API call, but
// returns an empty or no-readabble data object.
const project = 'lux-health-app';
const location = 'northamerica-northeast1';
const dataset = 'lux-health';
const fhirStore = 'production-2022-03-10';
const fhirStoreDev = 'sandbox-2022-05-22';

// Init google APIs
export const healthcare = gapiHealthcare.healthcare({
  version: 'v1',
  headers: {
    'Content-Type': 'application/fhir+json',
  },
  auth: new gapiHealthcare.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  }),
});

// eslint-disable-next-line max-len
export const fhirStoreUrl = `projects/${project}/locations/${location}/datasets/${dataset}/fhirStores/${fhirStore}`;
// eslint-disable-next-line max-len
export const fhirStoreUrlDev = `projects/${project}/locations/${location}/datasets/${dataset}/fhirStores/${fhirStoreDev}`;
