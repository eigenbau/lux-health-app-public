import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  Input,
  OnInit,
} from '@angular/core';
import {
  Validators,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
} from '@angular/forms';
import { AbstractFormGroupComponent } from '@form-groups/abstract-form-group/abstract-form-group.component';
import { LoadingController, IonicModule } from '@ionic/angular';
import { IDocumentReference } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IDocumentReference';
import { formatISO } from 'date-fns';
import { BehaviorSubject, takeUntil, tap } from 'rxjs';
import {
  DOCUMENT_REFERENCE_ACCEPTED_FILE_TYPES,
  DOCUMENT_REFERENCE_CATEGORY_DEFAULT,
  DOCUMENT_REFERENCE_TYPE_DEFAULT,
} from '@core/config/fhir.constants';
import { CustomValidatorsService } from '@core/forms/custom-validators.service';
import { FileStorageService } from '@core/firebase/file-storage-service.service';
import { v4 as uuidv4 } from 'uuid';
import { Reference } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/reference';
import { FormControlPipe } from '@pipes/form-control/form-control.pipe';
import { DatetimeInputComponent } from '../../form-controls/datetime-input/datetime-input.component';
import { NgIf, AsyncPipe } from '@angular/common';
import { ValueSetSelectComponent } from '../../form-controls/value-set-select/value-set-select.component';
import { RemoveHostDirective } from '@directives/remove-host/remove-host.directive';

