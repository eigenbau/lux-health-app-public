import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
} from '@angular/core';
import {
  UntypedFormBuilder,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
} from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { Reference } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/reference';
import { NotificationsService } from '@core/notifications/notifications.service';
import { ObservationRootType } from '@models/observation.model';
import { PatientObservationListFormGroupComponent } from '@form-groups/patient-observation-list-form-group/patient-observation-list-form-group.component';
import { TemplateSelectionDirective } from '../../template-selection/template-selection.directive';

@Component({
  selector: 'app-patient-observation-list-input-modal',
  templateUrl: './patient-observation-list-input-modal.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonicModule,
    TemplateSelectionDirective,
    FormsModule,
    ReactiveFormsModule,
    PatientObservationListFormGroupComponent,
  ],
})
export class PatientObservationListInputModalPage {
  @Input({ required: true }) observations!: ObservationRootType[];
  @Input({ required: true }) subject!: Reference;
  @Input({ required: true }) encounter!: Reference;
  @Input() dateTime: string | Date = '';

  // ViewChild used to call openModal of TemplateSelectionDirective
  @ViewChild(TemplateSelectionDirective)
  templateSelection: TemplateSelectionDirective | undefined;

  public form: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    private notifications: NotificationsService,
    private modalController: ModalController,
  ) {
    this.form = this.fb.group({});
  }

  ionViewDidEnter(): void {
    if (this.templateSelection) {
      this.templateSelection.openModalOnInit();
    }
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
