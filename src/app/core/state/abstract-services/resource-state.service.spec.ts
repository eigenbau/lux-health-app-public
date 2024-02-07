import { TestBed } from '@angular/core/testing';

import { ResourceStateService } from './resource-state.service';

describe('ResourceStateService', () => {
  let service: ResourceStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResourceStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
