import { TestBed } from '@angular/core/testing';

import { DirectoryPatientStateService } from './directory-patient-state.service';

describe('DirectoryPatientStateService', () => {
  let service: DirectoryPatientStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DirectoryPatientStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
