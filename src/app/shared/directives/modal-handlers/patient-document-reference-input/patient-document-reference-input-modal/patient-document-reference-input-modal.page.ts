import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  UntypedFormBuilder,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
} from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { IDocumentReference } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IDocumentReference';
import { Observable, startWith, distinctUntilChanged } from 'rxjs';
import { FileStorageService } from '@core/firebase/file-storage-service.service';
import { NotificationsService } from '@core/notifications/notifications.service';
import { PatientDocumentReferenceFormGroupComponent } from '@form-groups/patient-document-reference-form-group/patient-document-reference-form-group.component';
import { NgIf, AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-patient-document-reference-input-modal',
  templateUrl: './patient-document-reference-input-modal.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonicModule,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    PatientDocumentReferenceFormGroupComponent,
    AsyncPipe,
  ],
})
export class PatientDocumentReferenceInputModalPage {
  @Input({ required: true }) documentReference!: IDocumentReference;
  @Input() dateTime: string | Date = '';

  public documentReference$: Observable<IDocumentReference>;

  public form: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    private notifications: NotificationsService,
    private fileStorage: FileStorageService,
    public modalController: ModalController,
  ) {
    this.form = this.fb.group({});

    this.documentReference$ = this.form.valueChanges.pipe(
      startWith(this.documentReference),
      distinctUntilChanged(),
    );
  }

  // Public methods
  public onSubmit(): void {
    this.modalController.dismiss({
      bundle: this.form.value,
    });
  }

  public closeModal(fileName: string): void {
    this.notifications.presentAlertCancelAndCloseModal(async () => {
      // Delete file before dismissing input modal if no related DocumentReference resource exists
      if (!this.form.value.id) {
        await this.fileStorage.deleteFile(fileName);
      }
      this.modalController.dismiss();
    });
  }
}
