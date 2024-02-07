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
import { CodeableConcept } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/codeableConcept';
import { Reference } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/reference';
import { ICondition } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/ICondition';
import { formatISO } from 'date-fns';
import {
  BehaviorSubject,
  distinctUntilChanged,
  map,
  Observable,
  of,
  startWith,
  takeUntil,
  tap,
} from 'rxjs';
import {
  CONDITION_CATEGORY,
  CONDITION_CLINICAL_STATUS_DEFAULT,
  CONDITION_VERIFICATION_STATUS_DEFAULT,
} from '@core/config/fhir.constants';
import { CustomValidatorsService } from '@core/forms/custom-validators.service';
import { codeableConceptHasCode } from '@core/utils/fhir/codeable-concept-functions';
import { objectHasKeys } from '@core/utils/object-functions';
import { FormArrayHelper } from '@models/form-array-helper.model';
import { FormControlPipe } from '@pipes/form-control/form-control.pipe';
import { FormGroupPipe } from '@pipes/form-group/form-group.pipe';
import { DatetimeInputComponent } from '../../form-controls/datetime-input/datetime-input.component';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { ValueSetSelectComponent } from '../../form-controls/value-set-select/value-set-select.component';
import { RemoveHostDirective } from '@directives/remove-host/remove-host.directive';

