import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  UntypedFormBuilder,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
} from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { NotificationsService } from '@core/notifications/notifications.service';
import { ObservationTemplate } from '@models/observation.model';
import { TemplateObservationFormGroupComponent } from '@form-groups/template-observation-form-group/template-observation-form-group.component';

@Component({
  templateUrl: './template-observation-input-modal.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    TemplateObservationFormGroupComponent,
  ],
})
export class TemplateObservationInputModalPage {
  @Input({ required: true }) observationTemplate!: ObservationTemplate;

  public observation$: Observable<ObservationTemplate>;

  public form: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    private notifications: NotificationsService,
    public modalController: ModalController,
  ) {
    this.form = this.fb.group({
      observationTemplate: this.fb.group({}),
    });

    this.observation$ = this.form.valueChanges.pipe(
      map((form) => form.observationTemplate as ObservationTemplate),
      startWith(this.observationTemplate),
      distinctUntilChanged(),
    );
  }

  // Public methods
  public onSubmit(): void {
    this.modalController.dismiss({
      observationTemplate: this.form.value.observationTemplate,
    });
  }

  public closeModal(): void {
    this.notifications.presentAlertCancelAndCloseModal();
  }
}
