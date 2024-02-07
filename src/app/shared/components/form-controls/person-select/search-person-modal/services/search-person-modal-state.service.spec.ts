import { TestBed } from '@angular/core/testing';

import { SearchPersonModalStateService } from './search-person-modal-state.service';

describe('SearchPersonModalStateService', () => {
  let service: SearchPersonModalStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchPersonModalStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
