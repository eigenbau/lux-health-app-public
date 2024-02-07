// TODO:
// - build function that listens to upload to storage
// - - used for user photo upload
// - - resize and save thumbnail
// - - write db entry
// - comment this file, especially on search function with reference

// Currently all onCall functions require the following permissions:
// - Cloud Functions Invoker: allUsers

import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import {
  onPostFhirBundle,
  onGetFhirBundle,
  onGetFhirResourceHistory,
  onDeleteFhirResource,
  PostFhirBundleData,
  onDeleteFhirPersonBundle,
  PersonBundleChildResource,
  onDeleteFhirPersonBundleChildResource,
} from './google-apis/healthcare';
import { onMessagePublished } from 'firebase-functions/v2/pubsub';
import { convertMessageWithBase64 } from './google-apis/pubsub';
import { onCall, CallableRequest } from 'firebase-functions/v2/https';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';

admin.initializeApp();
const db = getFirestore();

// Pub / Sub functions
export const onFhirDatastoreChange = onMessagePublished(
  'fhir-datastore-production-2022-03-10',
  async (event) => {
    try {
      const resourceType = event.data.message.attributes.resourceType;
      const message = convertMessageWithBase64(event.data.message);
      // Write attributes to DB with each doc representing one resourceType
      const ref = db.collection('prod-fhir-datastore-pubsub').doc(resourceType);
      await ref.set({ ...message }, { merge: true });
    } catch (e) {
      console.error('PubSub error', e);
    }
  },
);

export const onFhirDatastoreChangeDev = onMessagePublished(
  'fhir-datastore-sandbox-2022-05-22',
  async (event) => {
    try {
      const resourceType = event.data.message.attributes.resourceType;
      const message = convertMessageWithBase64(event.data.message);
      // Write attributes to DB with each doc representing one resourceType
      const ref = db.collection('dev-fhir-datastore-pubsub').doc(resourceType);
      await ref.set({ ...message }, { merge: true });
    } catch (e) {
      console.error('PubSub error', e);
    }
  },
);

// User roles functions
// - On write to 'user-roles' Firestore Collection,
//   update related auth custom claims
export const syncCustomClaimsWithUserRoles = onDocumentWritten(
  'user-roles/{userId}',
  async (event) => {
    const userRoles = event.data?.after.data();
    const userId = event.params.userId as string;
    try {
      const user = await admin.auth().getUser(userId);
      if (user) {
        admin.auth().setCustomUserClaims(user.uid, {
          ...userRoles,
        });
      }
    } catch (e) {
      throw Error(
        'There is no user record corresponding to the provided identifier.',
      );
    }

    return;
  },
);

// FHIR API functions
// - Post Bundle
export const postFhirBundle = onCall(
  { region: 'northamerica-northeast1' },
  async (request: CallableRequest) => {
    const data: PostFhirBundleData = request.data;
    const auth = request.auth;
    return await onPostFhirBundle(data, auth, true);
  },
);
export const postFhirBundleDev = onCall(
  { region: 'northamerica-northeast1' },
  async (request: CallableRequest) => {
    const data: PostFhirBundleData = request.data;
    const auth = request.auth;
    return await onPostFhirBundle(data, auth, false);
  },
);

// - Get Resource Bundle
export const getFhirBundle = onCall(
  { region: 'northamerica-northeast1' },
  async (request: CallableRequest) => {
    const data: { [key: string]: string } = request.data;
    const auth = request.auth;
    return await onGetFhirBundle(data, auth, true);
  },
);

export const getFhirBundleDev = onCall(
  { region: 'northamerica-northeast1' },
  async (request: CallableRequest) => {
    const data: { [key: string]: string } = request.data;
    const auth = request.auth;
    return await onGetFhirBundle(data, auth, false);
  },
);

// - Get Resource History
export const getFhirResourceHistory = onCall(
  { region: 'northamerica-northeast1' },
  async (request: CallableRequest) => {
    const data: { resourceType: string; resourceId: string } = request.data;
    const auth = request.auth;
    return await onGetFhirResourceHistory(data, auth, true);
  },
);

export const getFhirResourceHistoryDev = onCall(
  { region: 'northamerica-northeast1' },
  async (request: CallableRequest) => {
    const data: { resourceType: string; resourceId: string } = request.data;
    const auth = request.auth;
    return await onGetFhirResourceHistory(data, auth, false);
  },
);
// - Delete
export const deleteFhirResource = onCall(
  { region: 'northamerica-northeast1' },
  async (request: CallableRequest) => {
    const data: { resourceType: string; id: string } = request.data;
    const auth = request.auth;
    return await onDeleteFhirResource(data, auth, true);
  },
);
export const deleteFhirResourceDev = onCall(
  { region: 'northamerica-northeast1' },
  async (request: CallableRequest) => {
    const data: { resourceType: string; id: string } = request.data;
    const auth = request.auth;
    return await onDeleteFhirResource(data, auth, false);
  },
);

// - Delete PersonBundle
export const deleteFhirPersonBundle = onCall(
  { region: 'northamerica-northeast1' },
  async (request: CallableRequest) => {
    const data: string = request.data;
    const auth = request.auth;
    return await onDeleteFhirPersonBundle(data, auth, true);
  },
);
export const deleteFhirPersonBundleDev = onCall(
  { region: 'northamerica-northeast1' },
  async (request: CallableRequest) => {
    const data: string = request.data;
    const auth = request.auth;
    return await onDeleteFhirPersonBundle(data, auth, false);
  },
);

// - Delete PersonBundleChildResource
export const deleteFhirPersonBundleChildResource = onCall(
  { region: 'northamerica-northeast1' },
  async (request: CallableRequest) => {
    const data: PersonBundleChildResource = request.data;
    const auth = request.auth;
    return await onDeleteFhirPersonBundleChildResource(data, auth, true);
  },
);
export const deleteFhirPersonBundleChildResourceDev = onCall(
  { region: 'northamerica-northeast1' },
  async (request: CallableRequest) => {
    const data: PersonBundleChildResource = request.data;
    const auth = request.auth;
    return await onDeleteFhirPersonBundleChildResource(data, auth, false);
  },
);
