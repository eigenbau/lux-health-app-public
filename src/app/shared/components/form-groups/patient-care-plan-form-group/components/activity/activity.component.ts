import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  Validators,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormArray,
} from '@angular/forms';
import { AbstractFormGroupComponent } from '@form-groups/abstract-form-group/abstract-form-group.component';
import { IonTextarea, IonicModule } from '@ionic/angular';
import { ICarePlan } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/ICarePlan';
import { CustomValidatorsService } from '@core/forms/custom-validators.service';
import { FormArrayHelper } from '@models/form-array-helper.model';
import { FormControlPipe } from '@pipes/form-control/form-control.pipe';
import { FormGroupPipe } from '@pipes/form-group/form-group.pipe';
import { ValueSetSelectComponent } from '../../../../form-controls/value-set-select/value-set-select.component';
import { ReferenceSelectComponent } from '../../../../form-controls/reference-select/reference-select.component';
import { RemoveHostDirective } from '@directives/remove-host/remove-host.directive';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonicModule,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    RemoveHostDirective,
    ReferenceSelectComponent,
    ValueSetSelectComponent,
    FormGroupPipe,
    FormControlPipe,
  ],
})
export class ActivityComponent
  extends AbstractFormGroupComponent<ICarePlan>
  implements OnInit
{
  @ViewChild(IonTextarea) description: IonTextarea | undefined;
  public activeIndex: number = -1;

  // * Define AbstractControls
  public activityFormArray: UntypedFormArray;

  // * Define FormArrayHelpers to access arrays for manipulation (push(), removeAt()) in the template
  public activityFormArrayHelper: FormArrayHelper;

  constructor(
    protected override injector: Injector,
    private customValidators: CustomValidatorsService,
  ) {
    super(injector);

    this.activityFormArray = this.fb.array([
      this.fb.group({
        // progress: this.fb.array([this.fb.control('', Validators.required)]),
        detail: this.fb.group({
          code: [{}, this.customValidators.codeableConceptNotEmpty],
          status: ['in-progress', Validators.required],
          goal: ['', Validators.required],
          description: [''],
        }),
      }),
    ]);

    this.activityFormArrayHelper = new FormArrayHelper({
      formArray: this.activityFormArray,
      startLength: 1,
      maxLength: 10,
    });
  }
  ngOnInit() {
    // * Set controls
    this.setControl('activity', this.activityFormArray);

    // * Set FormArray lengths with FormArrayHelper classes
    this.activityFormArrayHelper.setLength(this.patchValue?.activity?.length);

    // * Patch values
    this.patchValueWhenFormReady({
      //observablesToWaitFor: [this.ionTextareaReady$],
      callbackFunction: () => {
        if (this.patchValue?.activity)
          this.activityFormArray.patchValue(this.patchValue.activity);
      },
    });
  }

  public toggleInput(index: number): void {
    this.activeIndex = this.activeIndex === index ? -1 : index;
  }
}
