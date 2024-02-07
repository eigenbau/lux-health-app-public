import { TestBed } from '@angular/core/testing';

import { PersonStateService } from './person-state.service';

describe('PersonStateService', () => {
  let service: PersonStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
