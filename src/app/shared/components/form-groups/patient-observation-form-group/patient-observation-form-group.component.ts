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
import { IObservation } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IObservation';
import { formatISO } from 'date-fns';
import { BehaviorSubject, Observable, takeUntil, tap } from 'rxjs';
import {
  BODY_SITE_LEFT_SIDE,
  BODY_SITE_RIGHT_SIDE,
} from '@core/config/fhir.constants';
import { CustomValidatorsService } from '@core/forms/custom-validators.service';
import { FormHelperService } from '@core/forms/form-helper.service';
import { numberSequence } from '@core/utils/date-number-functions';
import { codeableConceptsMatch } from '@core/utils/fhir/codeable-concept-functions';
import { objectHasKeys } from '@core/utils/object-functions';
import { FormArrayHelper } from '@models/form-array-helper.model';
import { FormControlPipe } from '@pipes/form-control/form-control.pipe';
import { FormGroupPipe } from '@pipes/form-group/form-group.pipe';
import { AbreviateByListComparePipe } from '@pipes/abreviate-by-list-compare/abreviate-by-list-compare.pipe';
import { DatetimeInputComponent } from '../../form-controls/datetime-input/datetime-input.component';
import { ValueSetSelectComponent } from '../../form-controls/value-set-select/value-set-select.component';
import { RemoveHostDirective } from '@directives/remove-host/remove-host.directive';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { ValueXFormGroupComponent } from '../value-x-form-group/value-x-form-group.component';

@Component({
  selector: 'app-patient-observation-form-group',
  templateUrl: './patient-observation-form-group.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonicModule,
    ValueXFormGroupComponent,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    NgIf,
    RemoveHostDirective,
    ValueSetSelectComponent,
    DatetimeInputComponent,
    AsyncPipe,
    AbreviateByListComparePipe,
    FormGroupPipe,
    FormControlPipe,
  ],
})
export class PatientObservationFormGroupComponent
  extends AbstractFormGroupComponent<IObservation>
  implements OnInit
{
  @Input() lines: 'full' | 'inset' | 'none' = 'full';
  @Input() dateTime: string | Date | undefined;

  public readonly syncDateTimeWithParent$ = new BehaviorSubject<boolean>(true);

  public observation$: Observable<IObservation> | undefined;

  // * Define and collect arrays for select lists
  public bodySite: CodeableConcept[] = [
    BODY_SITE_LEFT_SIDE,
    BODY_SITE_RIGHT_SIDE,
  ];

  public bodySiteDisplay = this.bodySite
    .map((cc) => cc.coding?.[0].display)
    .filter((s): s is string => s !== undefined);

  public now = formatISO(new Date());

  // * Define AbstractControls
  public observationFormGroup: UntypedFormGroup;
  public bodySiteFormControl: UntypedFormControl;
  public noteFormArray: UntypedFormArray;
  public componentFormArray: UntypedFormArray;

  // * Use the FormArrayHelper class module to reference FormArrays
  //   that require access for array manipulation in the template
  public componentFormArrayHelper: FormArrayHelper;
  public noteFormArrayHelper: FormArrayHelper;

  public minValues = numberSequence(0, 5, 55);

  constructor(
    protected override injector: Injector,
    private cd: ChangeDetectorRef,
    private customValidators: CustomValidatorsService,
    public modalController: ModalController,
  ) {
    super(injector);

    this.observationFormGroup = this.fb.group({
      resourceType: 'Observation',
      code: {},
      category: [{}],
      id: '',
      status: 'final',
      effectiveDateTime: [this.now, Validators.required],
      issued: this.now,
      subject: [{}, this.customValidators.objectNotEmpty],
      encounter: [{}],
    });

    this.bodySiteFormControl = this.fb.control(
      {},
      {
        validators: this.customValidators.codeableConceptNotEmpty,
      },
    );

    this.noteFormArray = this.fb.array([
      this.fb.group({
        time: formatISO(new Date()),
        text: ['', Validators.required],
      }),
    ]);

    this.componentFormArray = this.fb.array([this.fb.group({ code: {} })]);

    this.componentFormArrayHelper = new FormArrayHelper({
      formArray: this.componentFormArray,
      startLength: 0,
      maxLength: 20,
    });

    this.noteFormArrayHelper = new FormArrayHelper({
      formArray: this.noteFormArray,
      startLength: 0,
      maxLength: 1,
    });
  }

  public get bodySiteOption(): 'laterality' | 'free' {
    return codeableConceptsMatch(
      this.patchValue?.bodySite,
      BODY_SITE_LEFT_SIDE,
    ) || codeableConceptsMatch(this.patchValue?.bodySite, BODY_SITE_RIGHT_SIDE)
      ? 'laterality'
      : 'free';
  }

  ngOnInit(): void {
    // * Set controls
    this.setIndividualControls(this.observationFormGroup);
    this.setControl('component', this.componentFormArray);
    this.setControl('note', this.noteFormArray);
    if (objectHasKeys(this.patchValue, ['bodySite'])) {
      this.setControl('bodySite', this.bodySiteFormControl);
    }

    // * Set FormArray lengths with FormArrayHelper classes method setLength()
    this.componentFormArrayHelper.setLength(this.patchValue?.component?.length);
    this.noteFormArrayHelper.setLength(this.patchValue?.note?.length);

    // * PatchValues
    this.patchValueWhenFormReady();

    // * Observe form data
    this.observation$ = this.observeFormData();

    // * Observe dateTime sync
    this.syncDateTimeWithParent$
      .pipe(
        takeUntil(this.destroy$),
        tap(
          (sync) =>
            this.observationFormGroup
              .get(['effectiveDateTime'])
              ?.setValue(
                sync && this.dateTime
                  ? this.dateTime
                  : this.patchValue?.effectiveDateTime
                    ? this.patchValue.effectiveDateTime
                    : this.now,
              ),
        ),
      )
      .subscribe();
  }

  // Public methods
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

  public toggleSyncDateTime(): void {
    this.syncDateTimeWithParent$.next(!this.syncDateTimeWithParent$.getValue());
    this.notifications.showSuccess(
      this.syncDateTimeWithParent$.getValue()
        ? this.dateTime
          ? 'Encounter date & time linked!'
          : this.patchValue?.effectiveDateTime
            ? 'Date reset'
            : 'Date set to current date!'
        : this.dateTime
          ? 'Encounter date & time unlinked!'
          : 'Select a date!',
    );
  }
}
