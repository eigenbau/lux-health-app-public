import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  UntypedFormBuilder,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
} from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { ICarePlan } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/ICarePlan';
import { ICondition } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/ICondition';
import { Observable, startWith, distinctUntilChanged } from 'rxjs';
import { NotificationsService } from '@core/notifications/notifications.service';
import { PatientCarePlanFormGroupComponent } from '@form-groups/patient-care-plan-form-group/patient-care-plan-form-group.component';
import { PatientGoalInputDirective } from '../../patient-goal-input/patient-goal-input.directive';
import { PatientConditionInputDirective } from '../../patient-condition-input/patient-condition-input.directive';

@Component({
  selector: 'app-patient-care-plan-input-modal',
  templateUrl: './patient-care-plan-input-modal.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonicModule,
    PatientConditionInputDirective,
    PatientGoalInputDirective,
    FormsModule,
    ReactiveFormsModule,
    PatientCarePlanFormGroupComponent,
  ],
})
export class PatientCarePlanInputModalPage {
  @Input({ required: true }) carePlan!: ICarePlan;

  public carePlan$: Observable<ICondition>;

  public form: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    private notifications: NotificationsService,
    public modalController: ModalController,
  ) {
    this.form = this.fb.group({});

    this.carePlan$ = this.form.valueChanges.pipe(
      startWith(this.carePlan),
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
