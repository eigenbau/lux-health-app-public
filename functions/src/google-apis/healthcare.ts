import { CallableRequest, HttpsError } from 'firebase-functions/v2/https';
import * as gapiHealthcare from '@googleapis/healthcare';
import { checkAuth } from '../auth/auth';
import { fhirStoreUrl, fhirStoreUrlDev, healthcare } from './healthcare-config';
import { IPerson } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPerson';
import { Reference } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/reference';
import { IBundle } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IBundle';
import { Resource } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/resource';

export type PostFhirBundleData = gapiHealthcare.healthcare_v1.Schema$HttpBody;
export interface PersonBundleChildResource {
  resourceType: 'Patient' | 'Practitioner' | 'RelatedPerson';
  id: string;
  person: IPerson;
}

// - FHIR API functions with Production / Dev switch

export const onPostFhirBundle = async (
  data: any,
  auth: CallableRequest['auth'],
  production = false,
) => {
  checkAuth(auth, production);
  try {
    const parent = production ? fhirStoreUrl : fhirStoreUrlDev;
    // eslint-disable-next-line max-len
    return await healthcare.projects.locations.datasets.fhirStores.fhir.executeBundle(
      { parent, requestBody: data },
    );
  } catch (e: any) {
    throw new HttpsError('unknown', e);
  }
};

export const onGetFhirBundle = async (
  data: { [key: string]: string },
  auth: CallableRequest['auth'],
  production = false,
) => {
  checkAuth(auth, production);
  try {
    const parent = production ? fhirStoreUrl : fhirStoreUrlDev;
    const searchParams = { ...data, parent };
    const response =
      await healthcare.projects.locations.datasets.fhirStores.fhir.search(
        searchParams,
      );
    return response;
  } catch (e: any) {
    throw new HttpsError('internal', e.message, e.details);
  }
};

export const onGetFhirResourceHistory = async (
  data: { resourceType: string; resourceId: string },
  auth: CallableRequest['auth'],
  production = false,
) => {
  checkAuth(auth, production);
  try {
    const parent = production ? fhirStoreUrl : fhirStoreUrlDev;
    const { resourceType, resourceId } = data;
    const name = `${parent}/fhir/${resourceType}/${resourceId}`;
    const response =
      await healthcare.projects.locations.datasets.fhirStores.fhir.history({
        name,
      });
    return response;
  } catch (e: any) {
    throw new HttpsError('internal', e.message, e.details);
  }
};

export const onDeleteFhirResource = async (
  data: { resourceType: string; id: string },
  auth: CallableRequest['auth'],
  production = false,
) => {
  checkAuth(auth, production);
  const { resourceType, id } = data;
  const name = production
    ? `${fhirStoreUrl}/fhir/${resourceType}/${id}`
    : `${fhirStoreUrlDev}/fhir/${resourceType}/${id}`;

  // First delete current version of FHIR resource
  try {
    // eslint-disable-next-line max-len
    const res =
      await healthcare.projects.locations.datasets.fhirStores.fhir.delete({
        name,
      });
    console.log('resource deleted', `${resourceType}/${id}`, res);
  } catch (e) {
    throw new HttpsError('internal', 'Could not delete FHIR resource');
  }

  // Then delete the history of the FHIR resource
  try {
    const res =
      // eslint-disable-next-line new-cap, max-len
      await healthcare.projects.locations.datasets.fhirStores.fhir.ResourcePurge(
        { name },
      );
    console.log('resource purged', `${resourceType}/${id}`, res);
    return res;
  } catch (e) {
    throw new HttpsError(
      'internal',
      'Could not delete history of FHIR resource',
    );
  }
};

export const onDeleteFhirPersonBundle = async (
  id: string,
  auth: CallableRequest['auth'],
  production = false,
) => {
  checkAuth(auth, production);
  try {
    // get resource
    const person = await getResource<IPerson>('Person', id, auth, production);

    // build transaction array for delete bundle
    const relatedResources =
      person.link?.map((link) => ({
        resourceType: getReferencedResourceType(link.target.reference),
        id: getIdFromReference(link.target.reference),
      })) || [];
    const resources = [{ resourceType: 'Person', id }, ...relatedResources];

    const entry: IBundle['entry'] =
      resources.map((r) => ({
        request: { method: 'DELETE', url: `${r.resourceType}/${r.id}` },
      })) || [];
    const bundle: IBundle = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry,
    };

    // post bundle delete
    await onPostFhirBundle(bundle, auth, production);

    // delete history for each resource
    resources.forEach(
      async (r) => await onDeleteFhirResource(r, auth, production),
    );
  } catch (e) {
    throw new HttpsError(
      'internal',
      `Could not delete FHIR Person and
      related Patient, RelatedPerson, and Practitioner resources`,
    );
  }
};

export const onDeleteFhirPersonBundleChildResource = async (
  data: PersonBundleChildResource,
  auth: CallableRequest['auth'],
  production = false,
) => {
  checkAuth(auth, production);
  try {
    // get person record
    const id = data.person.id || '';
    const person = await getResource<IPerson>('Person', id, auth, production);

    // remove link to child resource to be deleted
    const link = person?.link?.filter(
      (l) => getIdFromReference(l.target.reference) !== data.id,
    );
    const resource: IPerson = { ...data.person, link };

    // if no links remain throw error
    if (link?.length === 0) {
      throw new HttpsError(
        'internal',
        'Could not delete FHIR Person child resource',
      );
    }

    // post bundle with update person and delete child entries
    const bundle: IBundle = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: [
        {
          fullUrl: `urn:uuid:${resource.resourceType}/${resource.id}`,
          resource: resource as Resource,
          request: {
            method: 'PUT',
            url: `${resource.resourceType}/${resource.id}`,
          },
        },
        {
          request: {
            method: 'DELETE',
            url: `${data.resourceType}/${data.id}`,
          },
        },
      ],
    };
    await onPostFhirBundle(bundle, auth, production);

    // delete child history
    onDeleteFhirResource(
      { resourceType: data.resourceType, id: data.id },
      auth,
      production,
    );
  } catch (e) {
    throw new HttpsError(
      'internal',
      'Could not delete FHIR Person child resource',
    );
  }
};

// Private
const getResource = async <T extends Resource | IPerson>(
  resourceType: string,
  id: string,
  auth: CallableRequest['auth'],
  production = false,
): Promise<T> => {
  checkAuth(auth, production);
  try {
    // get resource
    const name = production
      ? `${fhirStoreUrl}/fhir/${resourceType}/${id}`
      : `${fhirStoreUrlDev}/fhir/${resourceType}/${id}`;
    const res =
      await healthcare.projects.locations.datasets.fhirStores.fhir.read({
        name,
      });
    return res.data as T;
  } catch (e) {
    throw new HttpsError('internal', 'Could not get FHIR resource');
  }
};

const getIdFromReference = (reference: Reference['reference']): string =>
  reference ? reference.replace(/^[^/]*\//, '') : '';

const getReferencedResourceType = (
  reference: Reference['reference'],
): string => (reference ? reference.replace(/\/.*/, '') : '');
