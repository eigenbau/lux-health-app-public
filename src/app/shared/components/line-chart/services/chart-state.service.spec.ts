import { TestBed } from '@angular/core/testing';

import { ChartStateService } from './chart-state.service';

describe('ChartStateService', () => {
  let service: ChartStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChartStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
