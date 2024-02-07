import { TestBed } from '@angular/core/testing';

import { PatientDocumentReferenceStateService } from './patient-document-reference-state.service';

describe('PatientDocumentReferenceStateService', () => {
  let service: PatientDocumentReferenceStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientDocumentReferenceStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
