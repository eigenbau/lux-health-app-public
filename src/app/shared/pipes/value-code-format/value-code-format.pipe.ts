import { Pipe, PipeTransform } from '@angular/core';
import { valueCodeRename } from '@core/utils/fhir/value-x-functions';
import { isNonEmptyString } from '@core/utils/string-functions';

@Pipe({
  name: 'valueCodeFormat',
  standalone: true,
})
export class ValueCodeFormatPipe implements PipeTransform {
  transform(code: string | undefined | null, quantity = 2): string {
    if (!isNonEmptyString(code)) {
      // throw new Error(
      //   'ValueCodeFormatPipe: code string is undefined or empty.',
      // );
      return '';
    }
    return valueCodeRename(code, quantity);
  }
}
