import { Observable, filter } from 'rxjs';

export const removeUndefined = <T>(
  input: Observable<T | undefined>,
): Observable<T> => input.pipe(filter((x): x is T => x !== undefined));
