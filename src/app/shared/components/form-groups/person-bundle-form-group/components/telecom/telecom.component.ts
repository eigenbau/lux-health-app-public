import { Component, Injector, OnInit } from '@angular/core';
import {
  Validators,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormArray,
} from '@angular/forms';
import { AbstractFormGroupComponent } from '@form-groups/abstract-form-group/abstract-form-group.component';
import { IPerson } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPerson';
import { FormArrayHelper } from '@models/form-array-helper.model';
import { FormControlPipe } from '@pipes/form-control/form-control.pipe';
import { FormGroupPipe } from '@pipes/form-group/form-group.pipe';
import { LimitInputDirective } from '@directives/limit-input/limit-input.directive';
import { ValueSetSelectComponent } from '../../../../form-controls/value-set-select/value-set-select.component';
import { RemoveHostDirective } from '@directives/remove-host/remove-host.directive';
import { NgIf, NgFor } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-telecom',
  templateUrl: './telecom.component.html',
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
  ],
})
export class TelecomComponent
  extends AbstractFormGroupComponent<IPerson>
  implements OnInit
{
  // * Define AbstractControls
  public telecomFormArray: UntypedFormArray;

  // * Define FormArrayHelpers to access arrays for manipulation (push(), removeAt()) in the template
  public telecomFormArrayHelper: FormArrayHelper;

  constructor(protected override injector: Injector) {
    super(injector);

    // * Define AbstractControls
    this.telecomFormArray = this.fb.array([
      this.fb.group({
        system: ['', Validators.required],
        use: ['', Validators.required],
        value: ['', Validators.required],
      }),
    ]);

    // * Define FormArrayHelpers to access arrays for manipulation (push(), removeAt()) in the template
    this.telecomFormArrayHelper = new FormArrayHelper({
      formArray: this.telecomFormArray,
      startLength: 0,
      maxLength: 4,
    });
  }

  ngOnInit() {
    // * Set controls
    this.setControl('telecom', this.telecomFormArray);

    // * Set FormArray lengths with FormArrayHelper classes
    this.telecomFormArrayHelper.setLength(this.patchValue?.telecom?.length);

    // * Patch values
    this.patchValueWhenFormReady({
      callbackFunction: () => {
        if (this.patchValue?.telecom) {
          this.telecomFormArray.patchValue(this.patchValue.telecom);
        }
      },
    });
  }

  // Public methods
  public inputMode(type: string): 'tel' | 'email' | 'other' {
    if (['phone', 'fax', 'pager', 'sms'].indexOf(type) >= 0) {
      return 'tel';
    }
    if (['email'].indexOf(type) >= 0) {
      return 'email';
    }
    return 'other';
  }
}
