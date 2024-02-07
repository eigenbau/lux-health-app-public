import { Injectable, Injector } from '@angular/core';
import { IDocumentReference } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IDocumentReference';
import {
  takeUntil,
  tap,
  switchMap,
  of,
  Observable,
  from,
  concatMap,
} from 'rxjs';
import { FileStorageService } from '../firebase/file-storage-service.service';
import {
  ResourceState,
  initialResourceState,
  ResourceStateService,
} from './abstract-services/resource-state.service';
import { PatientStateService } from './patient-state.service';
import { PubSubService } from '@core/firebase/pub-sub.service';
interface DocumentReferenceState extends ResourceState {
  documentReferenceId: string;
  filter: {
    code: string;
  };
}

const initialDocumentReferenceState = (
  patientId: string = '',
): DocumentReferenceState => ({
  ...initialResourceState,
  documentReferenceId: '',
  filter: {
    code: '',
  },
  settings: {
    resourceType: 'DocumentReference',
    params: {
      subject: `Patient/${patientId}`,
      _count: 1000,
      _sort: '-date,code',
    },
  },
});
@Injectable({
  providedIn: 'root',
})
export class PatientDocumentReferenceStateService extends ResourceStateService<DocumentReferenceState> {
  public readonly documentReferenceList$ = this.select(
    (state) => state.entry?.map((e) => e?.resource as IDocumentReference) || [],
  );

  public readonly documentReference$ = this.select(
    (state) =>
      state?.entry?.find(
        (entry) => entry?.resource?.id === state.documentReferenceId,
      )?.resource as IDocumentReference,
  );

  constructor(
    protected override injector: Injector,
    private patientState: PatientStateService,
    private pubSub: PubSubService,
    private fileStorage: FileStorageService,
  ) {
    super(initialDocumentReferenceState(), injector);
    this.observePatientId()
      .pipe(
        takeUntil(this.destroy$),
        tap((patientId) => {
          this.setState({
            ...initialDocumentReferenceState(patientId),
            documentReferenceId: this.state.documentReferenceId,
          });
        }),
        switchMap((patientId) => {
          if (patientId) {
            return this.getList();
          }
          return of(false);
        }),
      )
      .subscribe();

    this.pubSub
      .observeFhirUpdates({
        resourceType: 'DocumentReference',
        patient: this.patientState.patient$,
      })
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.getList()),
      )
      .subscribe();
  }

  // Public methods
  public setDocumentReferenceId(documentReferenceId: string): void {
    if (this.state.documentReferenceId !== documentReferenceId) {
      this.setState({ documentReferenceId });
    }
  }

  public override deleteResource(id: string): Observable<boolean> {
    // get fileName
    const fileName = (
      this.state?.entry?.find((e) => e?.resource?.id === id)
        ?.resource as IDocumentReference
    )?.content[0]?.attachment?.url;

    if (!fileName) {
      // console.error(
      //   `Sorry, I can't delete the resource. No filename was supplied.`
      // );
      return of(false);
    }
    // Check if file exists
    return from(this.fileStorage.getFileUrl(fileName)).pipe(
      concatMap((documentUrl) =>
        // if file does not exist, return true, so that related Fhir resource will be deleted as well
        documentUrl ? from(this.fileStorage.deleteFile(fileName)) : of(true),
      ),
      // only delete Fhir resource if file does not exist, or was deleted successfully
      concatMap((fileDeleted) =>
        fileDeleted
          ? this.fhirApi.deleteFhirResource(
              this.state.settings.resourceType,
              id,
            )
          : of(false),
      ),
      concatMap((success) => (success ? of(true) : of(false))),
    );
  }

  // Private methods
  // - Observers of backend input
  private observePatientId(): Observable<string> {
    return this.patientState.patientId$;
  }
}
