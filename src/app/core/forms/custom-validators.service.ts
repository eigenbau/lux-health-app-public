import { Injectable } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { CodeableConcept } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/codeableConcept';
import { ResourceWithValueX } from '@models/value-x.model';
import { TemplateObservationStateService } from '../state/template-observation-state.service';
import {
  codeableConceptIsEmpty,
  codeableConceptsMatch,
  hasCodeableConcept,
} from '../utils/fhir/codeable-concept-functions';

@Injectable({
  providedIn: 'root',
})
export class CustomValidatorsService {
  constructor(
    private templateObservationState: TemplateObservationStateService,
  ) {}

  public readonly objectNotEmpty: ValidatorFn = (
    control: AbstractControl,
  ): ValidationErrors | null =>
    !control.value || JSON.stringify(control.value) === '{}'
      ? { emptyObjectFormControl: true }
      : null;

  public readonly codeableConceptNotEmpty: ValidatorFn = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    const codeableConcept: CodeableConcept = control.value;
    if (codeableConceptIsEmpty(codeableConcept)) {
      return { emptyCodeableConceptFormControl: true };
    }
    return null;
  };

  public readonly arrayObjectNotEmpty: ValidatorFn = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    if (!(control instanceof FormArray)) {
      throw new Error(`'arrayObjectNotEmpty' validator is for FormArray only.`);
    }
    let validator = null;
    control.controls.forEach((element) => {
      if (JSON.stringify(element.value) === '{}') {
        validator = { emptyObjectFormArray: true };
      }
    });
    return validator;
  };

  public observationTemplateDoesNotExist(
    patchValue: ResourceWithValueX,
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const codeableConcept = control.value as CodeableConcept;
      const patchValueCode = patchValue?.code;

      if (codeableConcept?.coding?.[0]?.code === '') {
        return { inputEmpty: true };
      }
      if (codeableConceptsMatch(codeableConcept, patchValueCode)) {
        return null;
      }

      const existingCodeableConcepts = this.templateObservationState.list.map(
        (entry) => entry.code,
      );

      return hasCodeableConcept(existingCodeableConcepts, codeableConcept)
        ? { codingExists: true }
        : null;
    };
  }
}
