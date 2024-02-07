import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  UntypedFormBuilder,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
} from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { IEncounter } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IEncounter';
import { NotificationsService } from '@core/notifications/notifications.service';
import {} from '@core/utils/string-functions';
import { PatientEncounterFormGroupComponent } from '@form-groups/patient-encounter-form-group/patient-encounter-form-group.component';
import { NgIf, AsyncPipe, TitleCasePipe } from '@angular/common';
import { map, startWith, tap } from 'rxjs';

@Component({
  selector: 'app-patient-encounter-input-modal',
  templateUrl: './patient-encounter-input-modal.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonicModule,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    PatientEncounterFormGroupComponent,
    AsyncPipe,
    TitleCasePipe,
  ],
})
export class PatientEncounterInputModalPage {
  @Input({ required: true }) encounter!: IEncounter;

  public activeObservationIndex: number | undefined;

  public form: UntypedFormGroup;

  constructor(
    public notifications: NotificationsService,
    private modalController: ModalController,
    private fb: UntypedFormBuilder,
  ) {
    this.form = this.fb.group({});
  }

  // Public methods
  public onSubmit(): void {
    this.modalController.dismiss({
      bundle: this.form.value,
    });
  }

  public closeModal(): void {
    this.notifications.presentAlertCancelAndCloseModal();
  }
}
