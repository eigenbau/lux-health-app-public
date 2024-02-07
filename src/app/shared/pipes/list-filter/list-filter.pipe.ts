import { Pipe, PipeTransform } from '@angular/core';
import { filterByString, sortByString } from '@core/utils/object-functions';

@Pipe({
  name: 'listFilter',
  standalone: true,
})
export class ListFilterPipe implements PipeTransform {
  transform<T extends object>(
    list: T[] | undefined | null,
    propPath: (string | number)[],
    filterString?: string | undefined | null,
  ): T[] {
    if (!list || list.length === 0) {
      return [];
    }
    return sortByString(
      filterByString(list, propPath, filterString || ''),
      propPath,
    );
  }
}
