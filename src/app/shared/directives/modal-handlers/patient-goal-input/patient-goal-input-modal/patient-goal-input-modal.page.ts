import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  UntypedFormBuilder,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
} from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { IGoal } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IGoal';
import { Observable, startWith, distinctUntilChanged } from 'rxjs';
import { NotificationsService } from 'src/app/core/notifications/notifications.service';
import { PatientGoalFormGroupComponent } from '@form-groups/patient-goal-form-group/patient-goal-form-group.component';

@Component({
  selector: 'app-patient-goal-input-modal',
  templateUrl: './patient-goal-input-modal.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    PatientGoalFormGroupComponent,
  ],
})
export class PatientGoalInputModalPage {
  @Input() goal!: IGoal;

  public goal$: Observable<IGoal>;

  public form: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    private notifications: NotificationsService,
    public modalController: ModalController,
  ) {
    this.form = this.fb.group({});

    this.goal$ = this.form.valueChanges.pipe(
      startWith(this.goal),
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
