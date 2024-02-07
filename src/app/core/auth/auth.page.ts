import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, tap } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import { IonicModule } from '@ionic/angular';
import { NgIf, AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styles: [
    `
      .container {
        display: flex;
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        align-items: center;
        justify-content: center;
        background-color: var(--ion-color-primary);
        background: linear-gradient(
          345deg,
          var(--ion-color-primary-shade) 50%,
          var(--ion-color-primary) 50%
        );
      }
      .content {
      }
      ion-button,
      ion-button:focus,
      ion-button:active {
        --background: var(--ion-color-primary-contrast);
      }
    `,
  ],
  standalone: true,
  imports: [NgIf, IonicModule, AsyncPipe],
})
export class AuthPage implements OnInit, OnDestroy {
  destroy$ = new Subject<null>();

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.auth.user$
      .pipe(
        takeUntil(this.destroy$),
        tap((user) => {
          if (user) {
            this.router.navigate(['/app']);
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  async onSignIn(): Promise<void> {
    this.auth.googleSignIn();
  }

  onSignOut(): void {
    this.auth.onSignOut();
  }
}
