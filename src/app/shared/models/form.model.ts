import { FormGroup, FormControl } from '@angular/forms';

export type FormGroupFor<T extends Record<string, any>> = {
  [K in keyof T]: T[K] extends Record<any, any>
    ? FormGroup<FormGroupFor<T[K]>>
    : FormControl<T[K]>;
};

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
