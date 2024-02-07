import { Pipe, PipeTransform } from '@angular/core';
import { UntypedFormGroup, UntypedFormArray } from '@angular/forms';
import { FormHelperService } from '@core/forms/form-helper.service';

@Pipe({
  name: 'formGroup',
  standalone: true,
})
export class FormGroupPipe implements PipeTransform {
  constructor(private fh: FormHelperService) {}

  transform(
    abstractControl: UntypedFormGroup | UntypedFormArray | undefined | null,
    path?: string | (string | number)[],
  ): UntypedFormGroup {
    if (!abstractControl)
      throw new Error('FormGroupPipe: abstractControl is null or undefined');
    return this.fh.getGroup(abstractControl, path);
  }
}
