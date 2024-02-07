import { Pipe, PipeTransform } from '@angular/core';
import { objectHasKeys } from '@core/utils/object-functions';
import { ValueX, ValueXStats } from '@models/value-x.model';

@Pipe({
  name: 'valueXStats',
  standalone: true,
})
export class ValueXStatsPipe implements PipeTransform {
  transform(valueXStats: ValueXStats): ValueX[] {
    if (!objectHasKeys(valueXStats, ['min', 'max'])) {
      throw new Error('ValueXStatsPipe: valueXStats is missing min or max.');
    }
    const valueXArray = valueXStats?.min?.map((valueX, i) => {
      const value =
        valueX.value === valueXStats?.max?.[i].value
          ? valueX.value
          : `${valueX.value}-${valueXStats?.max?.[i].value}`;

      return {
        ...valueX,
        value,
      };
    });
    if (!valueXArray) {
      throw new Error('ValueXStatsPipe: valueX is undefined.');
    }
    return valueXArray;
  }
}
