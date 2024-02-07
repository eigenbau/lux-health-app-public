import { TestBed } from '@angular/core/testing';

import { PatientGoalStateService } from './patient-goal-state.service';

describe('PatientGoalStateService', () => {
  let service: PatientGoalStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientGoalStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
