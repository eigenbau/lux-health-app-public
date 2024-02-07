import { TestBed } from '@angular/core/testing';

import { ValueSetSearchStateService } from './value-set-search-state.service';

describe('ValueSetSearchStateService', () => {
  let service: ValueSetSearchStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValueSetSearchStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
