import {
  Component,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  Validators,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms';
import { AbstractFormGroupComponent } from '@form-groups/abstract-form-group/abstract-form-group.component';
import { ModalController, IonicModule } from '@ionic/angular';
import { BehaviorSubject, takeUntil } from 'rxjs';
import { CustomValidatorsService } from '@core/forms/custom-validators.service';
import { RemoveHostDirective } from 'src/app/shared/directives/remove-host/remove-host.directive';
import { ResourceWithValueX, ValueKey } from '@models/value-x.model';
import { FormControlPipe } from '@pipes/form-control/form-control.pipe';
import { NgIf, AsyncPipe } from '@angular/common';
import { ValueSetSelectComponent } from '../../form-controls/value-set-select/value-set-select.component';
import { RemoveHostDirective as RemoveHostDirective_1 } from '@directives/remove-host/remove-host.directive';

@Component({
  selector: 'app-template-code-and-value-form-group',
  templateUrl: './template-code-and-value-form-group.component.html',
  hostDirectives: [RemoveHostDirective],
  standalone: true,
  imports: [
    IonicModule,
    RemoveHostDirective_1,
    ValueSetSelectComponent,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    AsyncPipe,
    FormControlPipe,
  ],
})
export class TemplateCodeAndValueFormGroupComponent
  extends AbstractFormGroupComponent<ResourceWithValueX>
  implements OnInit
{
  @Input() isComponent = false;
  @Input() lines: 'full' | 'inset' | 'none' = 'inset';
  @Output() addComponentClick = new EventEmitter<MouseEvent>();
  @Output() removeComponentClick = new EventEmitter<MouseEvent>();

  public valueKey$ = new BehaviorSubject<ValueKey | undefined>(undefined);

  public codeFormGroup: UntypedFormControl;

  public valueXFormGroup: UntypedFormGroup;

  constructor(
    protected override injector: Injector,
    private customValidators: CustomValidatorsService,
    public modalController: ModalController,
  ) {
    super(injector);

    this.codeFormGroup = this.fb.control(
      {},
      { validators: this.customValidators.objectNotEmpty },
    );

    this.valueXFormGroup = this.fb.group({
      valueString: [''],
      valueQuantity: this.fb.group({
        value: [],
        unit: ['', Validators.required],
        system: ['', Validators.required],
        code: ['', Validators.required],
      }),
    });

    this.codeFormGroup.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.codeFormGroup.errors?.['codingExists'] && !this.isComponent) {
          this.notifications.presentAlertValidationError({
            header: 'Code already exists!',
            message: 'Please look for another code.',
            callback: () => {
              this.codeFormGroup.reset();
            },
          });
        }
      });
  }

  ngOnInit() {
    this.setControl('code', this.codeFormGroup);

    const dataType = this.patchValue
      ? this.getDataType<ResourceWithValueX, ValueKey>(this.patchValue, 'value')
      : undefined;

    if (dataType) {
      this.setValueKeyControl(dataType);
    }

    this.patchValueWhenFormReady({
      observablesToWaitFor: [],
      callbackFunction: () => {
        if (this.patchValue) {
          this.valueXFormGroup.patchValue(this.patchValue);
          this.codeFormGroup.patchValue(this.patchValue?.code);
          if (!this.isComponent) {
            this.codeFormGroup.setValidators(
              this.customValidators.observationTemplateDoesNotExist(
                this.patchValue,
              ),
            );
          }
        }
      },
    });
  }

  public setValueKeyControl(valueKey: ValueKey | undefined) {
    this.setDataType<ValueKey>(
      valueKey,
      this.valueKey$.value,
      this.valueXFormGroup,
    );
    this.valueKey$.next(valueKey);
  }

  public addComponent() {
    this.addComponentClick.emit();
  }

  public removeComponent(): void {
    this.removeComponentClick.emit();
  }
}
