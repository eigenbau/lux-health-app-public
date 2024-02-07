import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms';

export class FormArrayHelper {
  public readonly maxLength: number;
  public readonly startLength: number;
  private readonly formArray: UntypedFormArray;

  private abstractControl: AbstractControl | null = null;

  constructor(
    private config: {
      formArray?: UntypedFormArray;
      startLength?: number;
      maxLength?: number;
    },
  ) {
    const { formArray = null, startLength = 1, maxLength = 1 } = config;

    if (!(formArray instanceof UntypedFormArray)) {
      throw new Error('The FormArrayHelper requires a valid formArray!');
    }
    this.formArray = formArray;
    this.startLength = startLength >= maxLength ? maxLength : startLength;
    this.maxLength = maxLength;

    this.init();
  }

  public push(): void {
    if (this.formArray.length >= this.maxLength) {
      return;
    }
    if (!(this.abstractControl instanceof AbstractControl)) {
      throw new Error('The FormArrayHelper requires a valid abstractControl!');
    }
    this.formArray.push(this.cloneAbstractControl(this.abstractControl));
  }

  public removeAt(i: number): void {
    if (this.formArray.length < 1) {
      return;
    }
    this.formArray.removeAt(i);
  }

  public setLength(length: number | undefined) {
    if (!length) {
      length = this.startLength;
    }
    if (this.maxLength < length) {
      length = this.maxLength;
    }
    //this.resetLength();
    while (this.formArray.controls.length > length) {
      this.formArray.controls.pop();
    }
    while (this.formArray.controls.length < length) {
      this.push();
    }
  }

  public resetLength(): void {
    while (this.formArray.controls.length > 0) {
      this.formArray.controls.pop();
      this.formArray.reset();
    }
  }

  protected init(): void {
    if (!(this.formArray instanceof UntypedFormArray)) {
      throw new Error('The FormArrayHelper requires a valid FormArray!');
    }
    this.abstractControl = this.formArray.controls[0];
    // remove all array entries
    this.resetLength();
    this.setLength(this.startLength);
  }

  // Private methods
  private cloneAbstractControl<D extends AbstractControl>(control: D): D {
    if (
      !(
        control instanceof UntypedFormGroup ||
        control instanceof UntypedFormArray ||
        control instanceof UntypedFormControl
      )
    ) {
      throw new Error('Error: unexpected control value');
    }

    let newControl: D;

    if (control instanceof UntypedFormGroup) {
      const formGroup = new UntypedFormGroup(
        {},
        control.validator,
        control.asyncValidator,
      );
      const controls = control.controls;

      Object.keys(controls).forEach((key) => {
        formGroup.addControl(key, this.cloneAbstractControl(controls[key]));
      });

      newControl = formGroup as any;
    } else if (control instanceof UntypedFormArray) {
      const formArray = new UntypedFormArray(
        [],
        control.validator,
        control.asyncValidator,
      );

      control.controls.forEach((formControl) =>
        formArray.push(this.cloneAbstractControl(formControl)),
      );

      newControl = formArray as any;
    } else if (control instanceof UntypedFormControl) {
      newControl = new UntypedFormControl(
        control.value,
        control.validator,
        control.asyncValidator,
      ) as any;
    } else {
      throw new Error(`Unsupported control type in 'FormArrayHelper'`);
    }
    if (control.disabled) {
      newControl.disable({ emitEvent: false });
    }

    return newControl;
  }
}
