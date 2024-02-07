import { Pipe, PipeTransform } from '@angular/core';
import { UntypedFormGroup, UntypedFormArray } from '@angular/forms';
import { FormHelperService } from '@core/forms/form-helper.service';

@Pipe({
  name: 'formArray',
  standalone: true,
})
export class FormArrayPipe implements PipeTransform {
  constructor(private fh: FormHelperService) {}

  transform(
    abstractControl: UntypedFormGroup | UntypedFormArray | undefined | null,
    path?: string | (string | number)[],
  ): UntypedFormArray {
    if (!abstractControl)
      throw new Error('FormArrayPipe: abstractControl is null or undefined');
    return this.fh.getArray(abstractControl, path || '');
  }
}
