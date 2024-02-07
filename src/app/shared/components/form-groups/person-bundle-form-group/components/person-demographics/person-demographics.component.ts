import { Component, Injector, OnInit } from '@angular/core';
import {
  Validators,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
} from '@angular/forms';
import { AbstractFormGroupComponent } from '@form-groups/abstract-form-group/abstract-form-group.component';
import { IPerson } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPerson';
import { FormArrayHelper } from '@models/form-array-helper.model';
import { FormArrayPipe } from '@pipes/form-array/form-array.pipe';
import { FormControlPipe } from '@pipes/form-control/form-control.pipe';
import { FormGroupPipe } from '@pipes/form-group/form-group.pipe';
import { ValueSetSelectComponent } from '../../../../form-controls/value-set-select/value-set-select.component';
import { RemoveHostDirective } from '@directives/remove-host/remove-host.directive';
import { LimitInputDirective } from '@directives/limit-input/limit-input.directive';
import { IonicModule } from '@ionic/angular';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-person-demographics',
  templateUrl: './person-demographics.component.html',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    IonicModule,
    NgIf,
    LimitInputDirective,
    RemoveHostDirective,
    ValueSetSelectComponent,
    FormGroupPipe,
    FormControlPipe,
    FormArrayPipe,
  ],
})

// * Match AbstractFormGroup typing and patchValue structure to the FormGroup of this sub component
export class PersonDemographicsComponent
  extends AbstractFormGroupComponent<IPerson>
  implements OnInit
{
  // * Define and collect arrays for select lists
  public prefixes = ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof'];

  // * Define FormAbstractControls
  // * * These should follow a FHIR resource schema
  public nameFormArray: UntypedFormArray;

  public genderFormControl: UntypedFormControl;

  // * Use the FormArrayHelper class module to reference FormArrays
  //   that require access for array manipulation in the template
  public givenFormArrayHelper: FormArrayHelper;

  constructor(protected override injector: Injector) {
    super(injector);

    this.nameFormArray = this.fb.array([
      this.fb.group({
        use: ['official'],
        family: ['', Validators.required],
        given: this.fb.array([this.fb.control('', Validators.required)]),
        prefix: this.fb.array([this.fb.control('', Validators.required)]),
      }),
    ]);

    this.genderFormControl = this.fb.control('', Validators.required);

    this.givenFormArrayHelper = new FormArrayHelper({
      formArray: this.fh.getArray(this.nameFormArray, ['0', 'given']),
      startLength: 1,
      maxLength: 2,
    });
  }

  ngOnInit(): void {
    // * Set all controls
    this.setControl('name', this.nameFormArray);
    this.setControl('gender', this.genderFormControl);

    // * Set FormArray lengths with FormArrayHelper classes method setLength()
    this.givenFormArrayHelper.setLength(
      this.patchValue?.name?.[0]?.given?.length,
    );

    // * PatchValues
    this.patchValueWhenFormReady({
      callbackFunction: () => {
        if (this.patchValue?.name) {
          this.nameFormArray.patchValue(this.patchValue.name);
        }
        if (this.patchValue?.gender) {
          this.genderFormControl.patchValue(this.patchValue.gender);
        }
      },
    });
  }
}
