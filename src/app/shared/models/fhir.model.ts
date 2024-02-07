import { Resource } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/models-r4';

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
