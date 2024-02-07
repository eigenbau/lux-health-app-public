import { TestBed } from '@angular/core/testing';

import { ScheduleStateService } from './schedule-state.service';

describe('ScheduleStateService', () => {
  let service: ScheduleStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScheduleStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
