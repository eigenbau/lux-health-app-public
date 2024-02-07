import {
  ChangeDetectionStrategy,
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
} from '@angular/forms';
import { AbstractFormGroupComponent } from '@form-groups/abstract-form-group/abstract-form-group.component';
import { Coding } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/coding';
import { BehaviorSubject } from 'rxjs';
import { ResourceWithValueX, ValueKey } from '@models/value-x.model';
import { FormControlPipe } from '@pipes/form-control/form-control.pipe';
import { AbreviateValueXDisplayPipe } from '@pipes/abreviate-value-x-display/abreviate-value-x-display.pipe';
import { ValueCodeFormatPipe } from '@pipes/value-code-format/value-code-format.pipe';
import { IonicModule } from '@ionic/angular';
import { NgIf, AsyncPipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-value-x-form-group',
  templateUrl: './value-x-form-group.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    AsyncPipe,
    TitleCasePipe,
    ValueCodeFormatPipe,
    AbreviateValueXDisplayPipe,
    FormControlPipe,
  ],
})
export class ValueXFormGroupComponent
  extends AbstractFormGroupComponent<ResourceWithValueX>
  implements OnInit
{
  @Input() isComponent = false;
  @Input() parentCodeDisplay: Coding['display'] = '';
  @Input() lines: 'full' | 'inset' | 'none' = 'full';

  public valueKey$ = new BehaviorSubject<ValueKey | undefined>(undefined);

  public valueXFormGroup: UntypedFormGroup;

  constructor(protected override injector: Injector) {
    super(injector);

    this.valueXFormGroup = this.fb.group({
      valueString: ['', Validators.required],
      valueQuantity: this.fb.group({
        value: ['', Validators.required],
        unit: '',
        system: '',
        code: '',
      }),
    });
  }

  ngOnInit() {
    const dataType = this.patchValue
      ? this.getDataType<ResourceWithValueX, ValueKey>(this.patchValue, 'value')
      : undefined;

    if (dataType) {
      this.setValueKeyControl(dataType);
    }
    this.patchValueWhenFormReady();
  }

  private setValueKeyControl(valueKey: ValueKey) {
    this.setDataType<ValueKey>(
      valueKey,
      this.valueKey$.value,
      this.valueXFormGroup,
    );
    this.valueKey$.next(valueKey);
  }
}
