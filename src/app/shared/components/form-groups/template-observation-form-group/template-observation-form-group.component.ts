import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
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
import { CodeableConcept } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/codeableConcept';
import { formatISO } from 'date-fns';
import { BehaviorSubject, map, takeUntil, tap } from 'rxjs';
import { BODY_SITE_DEFAULT } from '@core/config/fhir.constants';
import { CustomValidatorsService } from '@core/forms/custom-validators.service';
import { FormHelperService } from '@core/forms/form-helper.service';
import { codeableConceptsMatch } from '@core/utils/fhir/codeable-concept-functions';
import { objectHasKeys } from '@core/utils/object-functions';
import { FormArrayHelper } from '@models/form-array-helper.model';
import { ObservationTemplate } from '@models/observation.model';
import { FormGroupPipe } from '@pipes/form-group/form-group.pipe';
import { FormControlPipe } from '@pipes/form-control/form-control.pipe';
import { ValueSetSelectComponent } from '../../form-controls/value-set-select/value-set-select.component';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { TemplateCodeAndValueFormGroupComponent } from '../template-code-and-value-form-group/template-code-and-value-form-group.component';
import { RemoveHostDirective } from '@directives/remove-host/remove-host.directive';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-template-observation-form-group',
  templateUrl: './template-observation-form-group.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonicModule,
    RemoveHostDirective,
    TemplateCodeAndValueFormGroupComponent,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    NgIf,
    ValueSetSelectComponent,
    AsyncPipe,
    FormControlPipe,
    FormGroupPipe,
  ],
})
export class TemplateObservationFormGroupComponent
  extends AbstractFormGroupComponent<ObservationTemplate>
  implements OnInit, AfterViewInit
{
  // * Define and collect arrays for select lists
  public bodySiteOptions: CodeableConcept[] = [BODY_SITE_DEFAULT, {}];

  // * Define AbstractControls
  public observationTemplateFormGroup: UntypedFormGroup;

  // If IObservation['bodySite'] is present AND empty,
  //  the child observation shows a bodySite search form
  // If IObservation['bodySite'] is filled with BODY_SITE_DEFAULT,
  //  the child observation shows a laterality selection option
  // If IObservation['bodySite'] does not exist,
  //  the child observation will display no bodySite options
  public bodySiteFormControl: UntypedFormControl;

  public noteFormArray: UntypedFormArray;

  public componentFormArray = this.fb.array([this.fb.group({})]);

  // * Use the FormArrayHelper class module to reference FormArrays
  //   that require access for array manipulation in the template
  public componentFormArrayHelper: FormArrayHelper;

  public noteFormArrayHelper: FormArrayHelper;

  public showBodySite$ = new BehaviorSubject<boolean>(false);

  constructor(
    protected override injector: Injector,
    private customValidators: CustomValidatorsService,
    private cd: ChangeDetectorRef,
  ) {
    super(injector);

    this.observationTemplateFormGroup = this.fb.group({
      resourceType: 'Observation',
      firestoreId: '',
      status: 'final',
      category: this.fb.array([
        this.fb.control(
          {},
          {
            validators: this.customValidators.objectNotEmpty,
          },
        ),
      ]),
    });

    this.bodySiteFormControl = this.fb.control({});

    this.noteFormArray = this.fb.array([
      this.fb.group({
        time: formatISO(new Date()),
        text: ['', Validators.required],
      }),
    ]);

    this.componentFormArray = this.fb.array([this.fb.group({})]);

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
  ngOnInit() {
    // * Set controls
    this.setIndividualControls(this.observationTemplateFormGroup);
    this.setControl('component', this.componentFormArray);
    this.setControl('note', this.noteFormArray);

    // * Set FormArray lengths with FormArrayHelper classes method setLength()
    this.componentFormArrayHelper.setLength(this.patchValue?.component?.length);
    this.noteFormArrayHelper.setLength(this.patchValue?.note?.length);

    // * PatchValues
    this.patchValueWhenFormReady();

    this.observeFormData()
      .pipe(
        takeUntil(this.destroy$),
        map((observationTemplate) =>
          objectHasKeys(observationTemplate, ['bodySite']),
        ),
        tap((showBodySite) => this.showBodySite$.next(showBodySite)),
      )
      .subscribe();
  }

  ngAfterViewInit(): void {
    if (objectHasKeys(this.patchValue, ['bodySite'])) {
      this.setControl('bodySite', this.bodySiteFormControl);
      this.initBodySiteOption();
    }
  }

  // public onHasBodySiteCheckboxChange(event: Event): void {
  //   const checked = (event as CheckboxCustomEvent).detail.checked;
  //   if (checked) {
  //     // add bodySite key to form
  //     this.setControl('bodySite', this.bodySiteFormControl);
  //     this.initBodySiteOption();
  //   }
  //   if (!checked) {
  //     // remove bodySite key from form
  //     this.removeControl('bodySite');
  //   }
  // }

  public toggleBodySite(): void {
    const show = !this.showBodySite$.value;
    if (show) {
      // add bodySite key to form
      this.setControl('bodySite', this.bodySiteFormControl);
      this.initBodySiteOption();
    }
    if (!show) {
      // remove bodySite key from form
      this.removeControl('bodySite');
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

  // Private methods
  private initBodySiteOption(): void {
    if (codeableConceptsMatch(this.patchValue?.bodySite, BODY_SITE_DEFAULT)) {
      this.setBodySiteOption('laterality');
    }
  }

  private setBodySiteOption(option: 'laterality' | 'free'): void {
    if (option === 'laterality') {
      this.bodySiteFormControl.setValue(BODY_SITE_DEFAULT);
    }
    if (option === 'free') {
      this.bodySiteFormControl.setValue({});
    }
  }
}
