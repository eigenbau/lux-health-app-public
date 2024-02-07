import { TestBed } from '@angular/core/testing';

import { ValueSetStateService } from './value-set-state.service';

describe('ValueSetStateService', () => {
  let service: ValueSetStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValueSetStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
