import { inject, Injectable, InjectFlags, Type } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export abstract class SingletonGuardService {
  constructor(type: Type<any>) {
    // eslint-disable-next-line no-bitwise
    const parent = inject(type, InjectFlags.Optional | InjectFlags.SkipSelf);

    if (parent) {
      throw Error(`[${type.name}]: trying to create multiple instances,
      but this service should be a singleton.`);
    }
  }
}
