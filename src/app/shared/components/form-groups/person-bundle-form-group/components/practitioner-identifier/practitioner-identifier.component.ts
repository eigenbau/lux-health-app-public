import { Component, Injector, OnInit } from '@angular/core';
import {
  Validators,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormArray,
} from '@angular/forms';
import { AbstractFormGroupComponent } from '@form-groups/abstract-form-group/abstract-form-group.component';
import { IPractitioner } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPractitioner';
import { CustomValidatorsService } from '@core/forms/custom-validators.service';
import { FormArrayHelper } from '@models/form-array-helper.model';
import { FormControlPipe } from '@pipes/form-control/form-control.pipe';
import { FormGroupPipe } from '@pipes/form-group/form-group.pipe';
import { ValueSetSelectComponent } from '../../../../form-controls/value-set-select/value-set-select.component';
import { RemoveHostDirective } from '@directives/remove-host/remove-host.directive';
import { NgIf, NgFor } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-practitioner-identifier',
  templateUrl: './practitioner-identifier.component.html',
  standalone: true,
  imports: [
    IonicModule,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    RemoveHostDirective,
    ValueSetSelectComponent,
    FormGroupPipe,
    FormControlPipe,
  ],
})
export class PractitionerIdentifierComponent
  extends AbstractFormGroupComponent<IPractitioner>
  implements OnInit
{
  // * Define FormAbstractControls
  // * * These should follow a FHIR resource schema
  public identifierFormArray: UntypedFormArray;

  // * Define FormArrayHelpers to access arrays for manipulation (push(), removeAt()) in the template
  public identifierFormArrayHelper: FormArrayHelper;

  constructor(
    protected override injector: Injector,
    private customValidators: CustomValidatorsService,
  ) {
    super(injector);

    this.identifierFormArray = this.fb.array([
      this.fb.group({
        type: this.fb.control({}, this.customValidators.objectNotEmpty),
        value: ['', Validators.required],
      }),
    ]);

    // * Define FormArrayHelpers to access arrays for manipulation (push(), removeAt()) in the template
    this.identifierFormArrayHelper = new FormArrayHelper({
      formArray: this.identifierFormArray,
      startLength: 0,
      maxLength: 4,
    });
  }

  ngOnInit() {
    // * Set all controls
    this.setControl('identifier', this.identifierFormArray);

    // * Set FormArray lengths with FormArrayHelper classes
    this.identifierFormArrayHelper.setLength(
      this.patchValue?.identifier?.length,
    );

    // * PatchValues
    this.patchValueWhenFormReady({
      callbackFunction: () => {
        if (this.patchValue?.identifier) {
          this.identifierFormArray.patchValue(this.patchValue.identifier);
        }
      },
    });
  }
}
