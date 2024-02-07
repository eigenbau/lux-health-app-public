import { TestBed } from '@angular/core/testing';

import { DirectoryRelatedPersonStateService } from './directory-related-person-state.service';

describe('DirectoryRelatedPersonStateService', () => {
  let service: DirectoryRelatedPersonStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DirectoryRelatedPersonStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
