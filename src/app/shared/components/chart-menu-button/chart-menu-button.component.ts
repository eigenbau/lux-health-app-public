import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NavController, IonicModule } from '@ionic/angular';
import { PersonStateService } from '@core/state/person-state.service';
import { NgIf, AsyncPipe } from '@angular/common';
import { PersonBundle } from '@models/person-bundle.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chart-menu-button',
  templateUrl: './chart-menu-button.component.html',
  styles: [
    `
      ion-item-divider {
        --background: var(--ion-background-color) !important;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, IonicModule, AsyncPipe],
})
export class ChartMenuButtonComponent {
  personBundle$: Observable<PersonBundle | undefined>;

  constructor(
    private personState: PersonStateService,
    private navController: NavController,
  ) {
    this.personBundle$ = this.personState.personBundle$;
  }

  public async onGoToChart(
    personId: string | undefined,
    patientId: string | undefined,
  ): Promise<void> {
    if (!personId || !patientId) return;
    this.navController.navigateBack([
      '/',
      'app',
      'main',
      'person',
      personId,
      'patient',
      patientId,
    ]);
  }

  public async onGoToChartSubPage(
    personId: string | undefined,
    patientId: string | undefined,
    page: string,
  ): Promise<void> {
    if (!personId || !patientId) return;
    this.navController.navigateForward([
      '/',
      'app',
      'main',
      'person',
      personId,
      'patient',
      patientId,
      page,
    ]);
  }
}
