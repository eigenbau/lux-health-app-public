import { NgModule } from '@angular/core';
import {
  FirebaseApp,
  getApp,
  initializeApp,
  provideFirebaseApp,
} from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import {
  connectFirestoreEmulator,
  getFirestore,
  provideFirestore,
} from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import {
  getFunctions,
  provideFunctions,
  connectFunctionsEmulator,
} from '@angular/fire/functions';

import { environment } from '../../../environments/environment';

const config = environment.firebaseConfig;

@NgModule({
  imports: [
    provideFirebaseApp(() => initializeApp(config)),
    provideFirestore(() => {
      const firestore = getFirestore();
      // Use firebase emulator only if running in local dev mode
      if (!environment.production && location.host === 'localhost:8100') {
        //connectFirestoreEmulator(firestore, 'localhost', 8080);
      }
      return firestore;
    }),
    //enableIndexedDbPersistence(firestore);
    provideStorage(() => getStorage()),
    provideAuth(() => getAuth()),
    provideFirebaseApp(() => getApp()),
    provideFunctions(() => {
      const functions = getFunctions(getApp(), 'northamerica-northeast1');
      // Use function emulator only if running in local dev mode
      if (!environment.production && location.host === 'localhost:8100') {
        //connectFunctionsEmulator(functions, 'localhost', 5001);
      }
      return functions;
    }),
  ],
})
export class FirebaseModule {}
