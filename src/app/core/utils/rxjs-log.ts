// Based on: https://medium.com/hackernoon/the-ultimate-rxjs-operator-fae6414d5db4

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function log(
  observableName: string,
  constructorName = 'Unknown Location',
) {
  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  return function logFn<T>(source: Observable<T>) {
    if (environment.production) {
      return source;
    }
    return source.pipe(
      tap({
        next: (val) =>
          console.log(
            `%c $ ${observableName} [${constructorName}]`,
            'font-weight: bold; color: red',
            val,
          ),
        error: (err) =>
          console.error(
            `%c $ ${observableName} [${constructorName}]`,
            'font-weight: bold; color: red',
            err,
          ),
        complete: () =>
          console.log(
            `%c $ ${observableName} [${constructorName}] %c completed`,
            'font-weight: bold; color: green',
            'color: green',
          ),
      }),
    );
  };
}
