/*
Reference:

- partially based on https://ozak.medium.com/stop-repeating-yourself-in-angular-how-to-create-abstract-components-9726d43c99ab
Notes:
- Use this abstract class as a base for all FormGroup Components
- Do not implement OnDestroy() in subclass, or call this.destroy$.next() OnDestroy() in the subclass
- The FormGroup Components require a parent form
- Each component should build the FormGroups, FormArrays, and FormControls it requires
- In the template of the component only the FormGroups, FormArrays,
  and FormControls built in the component should be used as a reference
- The rootForm and parentForm should not be called or altered in the template
- The components should communicate only via @Input() which is defined in this abstract class,
  and by altering its values of the rootForm
- Transformation of the rootForm.value for e.g. API calls should happen outside of FormGroup Components
- LIMITATION: Components based on this abstract do not listen to patchValue Input() changes

Subclass pattern:
// * Match AbstractFormGroup typing, patchValue structure and the FormGroup of the sub component
// * Define and collect arrays for select lists
// * Define AbstractControls
// - These should follow a FHIR resource schema
// - Naming: add 'FormGroup' or 'FormArray' or 'FormControl' to variable name
// * Define FormArrayHelpers to access arrays for manipulation (push(), removeAt()) in the template
// - Referenced FormArrays require to be defined in the above AbstractControls
// - Naming: add 'FormArrayHelper' to name

- OnInit
// * Set controls
// - Use setControl to set AbstractControls
// - Use setIndividualControls to set children of a FormGroup as individual AbstractControls -
//   This avoids unecessary nesting
// * Set FormArray lengths with FormArrayHelper classes method setLength()
// * PatchValues by calling patchValueWhenFormReady()
// - Use the optional callbackFunction to patch specific AbstractControls,
//   this ensures that ion-select values properly display the patched values,
*/

import { Directive, Injector, Input, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  FormGroupDirective,
} from '@angular/forms';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { map, startWith, takeUntil, tap } from 'rxjs/operators';
import { FormHelperService } from '@core/forms/form-helper.service';
import { NotificationsService } from '@core/notifications/notifications.service';

@Directive()
export abstract class AbstractFormGroupComponent<
  T extends { [key: string]: any },
> implements OnDestroy
{
  @Input() parentFormPath: string | (string | number)[] | undefined = undefined;
  @Input() patchValue: T | undefined = undefined;
  @Input() autofocus = false;

  public fh: FormHelperService;

  protected notifications: NotificationsService;
  protected rootForm: FormGroupDirective;
  protected fb: UntypedFormBuilder;

  protected readonly destroy$ = new Subject<null>();

  // IONIC BUG FIX: there seems to be a delay between AfterViewInit and availability of the IonTextarea component
  // the following is an observable which emits and completes with a delay
  // this observable can be used to delay the formPatch
  // FIXME: find a solution that tests the component load status directly
  //protected ionTextareaReady$ = of(null).pipe(delay(200));

  constructor(protected injector: Injector) {
    this.fh = injector.get(FormHelperService);
    this.notifications = injector.get(NotificationsService);
    this.rootForm = injector.get(FormGroupDirective);
    this.fb = injector.get(UntypedFormBuilder);
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  // Protected methods
  // - Sets controls without a parent FormGroup
  protected setIndividualControls(formGroup: UntypedFormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      this.setControl(key, formGroup.controls[key]);
    });
  }

  protected hasControl(controlName: string): boolean {
    const parentForm = this.getParentForm();
    return parentForm.contains(controlName);
  }

  protected setControl(
    controlName: string,
    abstractControl: AbstractControl,
  ): void {
    const parentForm = this.getParentForm();
    if (!parentForm || controlName === '') {
      throw new Error('Could not find the parent FormGroup.');
    }
    parentForm.setControl(controlName, abstractControl);
  }

  protected removeControl(controlName: string): void {
    const parentForm = this.getParentForm();
    if (!parentForm || controlName === '') {
      return;
    }
    parentForm.removeControl(controlName);
  }

  protected patchValueWhenFormReady(
    init: {
      observablesToWaitFor?: Observable<any>[];
      callbackFunction?: () => void;
    } = {},
  ): void {
    const { observablesToWaitFor = [of(null)], callbackFunction } = init;

    const formReady$: Observable<boolean> = combineLatest(
      observablesToWaitFor,
    ).pipe(
      map(() => true),
      takeUntil(this.destroy$),
      //log('formReady$', this.constructor.name)
    );

    formReady$
      .pipe(
        tap({
          complete: () => {
            if (!callbackFunction && this.patchValue) {
              return this.getParentForm().patchValue(this.patchValue);
            }
            if (callbackFunction) {
              callbackFunction();
            }
          },
        }),
      )
      .subscribe();
  }
  // - setDataType & getDataType assist in managing
  //   FHIR 'Choice of Data Types' https://www.hl7.org/fhir/formats.html#choice
  protected setDataType<DataType extends string>(
    newDataType: DataType | undefined,
    previousDataType: DataType | undefined,
    dataTypeRootFormGroup: UntypedFormGroup,
  ): void {
    if (newDataType === previousDataType) {
      return;
    }
    if (previousDataType) {
      this.removeControl(previousDataType);
    }
    const abstractControl = newDataType
      ? dataTypeRootFormGroup.get(newDataType)
      : undefined;
    if (newDataType && abstractControl) {
      this.setControl(newDataType, abstractControl);
    }
  }

  protected getDataType<ResourceWithDataType, DataType extends string>(
    resource: ResourceWithDataType,
    dataTypeRoot: string,
  ): DataType | undefined {
    if (!resource) {
      throw new Error(`Could not find the resource.`);
    }
    const dataTypeKey = Object.keys(resource).find((key) =>
      key.includes(dataTypeRoot),
    ) as DataType;
    if (!dataTypeKey) {
      return;
    }
    return dataTypeKey;
  }

  protected observeFormData(): Observable<T> {
    return this.getParentForm().valueChanges.pipe(
      startWith(this.getParentForm().value),
    ) as Observable<T>;
  }

  // Private methods
  private getParentForm(): UntypedFormGroup {
    const formGroup = this.parentFormPath
      ? (this.rootForm.control.get(this.parentFormPath) as UntypedFormGroup)
      : this.rootForm.control;
    if (!formGroup) {
      throw new Error(
        `Could not find the parent FormGroup.
        Check @Input 'parentFormPath' for the correct path to parent FormGroup.`,
      );
    }
    return formGroup;
  }
}
