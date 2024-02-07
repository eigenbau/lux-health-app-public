import { Component, Injector, Input, OnInit } from '@angular/core';
import {
  Validators,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormArray,
} from '@angular/forms';
import { AbstractFormGroupComponent } from '@form-groups/abstract-form-group/abstract-form-group.component';
import { IRelatedPerson } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IRelatedPerson';
import { CustomValidatorsService } from '@core/forms/custom-validators.service';
import { FormArrayHelper } from '@models/form-array-helper.model';
import { FormControlPipe } from '@pipes/form-control/form-control.pipe';
import { FormGroupPipe } from '@pipes/form-group/form-group.pipe';
import { PersonSelectComponent } from '../../../../form-controls/person-select/person-select.component';
import { ValueSetSelectComponent } from '../../../../form-controls/value-set-select/value-set-select.component';
import { RemoveHostDirective } from '@directives/remove-host/remove-host.directive';
import { NgIf, NgFor } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-related-person',
  templateUrl: './related-person.component.html',
  standalone: true,
  imports: [
    IonicModule,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    RemoveHostDirective,
    ValueSetSelectComponent,
    PersonSelectComponent,
    FormGroupPipe,
    FormControlPipe,
  ],
})
export class RelatedPersonComponent
  extends AbstractFormGroupComponent<IRelatedPerson[]>
  implements OnInit
{
  @Input() personId = '';

  // * Define AbstractControls
  public relatedPersonFormArray: UntypedFormArray;

  // * Define FormArrayHelpers to access arrays for manipulation (push(), removeAt()) in the template
  public relatedPersonFormArrayHelper: FormArrayHelper;

  constructor(
    protected override injector: Injector,
    private customValidators: CustomValidatorsService,
  ) {
    super(injector);

    this.relatedPersonFormArray = this.fb.array(
      [
        this.fb.group({
          resourceType: 'RelatedPerson',
          id: '',
          patient: this.fb.control(
            {},
            {
              validators: this.customValidators.objectNotEmpty,
            },
          ),
          relationship: this.fb.array([
            this.fb.control({}, this.customValidators.objectNotEmpty),
          ]),
        }),
      ],
      Validators.required,
    );

    this.relatedPersonFormArrayHelper = new FormArrayHelper({
      formArray: this.relatedPersonFormArray,
      startLength: 0,
      maxLength: 4,
    });
  }

  ngOnInit() {
    // * Set controls
    this.setControl('relatedPerson', this.relatedPersonFormArray);

    // * Set FormArray lengths with FormArrayHelper classes
    this.relatedPersonFormArrayHelper.setLength(this.patchValue?.length);

    // * Patch values
    this.patchValueWhenFormReady({
      callbackFunction: () => {
        if (this.patchValue) {
          this.relatedPersonFormArray.patchValue(this.patchValue);
        }
      },
    });
  }

  // Public methods
  public readOnly(i: number): boolean {
    return !!this.fh.getControl(this.relatedPersonFormArray, [i, 'id']).value;
  }
}
