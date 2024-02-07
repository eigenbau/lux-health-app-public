import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  UntypedFormBuilder,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
} from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { IObservation } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IObservation';
import { NotificationsService } from '@core/notifications/notifications.service';
import { PatientObservationFormGroupComponent } from '@form-groups/patient-observation-form-group/patient-observation-form-group.component';

@Component({
  selector: 'app-patient-observation-input-modal',
  templateUrl: './patient-observation-input-modal.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    PatientObservationFormGroupComponent,
  ],
})
export class PatientObservationInputModalPage {
  @Input({ required: true }) observation!: IObservation;

  public form: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    private notifications: NotificationsService,
    public modalController: ModalController,
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
