import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import {
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormControl,
  UntypedFormGroup,
} from '@angular/forms';
import { AbstractFormGroupComponent } from '@form-groups/abstract-form-group/abstract-form-group.component';
import { Period } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/period';
import { IEncounter } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IEncounter';
import { formatISO } from 'date-fns';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, startWith, takeUntil, tap } from 'rxjs/operators';
import { ENCOUNTER_SERVICE_TYPE } from '@core/config/fhir.constants';
import { CustomValidatorsService } from '@core/forms/custom-validators.service';
import { numberSequence } from '@core/utils/date-number-functions';
import {
  formatDurationFromPeriod,
  formatPeriodFromStartAndDuration,
} from '@core/utils/fhir/resource-functions';
import { FormControlPipe } from '@pipes/form-control/form-control.pipe';
import { DatetimeInputComponent } from '../../form-controls/datetime-input/datetime-input.component';
import { ValueSetSelectComponent } from '../../form-controls/value-set-select/value-set-select.component';
import { RemoveHostDirective } from '@directives/remove-host/remove-host.directive';
import { IonicModule } from '@ionic/angular';
import { isNumber } from '@core/utils/number-functions';
import { ENCOUNTER_DURATION_DEFAULT } from '@core/config/clinic.constant';

@Component({
  selector: 'app-patient-encounter-form-group',
  templateUrl: './patient-encounter-form-group.component.html',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RemoveHostDirective,
    ValueSetSelectComponent,
    DatetimeInputComponent,
    FormControlPipe,
  ],
})
export class PatientEncounterFormGroupComponent
  extends AbstractFormGroupComponent<IEncounter>
  implements OnInit, OnDestroy {
  public encounter$: Observable<IEncounter> | undefined;

  public showDetails = false;

  public now = formatISO(new Date());

  // used in form to calculate period.end, but not part of IEncounter model
  public encounterDurationFormControl = new FormControl(
    30,
    Validators.required,
  );

  public encounterFormGroup: UntypedFormGroup;

  public minValues = numberSequence(0, 5, 55);
  public durationValues = numberSequence(15, 15, 75);

  private encounterPeriodStart$: Observable<Period['start']> | undefined;

  private encounterDuration$: Observable<number> | undefined;

  private setPeriodEnd$: Observable<Period['end']> | undefined;

  constructor(
    protected override injector: Injector,
    private customValidators: CustomValidatorsService,
  ) {
    super(injector);

    this.encounterFormGroup = this.fb.group({
      // FormGroup of type IEncounter
      resourceType: 'Encounter', // static
      id: '',
      status: ['finished', Validators.required],
      class: this.fb.control({}, this.customValidators.objectNotEmpty),
      serviceType: ENCOUNTER_SERVICE_TYPE,
      subject: [{}, this.customValidators.objectNotEmpty],
      participant: [],
      appointment: [],
      period: this.fb.group({
        start: [this.now],
        end: [this.now],
      }),
    });

    const startAbstractControl = this.encounterFormGroup.get([
      'period',
      'start',
    ]);
    if (startAbstractControl) {
      this.encounterPeriodStart$ = startAbstractControl.valueChanges.pipe(
        startWith(startAbstractControl.value),
      ) as Observable<Period['start']>;

      this.encounterDuration$ =
        this.encounterDurationFormControl.valueChanges.pipe(
          map((n) => n || ENCOUNTER_DURATION_DEFAULT),
          startWith(
            isNumber(this.encounterDurationFormControl.value)
              ? this.encounterDurationFormControl.value
              : ENCOUNTER_DURATION_DEFAULT,
          ),
        );

      this.setPeriodEnd$ = combineLatest([
        this.encounterPeriodStart$,
        this.encounterDuration$,
      ]).pipe(
        map(([start, duration]) => {
          const startDate = new Date(start ? start : this.now);
          return formatPeriodFromStartAndDuration(startDate, duration).end;
        }),
      );

      // IMPORTANT: subscribe to setPeriodEnd$ prior to patching the form.
      // Otherwise, period.end will not be set after the form has been patched
      this.setPeriodEnd$
        .pipe(
          takeUntil(this.destroy$),
          tap((end) => {
            this.encounterFormGroup
              .get(['period', 'end'])
              ?.patchValue(formatISO(end as Date));
          }),
        )
        .subscribe();
    }
  }

  ngOnInit(): void {
    this.setIndividualControls(this.encounterFormGroup);
    this.patchValueWhenFormReady();

    this.encounterDurationFormControl.patchValue(
      formatDurationFromPeriod(
        this.patchValue?.period,
        this.encounterDurationFormControl.value,
      ),
    );

    // * Observe form data
    this.encounter$ = this.observeFormData();
  }
}
