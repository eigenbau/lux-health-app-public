import { TestBed } from '@angular/core/testing';

import { DirectoryPractitionerStateService } from './directory-practitioner-state.service';

describe('DirectoryPractitionerStateService', () => {
  let service: DirectoryPractitionerStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DirectoryPractitionerStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
