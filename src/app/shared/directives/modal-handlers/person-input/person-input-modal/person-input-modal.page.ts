import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PersonBundle, PersonRoles } from '@models/person-bundle.model';
import { ModalController, IonicModule } from '@ionic/angular';
import {
  UntypedFormBuilder,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { IPerson } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPerson';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { NotificationsService } from '@core/notifications/notifications.service';
import { NamePipe } from '@pipes/name/name.pipe';
import { PersonBundleFormGroupComponent } from '@form-groups/person-bundle-form-group/person-bundle-form-group.component';
import { NgIf, AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-person-input-modal',
  templateUrl: './person-input-modal.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonicModule,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    PersonBundleFormGroupComponent,
    AsyncPipe,
    NamePipe,
  ],
})
export class PersonInputModalPage {
  @Input() personBundle: PersonBundle | undefined;
  @Input() initialPersonRoles: PersonRoles | undefined;

  public form: UntypedFormGroup;

  public person$: Observable<IPerson>;

  constructor(
    private modalController: ModalController,
    private fb: UntypedFormBuilder,
    private notifications: NotificationsService,
  ) {
    this.form = this.fb.group({});

    this.person$ = this.form.valueChanges.pipe(
      startWith(this.personBundle),
      map((personBundle) => (personBundle ? personBundle.person : undefined)),
      distinctUntilChanged(),
    );
  }

  // Public methods
  public onSubmit(): void {
    this.modalController.dismiss({
      personBundle: this.form.value as PersonBundle,
    });
  }

  public closeModal(): void {
    this.notifications.presentAlertCancelAndCloseModal();
  }
}
