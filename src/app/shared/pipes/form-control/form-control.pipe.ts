import { Pipe, PipeTransform } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormArray,
  UntypedFormControl,
} from '@angular/forms';
import { FormHelperService } from '@core/forms/form-helper.service';

@Pipe({
  name: 'formControl',
  standalone: true,
})
export class FormControlPipe implements PipeTransform {
  constructor(private fh: FormHelperService) {}

  transform(
    abstractControl: UntypedFormGroup | UntypedFormArray | undefined | null,
    path?: string | (string | number)[],
  ): UntypedFormControl {
    if (!abstractControl)
      throw new Error('FormControlPipe: abstractControl is null or undefined');
    return this.fh.getControl(abstractControl, path || '');
  }
}
