import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  UntypedFormBuilder,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
} from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { IProcedure } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IModel';
import { Observable, startWith, distinctUntilChanged } from 'rxjs';
import { NotificationsService } from '@core/notifications/notifications.service';
import { PatientProcedureFormGroupComponent } from '@form-groups/patient-procedure-form-group/patient-procedure-form-group.component';
import { NgIf, AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-patient-procedure-input-modal',
  templateUrl: './patient-procedure-input-modal.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonicModule,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    PatientProcedureFormGroupComponent,
    AsyncPipe,
  ],
})
export class PatientProcedureInputModalPage {
  @Input({ required: true }) procedure!: IProcedure;
  @Input({ required: true }) dateTime!: string | Date;
  @Input() duration: number | undefined;

  public procedure$: Observable<IProcedure>;

  public form: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    private notifications: NotificationsService,
    private modalController: ModalController,
  ) {
    this.form = this.fb.group({});

    this.procedure$ = this.form.valueChanges.pipe(
      startWith(this.procedure),
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