@Component({
  selector: 'app-patient-condition-form-group',
  templateUrl: './patient-condition-form-group.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonicModule,
    RemoveHostDirective,
    ValueSetSelectComponent,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    NgIf,
    DatetimeInputComponent,
    AsyncPipe,
    FormGroupPipe,
    FormControlPipe,
  ],
})
export class PatientConditionFormGroupComponent
  extends AbstractFormGroupComponent<ICondition>
  implements OnInit
{
  @Input() lines: 'full' | 'inset' | 'none' = 'full';

  public readonly linkEncounter$ = new BehaviorSubject<boolean>(false);
  public showOnsetDateTime$: Observable<boolean> = of(false);
  public showAbatementDateTime$: Observable<boolean> = of(false);

  public encounter: Reference | undefined = undefined;

  public now = formatISO(new Date());

  // * Define AbstractControls
  public conditionFormGroup: UntypedFormGroup;
  public onsetDateTimeFormControl: UntypedFormControl;
  public abatementDateTimeFormControl: UntypedFormControl;
  public bodySiteFormArray: UntypedFormArray;
  public noteFormArray: UntypedFormArray;

  // * Use the FormArrayHelper class module to reference FormArrays
  //   that require access for array manipulation in the template
  public bodySiteFormArrayHelper: FormArrayHelper;

  public noteFormArrayHelper: FormArrayHelper;

  private clinicalStatus$: Observable<CodeableConcept> | undefined;

  constructor(
    protected override injector: Injector,
    private customValidators: CustomValidatorsService,
    private cd: ChangeDetectorRef,
    public modalController: ModalController,
  ) {
    super(injector);

    this.conditionFormGroup = this.fb.group({
      resourceType: 'Condition',
      clinicalStatus: [
        CONDITION_CLINICAL_STATUS_DEFAULT,
        this.customValidators.codeableConceptNotEmpty,
      ],
      verificationStatus: [
        CONDITION_VERIFICATION_STATUS_DEFAULT,
        this.customValidators.codeableConceptNotEmpty,
      ],
      category: [[CONDITION_CATEGORY]],
      code: [{}, this.customValidators.objectNotEmpty],
      id: '',
      subject: [{}, this.customValidators.objectNotEmpty],
      encounter: [{}],
    });

    this.onsetDateTimeFormControl = this.fb.control(
      this.now,
      Validators.required,
    );

    this.abatementDateTimeFormControl = this.fb.control(
      this.now,
      Validators.required,
    );

    this.bodySiteFormArray = this.fb.array([
      this.fb.control(
        {},
        {
          validators: this.customValidators.codeableConceptNotEmpty,
        },
      ),
    ]);

    this.noteFormArray = this.fb.array([
      this.fb.group({
        time: formatISO(new Date()),
        text: ['', Validators.required],
      }),
    ]);
    // * Use the FormArrayHelper class module to reference FormArrays
    //   that require access for array manipulation in the template
    this.bodySiteFormArrayHelper = new FormArrayHelper({
      formArray: this.bodySiteFormArray,
      startLength: 0,
      maxLength: 1,
    });

    this.noteFormArrayHelper = new FormArrayHelper({
      formArray: this.noteFormArray,
      startLength: 0,
      maxLength: 1,
    });
  }

  ngOnInit(): void {
    // * Set controls
    this.setIndividualControls(this.conditionFormGroup);
    this.setControl('note', this.noteFormArray);
    this.setControl('bodySite', this.bodySiteFormArray);
    if (objectHasKeys(this.patchValue, ['onsetDateTime'])) {
      this.showOnsetDateTime(true);
    }
    if (objectHasKeys(this.patchValue, ['abatementDateTime'])) {
      this.showAbatementDateTime(true);
    }

    // * Set FormArray lengths with FormArrayHelper classes method setLength()
    this.bodySiteFormArrayHelper.setLength(this.patchValue?.bodySite?.length);
    this.noteFormArrayHelper.setLength(this.patchValue?.note?.length);

    // * PatchValues
    this.patchValueWhenFormReady();

    // * Observe encounter link
    if (this.patchValue?.encounter) {
      this.encounter = this.patchValue.encounter;
    }
    this.linkEncounter$.next(!!this.encounter?.reference);

    this.linkEncounter$
      .pipe(
        takeUntil(this.destroy$),
        tap(
          (link) =>
            this.conditionFormGroup
              .get('encounter')
              ?.setValue(link ? this.encounter : {}),
        ),
      )
      .subscribe();

    this.showOnsetDateTime$ = this.observeFormData().pipe(
      map(() => this.hasControl('onsetDateTime')),
      distinctUntilChanged(),
    );

    // * Toggle AbatementDateTime depending on ClinicalStatus
    // * https://www.hl7.org/fhir/condition.html#invs Rule: cons-4
    const clinicalStatusAbstractControl =
      this.conditionFormGroup.get('clinicalStatus');
    if (clinicalStatusAbstractControl) {
      this.clinicalStatus$ = clinicalStatusAbstractControl.valueChanges.pipe(
        startWith(clinicalStatusAbstractControl.value),
      );
      this.showAbatementDateTime$ = this.clinicalStatus$.pipe(
        map((cc) =>
          codeableConceptHasCode(cc, ['resolved', 'remission', 'inactive']),
        ),
        tap((showAbatementDateTime) =>
          this.showAbatementDateTime(showAbatementDateTime),
        ),
      );
    }
  }

  public toogleOnsetDateTime(): void {
    this.showOnsetDateTime(!this.hasControl('onsetDateTime'));
  }

  public toggleBodySite(): void {
    const length = this.bodySiteFormArray.length;
    if (length === 0) {
      this.bodySiteFormArrayHelper.push();
    }
    if (length > 0) {
      this.bodySiteFormArrayHelper.resetLength();
    }
    this.cd.detectChanges();
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

  public toggleEncounterLink(): void {
    this.linkEncounter$.next(!this.linkEncounter$.getValue());
    this.notifications.showSuccess(
      this.linkEncounter$.getValue()
        ? 'Encounter linked!'
        : 'Encounter unlinked!',
    );
  }

  // Private methods
  private showOnsetDateTime(show: boolean): void {
    if (!show) {
      return this.removeControl('onsetDateTime');
    }
    this.setControl('onsetDateTime', this.onsetDateTimeFormControl);
  }

  private showAbatementDateTime(show: boolean): void {
    if (!show) {
      return this.removeControl('abatementDateTime');
    }
    this.setControl('abatementDateTime', this.abatementDateTimeFormControl);
  }
}
