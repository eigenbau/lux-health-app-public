import { Injectable, OnDestroy } from '@angular/core';
import {
  Auth,
  authState,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  User,
} from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { NotificationsService } from '../notifications/notifications.service';

import { SingletonGuardService } from '../services/singleton-guard.service';

const production = environment.production;

@Injectable({
  providedIn: 'root',
})
export class AuthService extends SingletonGuardService implements OnDestroy {
  public readonly user$: Observable<User | null>;
  private readonly destroy$ = new Subject<null>();

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private notifications: NotificationsService,
    private router: Router,
  ) {
    super(AuthService);
    this.user$ = authState(this.auth);
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  public async googleSignIn(): Promise<void> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const userCredential = await signInWithPopup(this.auth, provider);

      if (!userCredential) {
        throw new Error('sign-in timed out');
      }

      await this.updateUserData({ ...userCredential.user });

      // Demo version note to users
      if (!production) {
        const response = await this.notifications.presentAlert({
          header: 'Demo version',
          message: `Please ensure patient privacy! Do not add real patient-identifying data to this demo version!
          Also, please do not delete patient data that you did not create. Someone else may still be working on it.
          Thanks ;-)
          `,
          cancelLabel: 'Log out',
          confirmLabel: 'Got it, let me play!',
        });
        if (response === 'cancelled') {
          await this.onSignOut();
          this.router.navigate(['/auth']);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  public async onSignOut(): Promise<void> {
    await signOut(this.auth);
  }

  // Private methods
  private async updateUserData({
    uid,
    email,
    displayName,
    photoURL,
  }: User): Promise<void> {
    const docRef = doc(this.firestore, `user/${uid}`);
    const data = { uid, email, displayName, photoURL };
    return await setDoc(docRef, data, { merge: true });
  }
}
