import { TestBed } from '@angular/core/testing';

import { SingletonGuardService } from './singleton-guard.service';

describe('SingletonGuardService', () => {
  let service: SingletonGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SingletonGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
