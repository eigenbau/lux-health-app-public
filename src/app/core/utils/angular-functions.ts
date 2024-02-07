import { IResource } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IResource';

export const trackByIdGeneric = (index: number, entry: IResource): string =>
  entry.id ? entry.id : '';
