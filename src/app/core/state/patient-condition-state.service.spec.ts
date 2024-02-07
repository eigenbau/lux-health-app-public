import { TestBed } from '@angular/core/testing';

import { PatientConditionStateService } from './patient-condition-state.service';

describe('PatientConditionStateService', () => {
  let service: PatientConditionStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientConditionStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
