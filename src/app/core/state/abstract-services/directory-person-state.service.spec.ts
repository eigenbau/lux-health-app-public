import { TestBed } from '@angular/core/testing';

import { DirectoryPersonStateService } from './directory-person-state.service';

describe('DirectoryPersonStateService', () => {
  let service: DirectoryPersonStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DirectoryPersonStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