interface Event<T = EventTarget> {
  target: T;
}
@Component({
  selector: 'app-patient-document-reference-form-group',
  templateUrl: './patient-document-reference-form-group.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonicModule,
    RemoveHostDirective,
    ValueSetSelectComponent,
    NgIf,
    DatetimeInputComponent,
    FormsModule,
    ReactiveFormsModule,
    AsyncPipe,
    FormControlPipe,
  ],
})
export class PatientDocumentReferenceFormGroupComponent
  extends AbstractFormGroupComponent<IDocumentReference>
  implements OnInit
{
  @Input() lines: 'full' | 'inset' | 'none' = 'full';
  @Input() dateTime: string | Date = '';

  public readonly linkReference$ = new BehaviorSubject<boolean>(false);
  public readonly showCategory$ = new BehaviorSubject<boolean>(false);
  public readonly showStatus$ = new BehaviorSubject<boolean>(false);
  public readonly showDescription$ = new BehaviorSubject<boolean>(false);

  public readonly fileName$ = new BehaviorSubject<string | undefined>(
    undefined,
  );
  public readonly contentType$ = new BehaviorSubject<string | undefined>(
    undefined,
  );
  public readonly size$ = new BehaviorSubject<number | undefined>(undefined);
  public readonly title$ = new BehaviorSubject<string | undefined>(undefined);

  public readonly fileUploaded$ = new BehaviorSubject<boolean>(false);

  public related: Reference[] = [];

  public acceptedFileTypes = DOCUMENT_REFERENCE_ACCEPTED_FILE_TYPES;

  public now = formatISO(new Date());

  // * Define AbstractControls
  public documentReferenceFormGroup: UntypedFormGroup;

  constructor(
    protected override injector: Injector,
    private customValidators: CustomValidatorsService,
    private fileStorage: FileStorageService,
    private loadingController: LoadingController,
  ) {
    super(injector);

    this.documentReferenceFormGroup = this.fb.group({
      resourceType: 'DocumentReference',
      id: '',
      subject: [{}, this.customValidators.objectNotEmpty],
      status: ['current', Validators.required],
      type: [
        DOCUMENT_REFERENCE_TYPE_DEFAULT,
        this.customValidators.codeableConceptNotEmpty,
      ],
      category: this.fb.array(
        [DOCUMENT_REFERENCE_CATEGORY_DEFAULT],
        this.customValidators.arrayObjectNotEmpty,
      ),
      date: [this.now, Validators.required],
      description: [''],
      content: this.fb.array([
        this.fb.group({
          attachment: this.fb.group({
            url: ['', Validators.required],
            contentType: [''],
            size: [0],
            title: [''],
          }),
        }),
      ]),
      context: this.fb.group({
        related: [[]],
      }),
    });

    this.fileName$
      .pipe(
        takeUntil(this.destroy$),
        tap(
          (fileName) =>
            this.documentReferenceFormGroup
              .get(['content', 0, 'attachment', 'url'])
              ?.patchValue(fileName),
        ),
      )
      .subscribe();
    this.contentType$
      .pipe(
        takeUntil(this.destroy$),
        tap(
          (contentType) =>
            this.documentReferenceFormGroup
              .get(['content', 0, 'attachment', 'contentType'])
              ?.patchValue(contentType),
        ),
      )
      .subscribe();
    this.size$
      .pipe(
        takeUntil(this.destroy$),
        tap(
          (size) =>
            this.documentReferenceFormGroup
              .get(['content', 0, 'attachment', 'size'])
              ?.patchValue(size),
        ),
      )
      .subscribe();
    this.title$
      .pipe(
        takeUntil(this.destroy$),
        tap(
          (title) =>
            this.documentReferenceFormGroup
              .get(['content', 0, 'attachment', 'title'])
              ?.patchValue(title),
        ),
      )
      .subscribe();
  }

  ngOnInit(): void {
    // * Set controls
    this.setIndividualControls(this.documentReferenceFormGroup);

    // * PatchValues
    this.patchValueWhenFormReady();

    // * Observe encounter link
    if (this.patchValue?.context?.related) {
      this.related = this.patchValue.context.related;
    }
    this.linkReference$.next(this.related?.length > 0);

    this.linkReference$
      .pipe(
        takeUntil(this.destroy$),
        tap((link) => {
          // set related reference
          this.documentReferenceFormGroup
            .get(['context', 'related'])
            ?.setValue(link ? this.related : []);
          // try to set date time to parent, then patchValue, then now
          this.documentReferenceFormGroup
            .get('date')
            ?.setValue(
              link && this.dateTime
                ? this.dateTime
                : this.patchValue?.date
                  ? this.patchValue.date
                  : this.now,
            );
        }),
      )
      .subscribe();
  }

  // Public methods
  public toggleEncounterLink(): void {
    this.linkReference$.next(!this.linkReference$.getValue());
    this.notifications.showSuccess(
      this.linkReference$.getValue()
        ? 'Reference linked!'
        : 'Reference unlinked!',
    );
  }

  public toggleCategory(): void {
    this.showCategory$.next(!this.showCategory$.value);
  }

  public toggleStatus(): void {
    this.showStatus$.next(!this.showStatus$.value);
  }

  public toggleDescription(): void {
    this.showDescription$.next(!this.showDescription$.value);
  }

  public async uploadFile(event: Event<EventTarget | null>): Promise<void> {
    if (!event) {
      return;
    }
    const file = (event as Event<HTMLInputElement>).target.files?.[0];
    if (!file) {
      return;
    }

    const currentFile = this.documentReferenceFormGroup.get([
      'content',
      0,
      'attachment',
      'url',
    ])?.value as string;

    const loading = await this.loadingController.create();
    loading.present();

    // if a file exists -> delete existing file first
    if (currentFile) {
      try {
        await this.fileStorage.deleteFile(currentFile);
      } catch (e) {
        this.notifications.showError(`Sorry, I couldn't delete existing file.`);
        return;
      }
    }

    // Generate uuid file name
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;

    // upload file
    try {
      const results = await this.fileStorage.uploadFile(file, fileName);

      if (results) {
        this.fileUploaded$.next(true);
        this.fileName$.next(fileName);
        this.contentType$.next(file.type);
        this.size$.next(file.size);
        this.title$.next(file.name);
      }
    } catch (e) {
      this.notifications.showError(`Sorry, I couldn't upload the file.`);
    }

    loading.dismiss();

    this.notifications.showSuccess('File uploaded!');
  }

  public async deleteFile(fileName: string): Promise<void> {
    const loading = await this.loadingController.create();
    loading.present();

    try {
      const results = await this.fileStorage.deleteFile(fileName);
      if (results) {
        this.fileUploaded$.next(false);
        this.fileName$.next(undefined);
        this.contentType$.next(undefined);
        this.size$.next(0);
        this.title$.next(undefined);
      }
    } catch (e) {
      this.notifications.showError(`Sorry, I couldn't delete existing file.`);
    }

    loading.dismiss();
  }
}
