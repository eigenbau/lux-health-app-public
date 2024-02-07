import { Injectable } from '@angular/core';
import {
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms';
import { Coding } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/coding';
import {
  CodeableConcept,
  EncounterParticipant,
  Reference,
} from '@smile-cdr/fhirts/dist/FHIR-R4/classes/models-r4';

@Injectable({
  providedIn: 'root',
})
export class FormHelperService {
  constructor() {}

  public getGroup(
    abstractControl: UntypedFormGroup | UntypedFormArray,
    path?: string | (string | number)[],
  ): UntypedFormGroup {
    return path
      ? (abstractControl.get(path) as UntypedFormGroup)
      : (abstractControl as UntypedFormGroup);
  }

  public getArray(
    abstractControl: UntypedFormGroup | UntypedFormArray,
    path: string | (string | number)[],
  ): UntypedFormArray {
    return abstractControl.get(path) as UntypedFormArray;
  }

  public getControl(
    abstractControl: UntypedFormGroup | UntypedFormArray,
    path: string | (string | number)[],
  ): UntypedFormControl {
    return abstractControl.get(path) as UntypedFormControl;
  }

  public ionSelectCompareWithCoding(v1: Coding, v2: Coding): boolean {
    return v1 && v2 ? v1?.code === v2?.code : v1 === v2;
  }

  public ionSelectCompareWithCodeableConceptMultiple(
    v1: CodeableConcept,
    v2: CodeableConcept | CodeableConcept[],
  ): boolean {
    const v2Array = Array.isArray(v2) ? v2 : [v2];
    if (
      !v1 ||
      !v2 ||
      JSON.stringify(v1) === '{}' ||
      !!v2Array.find((v) => JSON.stringify(v) === '{}')
    ) {
      return !!v2Array.find((v) => JSON.stringify(v) === JSON.stringify(v1));
    }
    return !!v2Array?.find(
      (v) => v?.coding?.[0]?.code === v1?.coding?.[0]?.code,
    );
  }

  public ionSelectCompareWithReferenceMultiple(
    v1: Reference,
    v2: Reference | Reference[],
  ): boolean {
    const v2Array = Array.isArray(v2) ? v2 : [v2];
    if (
      !v1 ||
      !v2 ||
      JSON.stringify(v1) === '{}' ||
      !!v2Array.find((v) => JSON.stringify(v) === '{}')
    ) {
      return !!v2Array.find((v) => JSON.stringify(v) === JSON.stringify(v1));
    }
    return !!v2Array?.find((v) => v?.reference === v1?.reference);
  }

  public ionSelectCompareWithParticipant(
    v1: EncounterParticipant,
    v2: EncounterParticipant | EncounterParticipant[],
  ): boolean {
    // Updates ion-select with multiple selected items
    if (Array.isArray(v2)) {
      return !!v2.find(
        (v) => v.individual?.reference === v1.individual?.reference,
      );
    }
    return v1.individual?.reference === v2.individual?.reference;
  }

  public showErrorsRecursive(
    formItem: UntypedFormGroup | UntypedFormArray | UntypedFormControl,
    key: string = '',
  ): void {
    if (formItem instanceof UntypedFormControl) {
      if (formItem.invalid) {
        console.log(key, formItem.errors);
      }
      return;
    }
    if (formItem instanceof UntypedFormGroup) {
      Object.keys(formItem.controls).forEach((objKey) => {
        this.showErrorsRecursive(
          formItem.controls[objKey] as
            | UntypedFormGroup
            | UntypedFormArray
            | UntypedFormControl,
          key !== '' ? `${key} > ${objKey}` : objKey,
        );
      });
    }
    if (formItem instanceof UntypedFormArray) {
      formItem.controls.forEach((item) => {
        this.showErrorsRecursive(
          item as UntypedFormGroup | UntypedFormArray | UntypedFormControl,
          key,
        );
      });
    }
  }
}
