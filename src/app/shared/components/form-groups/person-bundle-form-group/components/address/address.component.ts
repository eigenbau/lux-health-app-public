import { Component, Injector, OnInit } from '@angular/core';
import {
  UntypedFormArray,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { AbstractFormGroupComponent } from '@form-groups/abstract-form-group/abstract-form-group.component';
import { IPerson } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPerson';
import { FormArrayHelper } from '@models/form-array-helper.model';
import { FormArrayPipe } from '@pipes/form-array/form-array.pipe';
import { FormControlPipe } from '@pipes/form-control/form-control.pipe';
import { FormGroupPipe } from '@pipes/form-group/form-group.pipe';
import { LimitInputDirective } from '@directives/limit-input/limit-input.directive';
import { ValueSetSelectComponent } from '../../../../form-controls/value-set-select/value-set-select.component';
import { RemoveHostDirective } from '@directives/remove-host/remove-host.directive';
import { NgIf, NgFor } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  standalone: true,
  imports: [
    IonicModule,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    RemoveHostDirective,
    ValueSetSelectComponent,
    LimitInputDirective,
    FormGroupPipe,
    FormControlPipe,
    FormArrayPipe,
  ],
})
export class AddressComponent
  extends AbstractFormGroupComponent<IPerson>
  implements OnInit
{
  // * Define AbstractControls
  public addressFormArray: UntypedFormArray;

  // * Define FormArrayHelpers to access arrays for manipulation (push(), removeAt()) in the template
  public addressFormArrayHelper: FormArrayHelper;

  constructor(protected override injector: Injector) {
    super(injector);

    this.addressFormArray = this.fb.array([
      this.fb.group({
        use: [null, Validators.required],
        line: this.fb.array([this.fb.control('', Validators.required)]),
        city: [null, Validators.required],
        state: [null],
        postalCode: [null],
        country: ['CAN'],
      }),
    ]);

    this.addressFormArrayHelper = new FormArrayHelper({
      formArray: this.addressFormArray,
      startLength: 0,
      maxLength: 2,
    });
  }

  ngOnInit() {
    // * Set controls
    this.setControl('address', this.addressFormArray);

    // * Set FormArray lengths with FormArrayHelper classes
    this.addressFormArrayHelper.setLength(this.patchValue?.address?.length);

    // * Patch values
    this.patchValueWhenFormReady({
      callbackFunction: () => {
        if (this.patchValue?.address) {
          this.addressFormArray.patchValue(this.patchValue.address);
        }
      },
    });
  }

  // Public methods
  public addLine(index: number): void {
    const formArray = this.addressFormArray.get([
      index,
      'line',
    ]) as UntypedFormArray;
    if (formArray.length > 1) {
      return;
    }
    formArray.push(this.fb.control('', Validators.required));
  }

  public deleteLine(index: number, i: number): void {
    const formArray = this.addressFormArray.get([
      index,
      'line',
    ]) as UntypedFormArray;
    if (formArray.length < 2) {
      return;
    }
    formArray.removeAt(i);
  }
}
