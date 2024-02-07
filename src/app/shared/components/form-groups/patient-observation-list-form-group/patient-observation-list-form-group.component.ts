import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnInit,
} from '@angular/core';
import { AbstractFormGroupComponent } from '@form-groups/abstract-form-group/abstract-form-group.component';
import { Reference } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/reference';
import { IObservation } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IObservation';
import { BehaviorSubject } from 'rxjs';
import { FormArrayHelper } from '@models/form-array-helper.model';
import { ObservationTemplate } from '@models/observation.model';
import { TemplateBundle } from '@models/template.model';
import { FormGroupPipe } from '@pipes/form-group/form-group.pipe';
import { PatientObservationFormGroupComponent } from '../patient-observation-form-group/patient-observation-form-group.component';
import { IonicModule } from '@ionic/angular';
import { ObservationListComponent } from '../../observation-list/observation-list.component';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormArray,
} from '@angular/forms';
import { NgIf, AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-patient-observation-list-form-group',
  templateUrl: './patient-observation-list-form-group.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    ObservationListComponent,
    IonicModule,
    PatientObservationFormGroupComponent,
    AsyncPipe,
    FormGroupPipe,
  ],
})
export class PatientObservationListFormGroupComponent
  extends AbstractFormGroupComponent<IObservation[]>
  implements OnInit
{
  @Input() dateTime: string | Date | undefined;
  @Input({ required: true }) encounter!: Reference;
  @Input({ required: true }) subject!: Reference;

  public activeObservationIndex: number = -1;

  // An observable is used for the patchValue, so that <app-observation-list> is re-rendered with all changes
  public patchValue$ = new BehaviorSubject<IObservation[]>([]);

  // * Define AbstractControls
  public observationFormArray: UntypedFormArray;

  // * Define FormArrayHelpers to access arrays for manipulation (push(), removeAt()) in the template
  private observationFormArrayHelper: FormArrayHelper;

  constructor(
    protected override injector: Injector,
    private cd: ChangeDetectorRef,
  ) {
    super(injector);

    this.observationFormArray = this.fb.array([this.fb.group({})]);

    this.observationFormArrayHelper = new FormArrayHelper({
      formArray: this.observationFormArray,
      startLength: 0,
      maxLength: 20,
    });
  }

  ngOnInit(): void {
    this.init();
  }

  public onTemplateBundleSelected(templateBundle: TemplateBundle): void {
    // convert templateBundle.observations to observations
    const observations = templateBundle.observations.map((o) =>
      this.convertObservationTemplateToObservation(o),
    );
    this.patchValue = [
      ...(this.observationFormArray.value || []),
      ...(observations || []),
    ];

    this.init();

    // ensures that form validity is checked after new obsevation is added
    this.cd.detectChanges();
  }

  public removeObservation(index: number): void {
    this.activeObservationIndex = -1;
    const newPatchValue: IObservation[] = [...this.observationFormArray.value];
    newPatchValue.splice(index, 1);
    this.patchValue = newPatchValue;
    this.init();
  }

  public toggleObservationInput(observationIndex: number): void {
    this.activeObservationIndex =
      this.activeObservationIndex === observationIndex ? -1 : observationIndex;
  }

  // Private methods
  private init(): void {
    this.activeObservationIndex = -1;
    this.observationFormArrayHelper.resetLength();

    // * Set controls
    this.setControl('observations', this.observationFormArray);

    // * Set FormArray lengths with FormArrayHelper classes
    this.observationFormArrayHelper.setLength(this.patchValue?.length);

    this.patchValue$.next(this.patchValue || []);
  }

  private convertObservationTemplateToObservation(
    observationTemplate: ObservationTemplate,
  ): IObservation {
    const subject = this.subject;
    const encounter = this.encounter;
    return { ...observationTemplate, subject, encounter };
  }
}
