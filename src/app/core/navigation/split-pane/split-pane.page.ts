import { Component } from '@angular/core';
import { Router, RouterLinkActive, RouterLink } from '@angular/router';
import { MenuController, ModalController, IonicModule } from '@ionic/angular';
import { AuthService } from '../../auth/auth.service';
import { UiSettingsStateService } from '../../state/ui-settings-state.service';
import { OverlayComponent } from '@components/overlay/overlay.component';
import { ThemeSettingsDirective } from '@directives/modal-handlers/theme-settings/theme-settings.directive';
import { AvatarComponent } from '@components/avatar/avatar.component';
import { NgIf, AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-split-pane',
  templateUrl: './split-pane.page.html',
  styleUrls: ['./split-pane.page.scss'],
  standalone: true,
  imports: [
    NgIf,
    IonicModule,
    AvatarComponent,
    RouterLinkActive,
    RouterLink,
    ThemeSettingsDirective,
    OverlayComponent,
    AsyncPipe,
  ],
})
export class SplitPanePage {
  public readonly onlineStatus$: Observable<boolean>;
  public readonly deviceOrientation$: Observable<'portrait' | 'landscape'>;
  constructor(
    public modalController: ModalController,
    public auth: AuthService,
    private uiSettingsState: UiSettingsStateService,
    private menu: MenuController,
    private router: Router
  ) {
    this.onlineStatus$ = this.uiSettingsState.onlineStatus$;
    this.deviceOrientation$ = this.uiSettingsState.deviceOrientation$;
  }

  public async signOut(): Promise<void> {
    await this.menu.close();
    await this.auth.onSignOut();
    await this.router.navigate(['/auth']);
  }

  public reload(): void {
    window.location.reload();
  }
}
