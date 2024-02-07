import { Component, Injector, OnInit } from '@angular/core';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { AbstractFormGroupComponent } from '@form-groups/abstract-form-group/abstract-form-group.component';
import { IPatient } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPatient';
import { formatISO } from 'date-fns';
import { takeUntil, tap } from 'rxjs/operators';
import { CustomValidatorsService } from '@core/forms/custom-validators.service';
import { formatDate } from '@core/utils/date-number-functions';
import { FormControlPipe } from '@pipes/form-control/form-control.pipe';
import { ValueSetSelectComponent } from '../../../../form-controls/value-set-select/value-set-select.component';
import { DatetimeInputComponent } from '../../../../form-controls/datetime-input/datetime-input.component';
import { RemoveHostDirective } from '@directives/remove-host/remove-host.directive';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-patient-demographics',
  templateUrl: './patient-demographics.component.html',
  standalone: true,
  imports: [
    IonicModule,
    RemoveHostDirective,
    DatetimeInputComponent,
    ValueSetSelectComponent,
    FormControlPipe,
  ],
})
export class PatientDemographicsComponent
  extends AbstractFormGroupComponent<IPatient>
  implements OnInit
{
  public now = formatISO(new Date());

  // * Define FormAbstractControls
  // * * These should follow a FHIR resource schema
  public patientFormGroup: UntypedFormGroup;

  public formatDatePublic = formatDate;

  constructor(
    protected override injector: Injector,
    private customValidators: CustomValidatorsService,
  ) {
    super(injector);

    this.patientFormGroup = this.fb.group({
      birthDate: ['', Validators.required],
      maritalStatus: this.fb.control({}, this.customValidators.objectNotEmpty),
    });
  }
  ngOnInit() {
    // * Set all controls
    this.setIndividualControls(this.patientFormGroup);

    // * PatchValues
    this.patchValueWhenFormReady();

    this.patientFormGroup
      .get('birthDate')
      ?.valueChanges.pipe(
        takeUntil(this.destroy$),
        tap(() => this.patchBirthDate()),
      )
      .subscribe();
  }

  // Public methods
  patchBirthDate(): void {
    if (typeof this.patientFormGroup.get('birthDate')?.value !== 'string') {
      return;
    }
    this.patientFormGroup
      .get('birthDate')
      ?.patchValue(
        this.patientFormGroup.get('birthDate')?.value.substr(0, 10),
        {
          emitEvent: false,
        },
      );
  }
}
