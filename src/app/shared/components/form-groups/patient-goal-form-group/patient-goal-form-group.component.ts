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
  UntypedFormControl,
  UntypedFormArray,
} from '@angular/forms';
import { AbstractFormGroupComponent } from '@form-groups/abstract-form-group/abstract-form-group.component';
import { ModalController, IonicModule } from '@ionic/angular';
import { ICondition } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/ICondition';
import { IEncounter } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IEncounter';
import { IGoal } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IGoal';
import { formatISO } from 'date-fns';
import { map, Observable, of, startWith, takeUntil, tap } from 'rxjs';
import {
  GOAL_CATEGORY,
  GOAL_TARGET_MEASURE,
} from '@core/config/fhir.constants';
import { CustomValidatorsService } from '@core/forms/custom-validators.service';
import { FormHelperService } from '@core/forms/form-helper.service';
import { FormArrayHelper } from '@models/form-array-helper.model';
import { FormControlPipe } from '@pipes/form-control/form-control.pipe';
import { FormGroupPipe } from '@pipes/form-group/form-group.pipe';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { ValueSetSelectComponent } from '../../form-controls/value-set-select/value-set-select.component';
import { DatetimeInputComponent } from '../../form-controls/datetime-input/datetime-input.component';
import { ReferenceSelectComponent } from '../../form-controls/reference-select/reference-select.component';
import { RemoveHostDirective } from '@directives/remove-host/remove-host.directive';

@Component({
  selector: 'app-patient-goal-form-group',
  templateUrl: './patient-goal-form-group.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    RemoveHostDirective,
    ReferenceSelectComponent,
    DatetimeInputComponent,
    ValueSetSelectComponent,
    NgIf,
    NgFor,
    AsyncPipe,
    FormGroupPipe,
    FormControlPipe,
  ],
})
export class PatientGoalFormGroupComponent
  extends AbstractFormGroupComponent<IGoal>
  implements OnInit
{
  @Input() lines: 'full' | 'inset' | 'none' = 'full';

  public now = formatISO(new Date(), { representation: 'date' });

  // * Define AbstractControls
  public goalFormGroup: UntypedFormGroup;

  public achievementStatusFormControl: UntypedFormControl;

  public noteFormArray: UntypedFormArray;

  // * Use the FormArrayHelper class module to reference FormArrays
  //   that require access for array manipulation in the template
  public noteFormArrayHelper: FormArrayHelper;

  public showAchieventStatus$: Observable<boolean> = of(false);

  private lifecycleStatus$: Observable<IGoal['lifecycleStatus']> | undefined;

  constructor(
    protected override injector: Injector,
    private customValidators: CustomValidatorsService,
    private cd: ChangeDetectorRef,
    public modalController: ModalController,
  ) {
    super(injector);

    this.goalFormGroup = this.fb.group({
      resourceType: 'Goal',
      id: '',
      subject: [{}, this.customValidators.objectNotEmpty],
      lifecycleStatus: ['proposed', Validators.required],
      category: [[GOAL_CATEGORY]],
      description: [{}, this.customValidators.codeableConceptNotEmpty],
      startDate: [this.now, Validators.required],
      addresses: this.fb.array([this.fb.control('', Validators.required)]),
      target: this.fb.array([
        this.fb.group({
          measure: GOAL_TARGET_MEASURE,
          detailString: ['', Validators.required],
        }),
      ]),
    });

    this.achievementStatusFormControl = this.fb.control(
      {},
      this.customValidators.codeableConceptNotEmpty,
    );

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

    this.goalFormGroup.valueChanges
      .pipe(tap((v) => console.log(v?.startDate)))
      .subscribe();
  }

  ngOnInit() {
    // * Set controls
    this.setIndividualControls(this.goalFormGroup);
    this.setControl('note', this.noteFormArray);

    // * Set FormArray lengths with FormArrayHelper classes method setLength()
    this.noteFormArrayHelper.setLength(this.patchValue?.note?.length);

    // * PatchValues
    this.patchValueWhenFormReady();

    // * Toggle AchievementStatus depending on LifecycleStatus
    const livecycleStatusAbstractControl =
      this.goalFormGroup.get('lifecycleStatus');
    if (livecycleStatusAbstractControl) {
      this.lifecycleStatus$ = livecycleStatusAbstractControl.valueChanges.pipe(
        startWith(livecycleStatusAbstractControl.value),
      );
      this.showAchieventStatus$ = this.lifecycleStatus$.pipe(
        takeUntil(this.destroy$),
        map(
          (lifecycleStatus) =>
            !lifecycleStatus ||
            ['proposed', 'planned', 'entered-in-error', 'rejected'].indexOf(
              lifecycleStatus,
            ) < 0,
        ),
        tap((showAchieventStatus) =>
          this.showAchievementStatus(showAchieventStatus),
        ),
      );
    }
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

  public onResourcesSelected(resources: (IGoal | ICondition | IEncounter)[]) {
    this.goalFormGroup
      .get('description')
      ?.setValue((resources[0] as ICondition)?.code);
  }

  // Private methods
  private showAchievementStatus(show: boolean): void {
    if (!show) {
      return this.removeControl('achievementStatus');
    }
    this.setControl('achievementStatus', this.achievementStatusFormControl);
    this.achievementStatusFormControl.patchValue(
      this.patchValue?.achievementStatus,
    );
  }
}
