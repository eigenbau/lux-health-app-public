import { Pipe, PipeTransform } from '@angular/core';
import { arrayHasValue } from '@core/utils/object-functions';
import { capitalize } from '@core/utils/string-functions';

@Pipe({
  name: 'abreviateByListCompare',
  standalone: true,
})
export class AbreviateByListComparePipe implements PipeTransform {
  transform(
    str: string | undefined,
    compareArray: string[] | undefined,
  ): string {
    if (!str || !arrayHasValue(compareArray)) {
      return '';
    }
    // search for full match of str in compareArray and remove
    const compareArrayFiltered = compareArray.filter((e) => e !== str);
    const outputArray = [''];
    const words = str.split(' ');
    // compare each word to each string in compare array and remove entry if found
    words.forEach((word) => {
      if (
        compareArrayFiltered.find((compareStr) => compareStr.indexOf(word) < 0)
      ) {
        outputArray.push(word);
      }
    });

    return outputArray.map((w) => capitalize(w)).join(' ');
  }
}
