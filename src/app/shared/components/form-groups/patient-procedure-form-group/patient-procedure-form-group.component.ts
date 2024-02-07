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
import { Period } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/period';
import { IProcedure } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IProcedure';
import { formatISO, isValid } from 'date-fns';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
  of,
  share,
  startWith,
  takeUntil,
  tap,
} from 'rxjs';
import { PROCEDURE_CATEGORY } from '@core/config/fhir.constants';
import { CustomValidatorsService } from '@core/forms/custom-validators.service';
import { numberSequence } from '@core/utils/date-number-functions';
import {
  formatDurationFromPeriod,
  formatPeriodFromStartAndDuration,
} from '@core/utils/fhir/resource-functions';
import { objectHasKeys } from '@core/utils/object-functions';
import { FormArrayHelper } from '@models/form-array-helper.model';
import { FormControlPipe } from '@pipes/form-control/form-control.pipe';
import { FormGroupPipe } from '@pipes/form-group/form-group.pipe';
import { DatetimeInputComponent } from '../../form-controls/datetime-input/datetime-input.component';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { ValueSetSelectComponent } from '../../form-controls/value-set-select/value-set-select.component';
import { RemoveHostDirective } from '@directives/remove-host/remove-host.directive';

@Component({
  selector: 'app-patient-procedure-form-group',
  templateUrl: './patient-procedure-form-group.component.html',
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
export class PatientProcedureFormGroupComponent
  extends AbstractFormGroupComponent<IProcedure>
  implements OnInit
{
  @Input() lines: 'full' | 'inset' | 'none' = 'full';
  @Input() dateTime: string | Date | undefined;
  @Input() duration: number | undefined;

  public readonly syncDateTimeWithParent$ = new BehaviorSubject<boolean>(true);
  public readonly syncDurationWithParent$ = new BehaviorSubject<boolean>(true);
  public readonly linkEncounter$ = new BehaviorSubject<boolean>(false);
  public readonly showCategory$ = new BehaviorSubject<boolean>(false);

  public effectiveTime = true;
  public showPerformedPeriod$: Observable<boolean> = of(false);

  public encounter: IProcedure['encounter'] | undefined = undefined;

  public now = formatISO(new Date());
  public procedure$: Observable<IProcedure> | undefined;

  // * Define AbstractControls
  public procedureFormGroup: UntypedFormGroup;

  public performedPeriodFormControl: UntypedFormGroup;

  // used in form to calculate period.end, but not part of IEncounter model
  public durationFormControl: UntypedFormControl;

  public bodySiteFormArray: UntypedFormArray;

  public noteFormArray: UntypedFormArray;

  // * Use the FormArrayHelper class module to reference FormArrays
  //   that require access for array manipulation in the template
  public bodySiteFormArrayHelper: FormArrayHelper;

  public noteFormArrayHelper: FormArrayHelper;

  public minValues = numberSequence(0, 5, 55);
  public durationValues = numberSequence(0, 5, 60);

  private performedPeriodStart$: Observable<Period['start']> | undefined;

  private duration$: Observable<number> | undefined;

  private setPeriodEnd$: Observable<Period['end']> | undefined;

  constructor(
    protected override injector: Injector,
    private customValidators: CustomValidatorsService,
    private cd: ChangeDetectorRef,
    public modalController: ModalController,
  ) {
    super(injector);

    this.procedureFormGroup = this.fb.group({
      resourceType: 'Procedure',
      code: [{}, this.customValidators.objectNotEmpty],
      category: [PROCEDURE_CATEGORY, Validators.required],
      id: '',
      status: 'completed',
      subject: [{}, this.customValidators.objectNotEmpty],
      encounter: [{}],
    });

    this.performedPeriodFormControl = this.fb.group({
      start: [, Validators.required],
      end: [, Validators.required],
    });

    // used in form to calculate period.end, but not part of IEncounter model
    this.durationFormControl = this.fb.control(0, Validators.required);

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

    const startAbstractControl = this.performedPeriodFormControl.get(['start']);
    if (startAbstractControl) {
      this.performedPeriodStart$ = startAbstractControl.valueChanges.pipe(
        startWith(startAbstractControl.value),
        share(),
      ) as Observable<Period['start']>;

      this.duration$ = this.durationFormControl.valueChanges.pipe(
        startWith(this.durationFormControl.value),
        share(),
      ) as Observable<number>;

      this.setPeriodEnd$ = combineLatest([
        this.performedPeriodStart$,
        this.duration$,
      ]).pipe(
        map(([start, duration]) => {
          const startDate = new Date(start ? start : this.now);
          return formatPeriodFromStartAndDuration(startDate, duration).end;
        }),
      );

      // IMPORTANT: subscribe to setPeriodEnd$ in constructor.
      // Otherwise, period.end will not be set when form is patched or dateTime @Input() is set
      this.setPeriodEnd$
        .pipe(
          takeUntil(this.destroy$),
          tap((end) => {
            if (isValid(end)) {
              this.performedPeriodFormControl
                .get(['end'])
                ?.patchValue(formatISO(end as Date));
            }
          }),
        )
        .subscribe();
    }
  }

  ngOnInit(): void {
    // * Set controls
    this.setIndividualControls(this.procedureFormGroup);
    this.setControl('note', this.noteFormArray);
    this.setControl('bodySite', this.bodySiteFormArray);
    if (objectHasKeys(this.patchValue, ['performedPeriod'])) {
      this.showPerformedPeriod(true);
    }

    // * Set FormArray lengths with FormArrayHelper classes method setLength()
    this.bodySiteFormArrayHelper.setLength(this.patchValue?.bodySite?.length);
    this.noteFormArrayHelper.setLength(this.patchValue?.note?.length);

    // * PatchValues
    this.patchValueWhenFormReady();
    this.durationFormControl.patchValue(
      formatDurationFromPeriod(
        this.patchValue?.performedPeriod,
        this.durationFormControl.value,
      ),
    );

    // * Observe form data
    this.procedure$ = this.observeFormData();

    // * Observe encounter link
    this.encounter = this.patchValue?.encounter;
    this.linkEncounter$.next(!!this.encounter?.reference);

    this.linkEncounter$
      .pipe(
        takeUntil(this.destroy$),
        tap(
          (link) =>
            this.procedureFormGroup
              .get('encounter')
              ?.setValue(link ? this.encounter : {}),
        ),
      )
      .subscribe();

    this.showPerformedPeriod$ = this.observeFormData().pipe(
      map(() => this.hasControl('performedPeriod')),
      distinctUntilChanged(),
    );

    // * Observe dateTime sync
    this.syncDateTimeWithParent$.next(this.dateTime ? true : false);

    this.syncDateTimeWithParent$
      .pipe(
        takeUntil(this.destroy$),
        tap(
          (sync) =>
            this.performedPeriodFormControl
              .get(['start'])
              ?.setValue(
                sync && this.dateTime
                  ? this.dateTime
                  : this.patchValue?.performedPeriod?.start
                    ? this.patchValue?.performedPeriod?.start
                    : this.now,
              ),
        ),
      )
      .subscribe();

    // * Observe duration sync
    this.syncDurationWithParent$
      .pipe(
        takeUntil(this.destroy$),
        tap((sync) =>
          this.durationFormControl.setValue(
            sync && this.duration
              ? this.duration
              : this.patchValue?.performedPeriod
                ? formatDurationFromPeriod(this.patchValue.performedPeriod)
                : 0,
          ),
        ),
      )
      .subscribe();
  }

  public toggleCategory(): void {
    this.showCategory$.next(!this.showCategory$.value);
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

  public toggleSyncDateTime(): void {
    this.syncDateTimeWithParent$.next(!this.syncDateTimeWithParent$.getValue());
    this.notifications.showSuccess(
      this.syncDateTimeWithParent$.getValue()
        ? 'Encounter date & time linked!'
        : 'Encounter date & time unlinked!',
    );
  }

  public toggleSyncDuration(): void {
    this.syncDurationWithParent$.next(!this.syncDurationWithParent$.getValue());
    if (this.linkEncounter$.getValue()) {
      this.notifications.showSuccess(
        this.syncDurationWithParent$.getValue()
          ? 'Encounter duration linked!'
          : 'Encounter duration unlinked!',
      );
    }
  }

  public togglePerformedPeriod(): void {
    const hasPerformedPeriod = this.hasControl('performedPeriod');
    this.showPerformedPeriod(!hasPerformedPeriod);
    this.notifications.showSuccess(
      hasPerformedPeriod
        ? 'Procedure period removed'
        : 'Procedure period added',
    );
  }

  public onDurationSelect(event: Event): void {
    event.preventDefault();
  }

  public toggleEffectiveTime(): void {
    this.effectiveTime = !this.effectiveTime;
  }

  // Private methods
  private showPerformedPeriod(show: boolean): void {
    if (!show) {
      return this.removeControl('performedPeriod');
    }
    this.setControl('performedPeriod', this.performedPeriodFormControl);
  }
}
