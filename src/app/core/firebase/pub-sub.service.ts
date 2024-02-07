import { Injectable } from '@angular/core';
import {
  CollectionReference,
  DocumentReference,
  Firestore,
  collection,
  doc,
  docData,
} from '@angular/fire/firestore';
import { FhirPubSubMessageWithResource } from '@models/fhir.model';
import { environment } from 'src/environments/environment';
import {
  Observable,
  catchError,
  filter,
  map,
  of,
  skip,
  withLatestFrom,
} from 'rxjs';
import { log } from '@core/utils/rxjs-log';
import { IPerson } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPerson';
import { IPatient } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPatient';
import { arrayHasValue } from '@core/utils/object-functions';

@Injectable({
  providedIn: 'root',
})
export class PubSubService {
  constructor(private firestore: Firestore) {}

  // Public methods

  // FIXME: this is a partially selective trigger for reload when related resources change
  // it is used in most FHIR services
  // this should be updated in conjuction with centralising the state management
  public observeFhirUpdates(config: {
    resourceType: string;
    person?: Observable<IPerson | undefined>;
    patient?: Observable<IPatient | undefined>;
  }): Observable<void> {
    const { resourceType, person = of(null), patient = of(null) } = config;

    return docData(this.getDocRef(resourceType)).pipe(
      skip(1), // Skip emitting of first value so that observable only emits when a change occurs after subscription
      withLatestFrom(person, patient),
      filter(([doc, person, patient]) =>
        this.containsUUIDs(doc?.resource, [person?.id, patient?.id]),
      ),
      log(`observeFhirUpdates of ${resourceType}`, this.constructor.name),
      catchError((e) => {
        throw new Error(`'observeFhirUpdates' failed.`);
      }),
      map(() => {}),
    );
  }

  // Private methods
  private getDocRef(
    resourceType: string,
  ): DocumentReference<FhirPubSubMessageWithResource> {
    const env = environment.production ? 'prod' : 'dev';
    // Include DEV branching
    const colRef = collection(
      this.firestore,
      `${env}-fhir-datastore-pubsub`,
    ) as CollectionReference<FhirPubSubMessageWithResource>;
    return doc(colRef, resourceType);
  }

  private containsUUIDs(obj: any, uuids: (string | undefined)[]): boolean {
    const jsonString = JSON.stringify(obj);
    const truthyUUIDs = uuids.filter(
      (i): i is string => Boolean(i) && typeof i === 'string',
    ); // Remove falsy entries

    return arrayHasValue(truthyUUIDs)
      ? truthyUUIDs.some((uuid) => jsonString.includes(uuid))
      : true; // If no UUIDs are provided, return true - this will cause the observable to emit
  }
}
