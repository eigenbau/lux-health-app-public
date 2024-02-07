import { Component, Injector, Input, OnInit } from '@angular/core';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { AbstractFormGroupComponent } from '@form-groups/abstract-form-group/abstract-form-group.component';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map, takeUntil, tap } from 'rxjs/operators';
import { CustomValidatorsService } from '@core/forms/custom-validators.service';
import { PersonBundle, PersonRoles } from '@models/person-bundle.model';
import { AddressComponent } from './components/address/address.component';
import { TelecomComponent } from './components/telecom/telecom.component';
import { RelatedPersonComponent } from './components/related-person/related-person.component';
import { PractitionerIdentifierComponent } from './components/practitioner-identifier/practitioner-identifier.component';
import { PatientIdentifierComponent } from './components/patient-identifier/patient-identifier.component';
import { PatientDemographicsComponent } from './components/patient-demographics/patient-demographics.component';
import { PersonDemographicsComponent } from './components/person-demographics/person-demographics.component';
import { IonicModule } from '@ionic/angular';
import { NgIf, NgClass, AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-person-bundle-form-group',
  templateUrl: './person-bundle-form-group.component.html',
  standalone: true,
  imports: [
    NgIf,
    IonicModule,
    NgClass,
    PersonDemographicsComponent,
    PatientDemographicsComponent,
    PatientIdentifierComponent,
    PractitionerIdentifierComponent,
    RelatedPersonComponent,
    TelecomComponent,
    AddressComponent,
    AsyncPipe,
  ],
})
export class PersonBundleFormGroupComponent
  extends AbstractFormGroupComponent<PersonBundle>
  implements OnInit
{
  @Input()
  set initialPersonRoles(value: PersonRoles | undefined) {
    this._initialPersonRoles =
      value !== undefined ? value : this._defaultPersonRoles;
  }
  get initialPersonRoles(): PersonRoles {
    return this._initialPersonRoles || this._defaultPersonRoles;
  }

  private _defaultPersonRoles: PersonRoles = {
    patient: false,
    relatedPerson: false,
    practitioner: false,
  };

  private _initialPersonRoles: PersonRoles | undefined;

  // * Define AbstractControls
  public personFormGroup: UntypedFormGroup;
  public patientFormGroup: UntypedFormGroup;
  public practitionerFormGroup: UntypedFormGroup;

  public personRoles$: Observable<PersonRoles>;

  private personRolesBehaviourSubject$ = new BehaviorSubject<PersonRoles>(
    this.initialPersonRoles,
  );

  constructor(
    protected override injector: Injector,
    private customValidators: CustomValidatorsService,
  ) {
    super(injector);

    this.personFormGroup = this.fb.group({
      resourceType: 'Person',
      id: '',
      link: [],
    });
    this.patientFormGroup = this.fb.group({
      resourceType: 'Patient',
      id: '',
      birthDate: ['', Validators.required],
      maritalStatus: this.fb.group({
        coding: this.fb.array([{}], this.customValidators.arrayObjectNotEmpty),
      }),
    });
    this.practitionerFormGroup = this.fb.group({
      resourceType: 'Practitioner',
      id: '',
    });
    this.personRoles$ = this.personRolesBehaviourSubject$
      .asObservable()
      .pipe(distinctUntilChanged());
  }

  ngOnInit() {
    this.setControl('person', this.personFormGroup);
    this.toggleFormGroup('patient', this.patientFormGroup).subscribe();
    this.toggleFormGroup(
      'practitioner',
      this.practitionerFormGroup,
    ).subscribe();

    this.patchValueWhenFormReady({
      observablesToWaitFor: [],
    });
    this.setPersonRoles();
  }

  public setPersonRoles(
    personRoles: Partial<PersonRoles> = this.initialPersonRoles,
  ): void {
    const rolesMerged: PersonRoles = {
      ...this.personRolesBehaviourSubject$.value,
      ...personRoles,
    };

    const rolesCheckedAgainstPatchValue = {
      patient: this.patchValue?.patient
        ? !!this.patchValue.patient
        : rolesMerged.patient,
      relatedPerson: this.patchValue?.relatedPerson
        ? !!this.patchValue.relatedPerson
        : rolesMerged.relatedPerson,
      practitioner: this.patchValue?.practitioner
        ? !!this.patchValue.practitioner
        : rolesMerged.practitioner,
    };

    this.personRolesBehaviourSubject$.next({
      ...rolesCheckedAgainstPatchValue,
    });
    console.log(rolesCheckedAgainstPatchValue);
  }

  // Private methods
  private toggleFormGroup(
    formGroupName: 'patient' | 'practitioner',
    formGroup: UntypedFormGroup,
  ): Observable<boolean> {
    return this.personRoles$.pipe(
      map((personRoles) => personRoles[formGroupName]),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
      tap((toggle) => {
        if (toggle) {
          this.setControl(formGroupName, formGroup);
          if (!this.patchValue) {
            return;
          }
          const patch = this.patchValue[formGroupName];
          if (!patch) {
            return;
          }
          formGroup.patchValue(patch);
        }
        if (!toggle) {
          this.removeControl(formGroupName);
        }
      }),
    );
  }
}
