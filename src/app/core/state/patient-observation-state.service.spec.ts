import { TestBed } from '@angular/core/testing';

import { PatientObservationStateService } from './patient-observation-state.service';

describe('PatientObservationStateService', () => {
  let service: PatientObservationStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientObservationStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
