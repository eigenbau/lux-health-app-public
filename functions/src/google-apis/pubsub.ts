import { Resource } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/resource';

export interface FhirPubSubMessageAttributes {
  action: string;
  lastUpdatedTime: string;
  payloadType: string;
  resourceType: string;
  storeName: string;
  versionId: string;
}

export interface FhirPubSubMessage {
  attributes: FhirPubSubMessageAttributes;
  data: string;
  messageId: string;
  publishTime: string;
}

export interface FhirPubSubMessageWithResource
  extends Omit<FhirPubSubMessage, 'data'> {
  resource: Resource;
}

export const convertMessageWithBase64 = (
  message: any,
): FhirPubSubMessageWithResource => {
  const decoded = Buffer.from(message.data, 'base64').toString('utf-8');
  const resource = JSON.parse(decoded);
  const { attributes, messageId, publishTime } = message;
  return {
    attributes,
    messageId,
    publishTime,
    resource,
  };
};
