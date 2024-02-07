import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  UntypedFormBuilder,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
} from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { ICondition } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/ICondition';
import { distinctUntilChanged, Observable, startWith } from 'rxjs';
import { NotificationsService } from '@core/notifications/notifications.service';
import { PatientConditionFormGroupComponent } from '@form-groups/patient-condition-form-group/patient-condition-form-group.component';
import { NgIf, AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-patient-condition-input-modal',
  templateUrl: './patient-condition-input-modal.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonicModule,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    PatientConditionFormGroupComponent,
    AsyncPipe,
  ],
})
export class PatientConditionInputModalPage {
  @Input({ required: true }) condition!: ICondition;

  public condition$: Observable<ICondition>;

  public form: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    private notifications: NotificationsService,
    public modalController: ModalController,
  ) {
    this.form = this.fb.group({});

    this.condition$ = this.form.valueChanges.pipe(
      startWith(this.condition),
      distinctUntilChanged(),
    );
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
