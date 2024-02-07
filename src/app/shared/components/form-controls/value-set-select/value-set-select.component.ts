import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import {
  UntypedFormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { Coding } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/coding';
import { Observable, of, catchError, map, startWith } from 'rxjs';
import { FhirApiValueSetService } from '@core/fhir-api/fhir-api-value-set.service';
import { FormHelperService } from '@core/forms/form-helper.service';
import { ValueSetConfig } from '@models/value-set.model';
import { environment } from 'src/environments/environment';
import { ValueSetSearchModalPage } from './value-set-search-modal/value-set-search-modal.page';
import { preventSwipeToClose } from '@core/utils/ionic-functions';
import { RemoveHostDirective } from 'src/app/shared/directives/remove-host/remove-host.directive';
import { NgIf, NgFor, AsyncPipe, TitleCasePipe } from '@angular/common';
import { ValueSetContains } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/valueSetContains';

type InputInterface = 'search' | 'alert' | 'action-sheet';
@Component({
  selector: 'app-value-set-select',
  templateUrl: './value-set-select.component.html',
  hostDirectives: [RemoveHostDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    AsyncPipe,
    TitleCasePipe,
  ],
})
export class ValueSetSelectComponent implements OnInit {
  // Supply either 'coding', 'codeableConcept', or 'code' FormControl,
  // 'system' and 'display' are optional for 'code' FormControl option
  @Input() codingFormControl: UntypedFormControl | undefined;
  @Input() codeableConceptFormControl: UntypedFormControl | undefined;
  @Input() codeFormControl: UntypedFormControl | undefined;
  @Input() systemFormControl: UntypedFormControl | undefined;
  @Input() displayFormControl: UntypedFormControl | undefined;

  @Input() label: string = '';
  @Input() ariaLabel = '';
  @Input() labelPlacement:
    | 'end'
    | 'fixed'
    | 'floating'
    | 'stacked'
    | 'start'
    | '' = '';
  @Input() justify: 'end' | 'space-between' | 'start' | '' = '';
  @Input() ionSelectClass: string = '';
  @Input() ionSlot: 'start' | 'end' | 'label' | '' = '';
  @Input() placeholder: string = '';
  @Input() preferredInputInterface: InputInterface = 'alert';
  @Input() title: string = '';
  @Input() config: ValueSetConfig = {};

  public valueSet$: Observable<ValueSetContains[]> = of([]);
  public interface$!: Observable<InputInterface>;
  public selectedText$!: Observable<string>;

  private modalOpen = false; // Prevents opening of multiple instances on fast clicks

  constructor(
    private fhirApiValueSet: FhirApiValueSetService,
    public fh: FormHelperService,
    public modalController: ModalController,
  ) {}

  public get formControl(): UntypedFormControl {
    const fc = this.codeableConceptFormControl
      ? this.codeableConceptFormControl
      : this.codingFormControl
        ? this.codingFormControl
        : this.codeFormControl;
    if (fc) {
      return fc;
    }
    throw new Error(`No UntypedFormControl supplied to 'get formControl()'`);
  }

  public get formControlType(): 'codeable-concept' | 'coding' | 'code' {
    return this.codeableConceptFormControl
      ? 'codeable-concept'
      : this.codingFormControl
        ? 'coding'
        : 'code';
  }

  ngOnInit() {
    // TODO: may need to migrate this init to ngOnChange(), to ensure correct init
    // with FormControls that may be instantiated in the parent after init of this component
    const { valueSet = undefined, source = 'terminology-server' } = this.config;

    this.valueSet$ =
      source === 'local'
        ? this.fhirApiValueSet.getValueSetLocally(valueSet).pipe(
            map((vs) => vs.expansion?.contains || []),
            catchError((e) => {
              if (!environment.production) {
                console.log(e);
              }
              return of([]);
            }),
          )
        : source === 'terminology-server' &&
            this.preferredInputInterface !== 'search'
          ? this.fhirApiValueSet.getValueSet(this.config).pipe(
              map((vs) => vs.expansion?.contains || []),
              catchError((e) => {
                if (!environment.production) {
                  console.log(e);
                }
                return of([]);
              }),
            )
          : of([]);

    this.selectedText$ = this.formControl.valueChanges.pipe(
      startWith(this.formControl.value),
      map((value) =>
        this.formControlType === 'codeable-concept'
          ? value?.coding?.length > 0
            ? value?.coding[0]?.display
            : ''
          : this.formControlType === 'coding'
            ? value?.display
            : value,
      ),
    );

    this.interface$ = this.valueSet$.pipe(
      map((vs) =>
        vs?.length < 8 && this.preferredInputInterface !== 'search'
          ? 'action-sheet'
          : (vs?.length < 16 && this.preferredInputInterface !== 'search') ||
              source === 'local'
            ? 'alert'
            : 'search',
      ),
    );
  }

  public async openModal(event: MouseEvent): Promise<void> {
    event.stopImmediatePropagation();
    if (this.modalOpen) {
      return;
    }
    this.modalOpen = true;

    const config = this.config;
    const title = this.title;

    const modal = await this.modalController.create({
      component: ValueSetSearchModalPage,
      canDismiss: preventSwipeToClose,
      presentingElement: await this.modalController.getTop(),
      componentProps: { config, title },
    });

    modal.onDidDismiss().then((res) => {
      this.modalOpen = false;

      if (!res?.data) {
        return;
      }
      this.updateFormControl(res.data.coding);
    });

    return await modal.present();
  }

  private updateFormControl(coding: Coding): void {
    if (!coding) {
      return;
    }
    const formControlValue =
      this.formControlType === 'codeable-concept'
        ? { coding: [coding] }
        : this.formControlType === 'code'
          ? coding.code
          : coding;

    this.formControl.setValue(formControlValue);

    if (this.formControlType === 'code' && this.codeFormControl) {
      this.codeFormControl.setValue(coding?.code);
    }
    if (this.formControlType === 'code' && this.systemFormControl) {
      this.systemFormControl.setValue(coding?.system);
    }
    if (this.formControlType === 'code' && this.displayFormControl) {
      this.displayFormControl.setValue(coding?.display);
    }
  }
}
