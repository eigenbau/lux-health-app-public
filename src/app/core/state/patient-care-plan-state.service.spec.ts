import { TestBed } from '@angular/core/testing';

import { PatientCarePlanStateService } from './patient-care-plan-state.service';

describe('PatientCarePlanStateService', () => {
  let service: PatientCarePlanStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientCarePlanStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
