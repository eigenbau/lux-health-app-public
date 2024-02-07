import { FirestoreDoc } from './firestore-doc.model';

export interface ChartTemplateObservation {
  firestoreId: string;
}
export interface ChartTemplate extends FirestoreDoc {
  title?: string;
  favourite?: boolean;
  observations?: ChartTemplateObservation[];
}
