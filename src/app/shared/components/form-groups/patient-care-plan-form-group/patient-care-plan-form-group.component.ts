import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnInit,
} from '@angular/core';
import {
  Validators,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
  UntypedFormArray,
} from '@angular/forms';
import { AbstractFormGroupComponent } from '@form-groups/abstract-form-group/abstract-form-group.component';
import { ModalController, IonicModule } from '@ionic/angular';
import { ICarePlan } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/ICarePlan';
import { formatISO } from 'date-fns';
import { CARE_PLAN_CATEGORY } from '@core/config/fhir.constants';
import { CustomValidatorsService } from '@core/forms/custom-validators.service';
import { FormHelperService } from '@core/forms/form-helper.service';
import { FormArrayHelper } from '@models/form-array-helper.model';
import { FormControlPipe } from '@pipes/form-control/form-control.pipe';
import { FormGroupPipe } from '@pipes/form-group/form-group.pipe';
import { ActivityComponent } from './components/activity/activity.component';
import { NgFor } from '@angular/common';
import { DatetimeInputComponent } from '../../form-controls/datetime-input/datetime-input.component';
import { ValueSetSelectComponent } from '../../form-controls/value-set-select/value-set-select.component';
import { RemoveHostDirective } from '@directives/remove-host/remove-host.directive';

@Component({
  selector: 'app-patient-care-plan-form-group',
  templateUrl: './patient-care-plan-form-group.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonicModule,
    RemoveHostDirective,
    ValueSetSelectComponent,
    DatetimeInputComponent,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    ActivityComponent,
    FormGroupPipe,
    FormControlPipe,
  ],
})
export class PatientCarePlanFormGroupComponent
  extends AbstractFormGroupComponent<ICarePlan>
  implements OnInit
{
  @Input() lines: 'full' | 'inset' | 'none' = 'full';

  public now = formatISO(new Date());

  // * Define AbstractControls
  public carePlanFormGroup: UntypedFormGroup;
  public noteFormArray: UntypedFormArray;

  // * Use the FormArrayHelper class module to reference FormArrays
  //   that require access for array manipulation in the template
  public noteFormArrayHelper: FormArrayHelper;

  constructor(
    protected override injector: Injector,
    private customValidators: CustomValidatorsService,
    public modalController: ModalController,
    private cd: ChangeDetectorRef,
  ) {
    super(injector);

    this.carePlanFormGroup = this.fb.group({
      resourceType: 'CarePlan',
      id: '',
      subject: [{}, this.customValidators.objectNotEmpty],
      status: ['active', Validators.required],
      intent: 'plan',
      category: [[CARE_PLAN_CATEGORY]],
      period: this.fb.group({
        start: [this.now, Validators.required],
        end: [this.now, Validators.required],
      }),
    });

    this.noteFormArray = this.fb.array([
      this.fb.group({
        time: formatISO(new Date()),
        text: ['', Validators.required],
      }),
    ]);

    this.noteFormArrayHelper = new FormArrayHelper({
      formArray: this.noteFormArray,
      startLength: 0,
      maxLength: 1,
    });
  }
  ngOnInit() {
    // * Set controls
    this.setIndividualControls(this.carePlanFormGroup);
    this.setControl('note', this.noteFormArray);

    // * Set FormArray lengths with FormArrayHelper classes method setLength()
    this.noteFormArrayHelper.setLength(this.patchValue?.note?.length);

    // * PatchValues
    this.patchValueWhenFormReady({
      //observablesToWaitFor: [this.ionTextareaReady$],
    });
  }

  public toggleNote(): void {
    const length = this.noteFormArray.length;
    if (length === 0) {
      this.noteFormArrayHelper.push();
    }
    if (length > 0) {
      this.noteFormArrayHelper.resetLength();
    }
    this.cd.detectChanges();
  }
}
